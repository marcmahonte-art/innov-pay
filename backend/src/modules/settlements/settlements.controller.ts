import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SettlementsService } from './settlements.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Settlements & Payouts')
@Controller('settlements')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SettlementsController {
  constructor(private readonly settlementsService: SettlementsService) {}

  @Post('request')
  @Roles(UserRole.MERCHANT_OWNER, UserRole.MERCHANT_ADMIN)
  @ApiOperation({ summary: 'Request settlement of successful transactions' })
  @ApiResponse({ status: 201, description: 'Settlement request created' })
  requestSettlement(
    @GetUser('merchantId') merchantId: string,
    @Body() body: { payoutPhone?: string; bankDetails?: any },
  ) {
    return this.settlementsService.createSettlementRequest(merchantId, body.payoutPhone, body.bankDetails);
  }

  @Get()
  @Roles(UserRole.MERCHANT_OWNER, UserRole.MERCHANT_ADMIN, UserRole.DEVELOPER, UserRole.SUPPORT)
  @ApiOperation({ summary: 'Get merchant settlement history' })
  getSettlementHistory(@GetUser('merchantId') merchantId: string) {
    return this.settlementsService.getSettlementsList(merchantId);
  }

  // --- Administrative Payout Operations (Super Admins / Admins) ---

  @Get('pending')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Admin: Get all pending settlement requests' })
  getPendingSettlements() {
    return this.settlementsService.getAllPendingSettlements();
  }

  @Post(':id/process')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Admin: Mark settlement request as processed' })
  processPayout(@Param('id') settlementId: string) {
    return this.settlementsService.processPayout(settlementId);
  }
}
