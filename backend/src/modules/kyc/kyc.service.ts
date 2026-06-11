import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { KycDocumentType, KycStatus } from '@prisma/client';

@Injectable()
export class KycService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Upload a new KYC Document URL and trigger PENDING status on merchant profile
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

    return {
      kycStatus: merchant.kycStatus,
      documents,
    };
  }

  // --- Administrative KYC Decisioning Workflow (Admin-Only) ---

  async approveDocument(documentId: string, notes?: string) {
    const doc = await this.prisma.kycDocument.findUnique({
      where: { id: documentId },
    });

    if (!doc) {
      throw new NotFoundException('KYC Document not found');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Approve document
      const updatedDoc = await tx.kycDocument.update({
        where: { id: documentId },
        data: { status: KycStatus.APPROVED, notes },
      });

      // 2. Scan all merchant's documents.
      // We want to auto-approve the merchant's global KYC status if they have at least 3 core documents approved
      // Core types required in CEMAC/Chad: RCCM (Commerce registry), NIF (Tax certificate), ID_CARD (Manager ID)
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

      return updatedDoc;
    });
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

    return this.prisma.$transaction(async (tx) => {
      // 1. Reject document
      const updatedDoc = await tx.kycDocument.update({
        where: { id: documentId },
        data: { status: KycStatus.REJECTED, notes },
      });

      // 2. Set merchant status to REJECTED
      await tx.merchant.update({
        where: { id: doc.merchantId },
        data: { kycStatus: KycStatus.REJECTED },
      });

      return updatedDoc;
    });
  }

  /**
   * Admin-Only: Retrieve all pending KYC applications in the system
   */
  async getPendingKycApplications() {
    return this.prisma.merchant.findMany({
      where: { kycStatus: KycStatus.PENDING },
      include: {
        kycDocs: true,
      },
    });
  }
}
