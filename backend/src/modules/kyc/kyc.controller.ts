import { Controller, Get, Post, Body, Param, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { KycService } from './kyc.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/user.decorator';
import { UserRole, KycDocumentType } from '@prisma/client';

@ApiTags('KYC Compliance')
@Controller('kyc')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class KycController {
  constructor(private readonly kycService: KycService) {}

  @Post('upload')
  @Roles(UserRole.MERCHANT_OWNER, UserRole.MERCHANT_ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a KYC document file (PDF, PNG, JPG, <= 10MB)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: Object.values(KycDocumentType) },
        file: { type: 'string', format: 'binary' },
      },
      required: ['type', 'file'],
    },
  })
  @ApiResponse({ status: 201, description: 'Document uploaded' })
  async uploadDocument(
    @GetUser('merchantId') merchantId: string,
    @Body('type') type: KycDocumentType,
    @UploadedFile() file: any,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    return this.kycService.uploadAndSaveDocument(
      merchantId,
      type,
      file.buffer,
      file.originalname,
      file.mimetype,
      file.size,
    );
  }

  @Get('documents')
  @Roles(UserRole.MERCHANT_OWNER, UserRole.MERCHANT_ADMIN, UserRole.DEVELOPER, UserRole.SUPPORT)
  @ApiOperation({ summary: 'Get merchant KYC state and documents list' })
  getDocuments(@GetUser('merchantId') merchantId: string) {
    return this.kycService.getMerchantDocuments(merchantId);
  }

  @Get('documents/:id/preview')
  @Roles(
    UserRole.MERCHANT_OWNER,
    UserRole.MERCHANT_ADMIN,
    UserRole.DEVELOPER,
    UserRole.SUPPORT,
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
  )
  @ApiOperation({ summary: 'Get a temporary presigned preview URL for a KYC document' })
  async previewDocument(
    @Param('id') docId: string,
    @GetUser('role') role: UserRole,
    @GetUser('merchantId') merchantId: string,
  ) {
    const url = await this.kycService.getPresignedDocumentUrl(merchantId, docId, role, merchantId);
    return { url };
  }

  // --- Administrative KYC Decisioning (Admin-Only) ---

  @Get('pending')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Admin: Get all pending merchant KYC profiles' })
  getPendingKyc() {
    return this.kycService.getPendingKycApplications();
  }

  @Post('documents/:id/approve')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Admin: Approve a merchant KYC document' })
  approveDoc(
    @Param('id') docId: string,
    @Body() body: { notes?: string },
  ) {
    return this.kycService.approveDocument(docId, body.notes);
  }

  @Post('documents/:id/reject')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Admin: Reject a merchant KYC document' })
  rejectDoc(
    @Param('id') docId: string,
    @Body() body: { notes: string },
  ) {
    return this.kycService.rejectDocument(docId, body.notes);
  }
}
