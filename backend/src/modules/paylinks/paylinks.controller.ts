import { Controller, Post, Get, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PayLinksService } from './paylinks.service';
import { CreatePayLinkDto } from './dto/create-paylink.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/user.decorator';
import { UserRole, PaymentMethod } from '@prisma/client';

@ApiTags('PayLinks - Paiement par Lien')
@Controller()
export class PayLinksController {
  constructor(private readonly payLinksService: PayLinksService) {}

  // --- Dashboard Private API (JWT) ---

  @Post('dashboard/paylinks')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MERCHANT_OWNER, UserRole.MERCHANT_ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Créer un nouveau lien de paiement' })
  @ApiResponse({ status: 201, description: 'PayLink créé avec succès' })
  createPayLink(
    @GetUser('merchantId') merchantId: string,
    @Body() dto: CreatePayLinkDto,
  ) {
    return this.payLinksService.createPayLink(merchantId, dto);
  }

  @Get('dashboard/paylinks')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MERCHANT_OWNER, UserRole.MERCHANT_ADMIN, UserRole.DEVELOPER, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lister tous mes liens de paiement' })
  getPayLinks(@GetUser('merchantId') merchantId: string) {
    return this.payLinksService.getPayLinks(merchantId);
  }

  @Delete('dashboard/paylinks/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MERCHANT_OWNER, UserRole.MERCHANT_ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Annuler un lien de paiement' })
  cancelPayLink(
    @GetUser('merchantId') merchantId: string,
    @Param('id') payLinkId: string,
  ) {
    return this.payLinksService.cancelPayLink(merchantId, payLinkId);
  }

  // --- Public Checkout API (no auth) ---

  @Get('pay/:slug')
  @ApiOperation({ summary: 'Public: Récupérer les détails d\'un lien de paiement' })
  @ApiResponse({ status: 200, description: 'Détails du PayLink pour la page checkout' })
  getPayLinkCheckout(@Param('slug') slug: string) {
    return this.payLinksService.getPayLinkBySlug(slug);
  }

  @Post('pay/:slug')
  @ApiOperation({ summary: 'Public: Initier un paiement via un lien' })
  @ApiResponse({ status: 201, description: 'Paiement initié avec succès' })
  payViaPayLink(
    @Param('slug') slug: string,
    @Body() body: {
      paymentMethod: PaymentMethod;
      customerEmail: string;
      customerPhone?: string;
    },
  ) {
    return this.payLinksService.payViaPayLink(
      slug,
      body.paymentMethod,
      body.customerEmail,
      body.customerPhone,
    );
  }
}
