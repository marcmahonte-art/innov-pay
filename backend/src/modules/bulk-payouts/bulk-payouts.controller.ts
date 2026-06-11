import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BulkPayoutsService } from './bulk-payouts.service';
import { CreateBulkPayoutDto } from './dto/create-bulk-payout.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Bulk Payouts - Paiement de Masse')
@Controller('dashboard/bulk-payouts')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class BulkPayoutsController {
  constructor(private readonly bulkPayoutsService: BulkPayoutsService) {}

  @Post()
  @Roles(UserRole.MERCHANT_OWNER, UserRole.MERCHANT_ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Créer un batch de paiements (DRAFT)' })
  @ApiResponse({ status: 201, description: 'Batch créé avec succès' })
  createBulkPayout(
    @GetUser('merchantId') merchantId: string,
    @Body() dto: CreateBulkPayoutDto,
  ) {
    return this.bulkPayoutsService.createBulkPayout(merchantId, dto);
  }

  @Get()
  @Roles(UserRole.MERCHANT_OWNER, UserRole.MERCHANT_ADMIN, UserRole.DEVELOPER, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Lister tous les batches de paiement' })
  getBulkPayouts(@GetUser('merchantId') merchantId: string) {
    return this.bulkPayoutsService.getBulkPayouts(merchantId);
  }

  @Get(':id')
  @Roles(UserRole.MERCHANT_OWNER, UserRole.MERCHANT_ADMIN, UserRole.DEVELOPER, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Détails d\'un batch avec toutes les lignes' })
  getBulkPayoutDetails(
    @GetUser('merchantId') merchantId: string,
    @Param('id') bulkPayoutId: string,
  ) {
    return this.bulkPayoutsService.getBulkPayoutDetails(merchantId, bulkPayoutId);
  }

  @Post(':id/execute')
  @Roles(UserRole.MERCHANT_OWNER, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Exécuter un batch DRAFT — lance les transferts' })
  @ApiResponse({ status: 200, description: 'Batch exécuté avec rapport de résultats' })
  executeBulkPayout(
    @GetUser('merchantId') merchantId: string,
    @Param('id') bulkPayoutId: string,
  ) {
    return this.bulkPayoutsService.executeBulkPayout(merchantId, bulkPayoutId);
  }
}
