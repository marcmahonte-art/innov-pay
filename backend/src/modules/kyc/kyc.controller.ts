import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'Upload a KYC document file path' })
  @ApiResponse({ status: 201, description: 'Document uploaded' })
  uploadDocument(
    @GetUser('merchantId') merchantId: string,
    @Body() body: { type: KycDocumentType; fileUrl: string },
  ) {
    return this.kycService.uploadDocument(merchantId, body.type, body.fileUrl);
  }

  @Get('documents')
  @Roles(UserRole.MERCHANT_OWNER, UserRole.MERCHANT_ADMIN, UserRole.DEVELOPER, UserRole.SUPPORT)
  @ApiOperation({ summary: 'Get merchant KYC state and documents list' })
  getDocuments(@GetUser('merchantId') merchantId: string) {
    return this.kycService.getMerchantDocuments(merchantId);
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
