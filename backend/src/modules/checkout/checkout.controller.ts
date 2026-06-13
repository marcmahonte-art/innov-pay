import { Controller, Post, Get, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { CheckoutService } from './checkout.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { PaySessionDto } from './dto/pay-session.dto';
import { ApiKeyGuard } from '../auth/guards/api-key.guard';

@ApiTags('Checkout Widget - SDK Integration')
@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post('sessions')
  @UseGuards(ApiKeyGuard)
  @ApiHeader({ name: 'Authorization', description: 'Bearer sk_live_... / sk_test_...' })
  @ApiOperation({ summary: 'Créer une session de paiement (Server-to-Server)' })
  @ApiResponse({ status: 201, description: 'Session créée' })
  async createSession(@Req() req: any, @Body() dto: CreateSessionDto) {
    const merchantId = req.merchant.id;
    const isLive = req.isLiveKey;
    return this.checkoutService.createSession(merchantId, isLive, dto);
  }

  @Get('sessions/:id')
  @ApiOperation({ summary: 'Récupérer les détails publics d\'une session' })
  async getSession(@Param('id') sessionId: string) {
    return this.checkoutService.getSession(sessionId);
  }

  @Post('sessions/:id/pay')
  @ApiOperation({ summary: 'Soumettre le paiement d\'une session' })
  async paySession(@Param('id') sessionId: string, @Body() dto: PaySessionDto) {
    return this.checkoutService.paySession(sessionId, dto);
  }

  @Post('sessions/:id/verify-otp')
  @ApiOperation({ summary: 'Vérifier le code OTP d\'une session' })
  async verifyOtp(@Param('id') sessionId: string, @Body() body: { otp: string }) {
    return this.checkoutService.verifyOtp(sessionId, body.otp);
  }
}
