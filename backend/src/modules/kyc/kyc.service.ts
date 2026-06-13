import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { KycDocumentType, KycStatus, UserRole } from '@prisma/client';
import { StorageService } from '../storage/storage.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class KycService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    private readonly mailService: MailService,
  ) {}

  /**
   * Upload a new KYC Document to Cloudflare R2 and trigger PENDING status on merchant profile
   */
  async uploadAndSaveDocument(
    merchantId: string,
    type: KycDocumentType,
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
    fileSize: number,
  ) {
    // 1. File validation
    const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedMimeTypes.includes(mimeType)) {
      throw new BadRequestException('Invalid file type. Only PDF, JPEG, and PNG are allowed.');
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (fileSize > maxSize) {
      throw new BadRequestException('File is too large. Maximum size allowed is 10MB.');
    }

    // 2. Generate unique key/path in R2
    const cleanedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `kyc/${merchantId}/${type}/${Date.now()}_${cleanedFileName}`;

    // 3. Upload to R2 (or fallback to mock if R2 is not configured)
    const uploadedKey = await this.storageService.uploadFile(fileBuffer, key, mimeType);

    // 4. Save metadata to DB
    return this.uploadDocument(merchantId, type, uploadedKey);
  }

  /**
   * Save document record in DB
   */
  async uploadDocument(merchantId: string, type: KycDocumentType, fileUrl: string) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { id: merchantId },
    });

    if (!merchant) {
      throw new NotFoundException('Merchant not found');
    }

    // Save document
    const doc = await this.prisma.kycDocument.create({
      data: {
        merchantId,
        type,
        fileUrl,
        status: KycStatus.PENDING,
      },
    });

    // Update merchant status to PENDING verification if currently UNVERIFIED or REJECTED
    if (merchant.kycStatus === KycStatus.UNVERIFIED || merchant.kycStatus === KycStatus.REJECTED) {
      await this.prisma.merchant.update({
        where: { id: merchantId },
        data: { kycStatus: KycStatus.PENDING },
      });
    }

    return doc;
  }

  /**
   * Retrieve merchant documents, adding presigned URLs
   */
  async getMerchantDocuments(merchantId: string) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { id: merchantId },
      select: { kycStatus: true },
    });

    if (!merchant) {
      throw new NotFoundException('Merchant not found');
    }

    const documents = await this.prisma.kycDocument.findMany({
      where: { merchantId },
      orderBy: { createdAt: 'desc' },
    });

    const docsWithUrls = await Promise.all(
      documents.map(async (doc) => {
        const presignedUrl = await this.storageService.getPresignedUrl(doc.fileUrl);
        return {
          ...doc,
          presignedUrl,
        };
      })
    );

    return {
      kycStatus: merchant.kycStatus,
      documents: docsWithUrls,
    };
  }

  /**
   * Generate a presigned preview URL for a specific document with auth checks
   */
  async getPresignedDocumentUrl(
    merchantId: string,
    documentId: string,
    userRole: UserRole,
    userMerchantId?: string,
  ): Promise<string> {
    const doc = await this.prisma.kycDocument.findUnique({
      where: { id: documentId },
    });

    if (!doc) {
      throw new NotFoundException('KYC Document not found');
    }

    // Access Control: Admins can preview any document. Merchants can only preview their own.
    const isAdmin = userRole === UserRole.SUPER_ADMIN || userRole === UserRole.ADMIN;
    if (!isAdmin && doc.merchantId !== userMerchantId) {
      throw new BadRequestException('Unauthorized access to this document');
    }

    return this.storageService.getPresignedUrl(doc.fileUrl);
  }

  // --- Administrative KYC Decisioning Workflow (Admin-Only) ---

  async approveDocument(documentId: string, notes?: string) {
    const doc = await this.prisma.kycDocument.findUnique({
      where: { id: documentId },
    });

    if (!doc) {
      throw new NotFoundException('KYC Document not found');
    }

    const updatedDoc = await this.prisma.$transaction(async (tx) => {
      // 1. Approve document
      const docUpdated = await tx.kycDocument.update({
        where: { id: documentId },
        data: { status: KycStatus.APPROVED, notes },
      });

      // 2. Scan all merchant's documents.
      // We want to auto-approve the merchant's global KYC status if they have at least 3 core documents approved
      // Core types required in CEMAC/Chad: RCCM, NIF, ID_CARD
      const allMerchantDocs = await tx.kycDocument.findMany({
        where: { merchantId: doc.merchantId },
      });

      const approvedTypes = allMerchantDocs
        .filter((d) => d.status === KycStatus.APPROVED)
        .map((d) => d.type);

      const hasRccm = approvedTypes.includes(KycDocumentType.RCCM);
      const hasNif = approvedTypes.includes(KycDocumentType.NIF);
      const hasId = approvedTypes.includes(KycDocumentType.ID_CARD);

      if (hasRccm && hasNif && hasId) {
        await tx.merchant.update({
          where: { id: doc.merchantId },
          data: { kycStatus: KycStatus.APPROVED },
        });
      }

      return docUpdated;
    });

    // Fetch updated merchant status to notify
    const merchant = await this.prisma.merchant.findUnique({
      where: { id: doc.merchantId },
    });

    if (merchant) {
      const emailStatus = merchant.kycStatus === KycStatus.APPROVED ? 'APPROVED' : 'PENDING';
      const detailNotes = merchant.kycStatus === KycStatus.APPROVED
        ? 'Votre compte marchand est maintenant pleinement approuvé en production !'
        : `Le document de type ${doc.type} a été approuvé. D'autres documents restent en cours de vérification.`;

      this.mailService.sendKycStatusEmail(merchant.email, emailStatus as any, detailNotes);
    }

    return updatedDoc;
  }

  async rejectDocument(documentId: string, notes: string) {
    if (!notes) {
      throw new BadRequestException('Rejection notes are required to explain the decline reason');
    }

    const doc = await this.prisma.kycDocument.findUnique({
      where: { id: documentId },
    });

    if (!doc) {
      throw new NotFoundException('KYC Document not found');
    }

    const updatedDoc = await this.prisma.$transaction(async (tx) => {
      // 1. Reject document
      const docUpdated = await tx.kycDocument.update({
        where: { id: documentId },
        data: { status: KycStatus.REJECTED, notes },
      });

      // 2. Set merchant status to REJECTED
      await tx.merchant.update({
        where: { id: doc.merchantId },
        data: { kycStatus: KycStatus.REJECTED },
      });

      return docUpdated;
    });

    const merchant = await this.prisma.merchant.findUnique({
      where: { id: doc.merchantId },
    });

    if (merchant) {
      this.mailService.sendKycStatusEmail(merchant.email, 'REJECTED', notes);
    }

    return updatedDoc;
  }

  /**
   * Admin-Only: Retrieve all pending KYC applications in the system, with presigned URLs
   */
  async getPendingKycApplications() {
    const merchants = await this.prisma.merchant.findMany({
      where: { kycStatus: KycStatus.PENDING },
      include: {
        kycDocs: true,
      },
    });

    return Promise.all(
      merchants.map(async (merchant) => {
        const docsWithUrls = await Promise.all(
          merchant.kycDocs.map(async (doc) => {
            const presignedUrl = await this.storageService.getPresignedUrl(doc.fileUrl);
            return {
              ...doc,
              presignedUrl,
            };
          })
        );
        return {
          ...merchant,
          kycDocs: docsWithUrls,
        };
      })
    );
  }
}
