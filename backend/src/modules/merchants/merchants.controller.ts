import { Controller, Get, Patch, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MerchantsService } from './merchants.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/user.decorator';
import { UserRole } from '@prisma/client';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@ApiTags('Merchant Management')
@Controller('merchants')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class MerchantsController {
  constructor(
    private readonly merchantsService: MerchantsService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  @Get('profile')
  @Roles(UserRole.MERCHANT_OWNER, UserRole.MERCHANT_ADMIN, UserRole.DEVELOPER, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Retrieve merchant profile details' })
  getProfile(@GetUser('merchantId') merchantId: string) {
    return this.merchantsService.getProfile(merchantId);
  }

  @Patch('profile')
  @Roles(UserRole.MERCHANT_OWNER, UserRole.MERCHANT_ADMIN)
  @ApiOperation({ summary: 'Update merchant profile' })
  updateProfile(
    @GetUser('merchantId') merchantId: string,
    @Body() body: { businessName?: string; phone?: string; address?: string },
  ) {
    return this.merchantsService.updateProfile(merchantId, body);
  }

  @Get('dashboard')
  @Roles(UserRole.MERCHANT_OWNER, UserRole.MERCHANT_ADMIN, UserRole.DEVELOPER, UserRole.SUPPORT)
  @ApiOperation({ summary: 'Get dashboard statistics' })
  getDashboard(
    @GetUser('merchantId') merchantId: string,
    @Query('isLive') isLive?: boolean,
  ) {
    return this.merchantsService.getDashboardStats(merchantId, isLive);
  }

  @Get('api-keys')
  @Roles(UserRole.MERCHANT_OWNER, UserRole.DEVELOPER)
  @ApiOperation({ summary: 'Retrieve all active public API keys' })
  getApiKeys(@GetUser('merchantId') merchantId: string) {
    return this.merchantsService.getApiKeys(merchantId);
  }

  @Post('api-keys')
  @Roles(UserRole.MERCHANT_OWNER, UserRole.DEVELOPER)
  @ApiOperation({ summary: 'Generate a new API key pair' })
  generateApiKey(
    @GetUser('merchantId') merchantId: string,
    @Body() body: { isLive: boolean },
  ) {
    return this.merchantsService.generateApiKey(merchantId, body.isLive);
  }

  @Post('api-keys/:id/rotate')
  @Roles(UserRole.MERCHANT_OWNER, UserRole.DEVELOPER)
  @ApiOperation({ summary: 'Rotate an API key pair' })
  rotateApiKey(
    @GetUser('merchantId') merchantId: string,
    @Param('id') keyId: string,
  ) {
    return this.merchantsService.rotateApiKey(merchantId, keyId);
  }

  @Delete('api-keys/:id')
  @Roles(UserRole.MERCHANT_OWNER, UserRole.DEVELOPER)
  @ApiOperation({ summary: 'Revoke an API key pair' })
  revokeApiKey(
    @GetUser('merchantId') merchantId: string,
    @Param('id') keyId: string,
  ) {
    return this.merchantsService.revokeApiKey(merchantId, keyId);
  }

  // --- Team Management ---

  @Get('team')
  @Roles(UserRole.MERCHANT_OWNER, UserRole.MERCHANT_ADMIN)
  @ApiOperation({ summary: 'Get team members' })
  getTeam(@GetUser('merchantId') merchantId: string) {
    return this.merchantsService.getTeam(merchantId);
  }

  @Post('team/invite')
  @Roles(UserRole.MERCHANT_OWNER, UserRole.MERCHANT_ADMIN)
  @ApiOperation({ summary: 'Invite a team member' })
  inviteTeamMember(
    @GetUser('merchantId') merchantId: string,
    @Body() body: { email: string; name: string; role: UserRole },
  ) {
    return this.merchantsService.inviteTeamMember(merchantId, body.email, body.name, body.role);
  }

  @Patch('team/:userId')
  @Roles(UserRole.MERCHANT_OWNER, UserRole.MERCHANT_ADMIN)
  @ApiOperation({ summary: 'Update a team member' })
  updateTeamMember(
    @GetUser('merchantId') merchantId: string,
    @Param('userId') userId: string,
    @Body() body: { role?: UserRole; isActive?: boolean },
  ) {
    return this.merchantsService.updateTeamMember(merchantId, userId, body);
  }

  @Delete('team/:userId')
  @Roles(UserRole.MERCHANT_OWNER, UserRole.MERCHANT_ADMIN)
  @ApiOperation({ summary: 'Delete/remove a team member' })
  deleteTeamMember(
    @GetUser('merchantId') merchantId: string,
    @Param('userId') userId: string,
  ) {
    return this.merchantsService.deleteTeamMember(merchantId, userId);
  }

  @Get('audit-logs')
  @Roles(UserRole.MERCHANT_OWNER, UserRole.MERCHANT_ADMIN)
  @ApiOperation({ summary: 'Get merchant audit logs' })
  getAuditLogs(@GetUser('merchantId') merchantId: string) {
    return this.auditLogsService.getLogsForMerchant(merchantId);
  }

  @Get('analytics')
  @Roles(UserRole.MERCHANT_OWNER, UserRole.MERCHANT_ADMIN, UserRole.COMPTABLE)
  @ApiOperation({ summary: 'Get advanced analytics dashboard' })
  getAdvancedAnalytics(@GetUser('merchantId') merchantId: string) {
    return this.merchantsService.getAdvancedAnalytics(merchantId);
  }

  @Post('topup')
  @Roles(UserRole.MERCHANT_OWNER, UserRole.MERCHANT_ADMIN)
  @ApiOperation({ summary: 'Top up merchant balance (simulation)' })
  async topupBalance(
    @GetUser('merchantId') merchantId: string,
    @Body() body: { amount: number },
  ) {
    return this.merchantsService.topupBalance(merchantId, Number(body.amount));
  }
}
