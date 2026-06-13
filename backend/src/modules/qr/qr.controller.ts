import { Controller, Get, Post, Body, UseGuards, Param, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { QrService } from './qr.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Merchant QR Code (InnovQR)')
@Controller()
export class QrController {
  constructor(private readonly qrService: QrService) {}

  @Get('merchants/qr')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MERCHANT_OWNER, UserRole.MERCHANT_ADMIN, UserRole.DEVELOPER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get merchant QR Code settings' })
  getQrConfig(@GetUser('merchantId') merchantId: string) {
    return this.qrService.getQrConfig(merchantId);
  }

  @Post('merchants/qr')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MERCHANT_OWNER, UserRole.MERCHANT_ADMIN, UserRole.DEVELOPER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update merchant QR Code settings' })
  updateQrConfig(
    @GetUser('merchantId') merchantId: string,
    @Body() body: { logoUrl?: string; primaryColor?: string },
  ) {
    return this.qrService.updateQrConfig(merchantId, body);
  }

  @Get('merchants/qr/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MERCHANT_OWNER, UserRole.MERCHANT_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get merchant QR Code usage statistics' })
  getQrStats(@GetUser('merchantId') merchantId: string) {
    return this.qrService.getQrStats(merchantId);
  }

  @Get('qr/scan/:merchantId')
  @ApiOperation({ summary: 'Public scan endpoint (Logs scan and redirects to paylink page)' })
  async scanQr(
    @Param('merchantId') merchantId: string,
    @Req() req: any,
  ) {
    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    
    // Log the scan event
    await this.qrService.logQrScan(merchantId, ipAddress, userAgent);
    
    // Return the scan info (or redirect if in browser context)
    return {
      merchantId,
      scanned: true,
      message: 'Scan enregistré avec succès.',
    };
  }
}
