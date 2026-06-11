import { Controller, Post, Get, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ApiKeyGuard } from '../auth/guards/api-key.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetMerchant } from '../../modules/merchants/decorators/merchant.decorator';
import { GetUser } from '../auth/decorators/user.decorator';
import { PaymentStatus, PaymentMethod, UserRole } from '@prisma/client';

@ApiTags('Payments Engine')
@Controller()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // --- Merchant Public API (Stripe-Style Authorizations) ---

  @Post('payments')
  @UseGuards(ApiKeyGuard)
  @ApiHeader({ name: 'Authorization', description: 'Bearer sk_test_...' })
  @ApiOperation({ summary: 'API: Initialize a payment transaction' })
  @ApiResponse({ status: 201, description: 'Payment session created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized API key' })
  createPayment(
    @GetMerchant('id') merchantId: string,
    @Body() dto: CreatePaymentDto,
  ) {
    return this.paymentsService.createPayment(merchantId, dto);
  }

  @Get('payments/:id')
  @UseGuards(ApiKeyGuard)
  @ApiHeader({ name: 'Authorization', description: 'Bearer sk_test_...' })
  @ApiOperation({ summary: 'API: Retrieve transaction status' })
  @ApiResponse({ status: 200, description: 'Returns current payment state' })
  getPaymentStatus(
    @Param('id') paymentId: string,
    @GetMerchant('id') merchantId: string,
  ) {
    return this.paymentsService.getPaymentStatus(paymentId, merchantId);
  }

  @Post('refunds')
  @UseGuards(ApiKeyGuard)
  @ApiHeader({ name: 'Authorization', description: 'Bearer sk_test_...' })
  @ApiOperation({ summary: 'API: Refund a successful payment' })
  @ApiResponse({ status: 201, description: 'Refund completed successfully' })
  refundPayment(
    @GetMerchant('id') merchantId: string,
    @Body() body: { paymentId: string },
  ) {
    return this.paymentsService.refundPayment(body.paymentId, merchantId);
  }

  // --- Merchant Dashboard Private API (JWT Authorizations) ---

  @Get('dashboard/payments')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MERCHANT_OWNER, UserRole.MERCHANT_ADMIN, UserRole.DEVELOPER, UserRole.SUPPORT, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Dashboard: Retrieve filtered list of payments' })
  getPaymentsList(
    @GetUser('merchantId') merchantId: string,
    @Query('status') status?: PaymentStatus,
    @Query('method') method?: PaymentMethod,
    @Query('search') search?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.paymentsService.getPaymentsList(merchantId, {
      status,
      method,
      search,
      startDate,
      endDate,
      limit,
      offset,
    });
  }

  @Get('dashboard/payments/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MERCHANT_OWNER, UserRole.MERCHANT_ADMIN, UserRole.DEVELOPER, UserRole.SUPPORT, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Dashboard: Get single transaction details' })
  getPaymentDetails(
    @Param('id') paymentId: string,
    @GetUser('merchantId') merchantId: string,
  ) {
    // Simply fetch using status method which retrieves data
    return this.paymentsService.getPaymentStatus(paymentId, merchantId);
  }
}
