import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QrService {
  constructor(private readonly prisma: PrismaService) {}

  async getQrConfig(merchantId: string) {
    let qr = await this.prisma.merchantQrCode.findUnique({
      where: { merchantId },
    });

    if (!qr) {
      qr = await this.prisma.merchantQrCode.create({
        data: {
          merchantId,
          primaryColor: '#00103e',
        },
      });
    }

    return qr;
  }

  async updateQrConfig(merchantId: string, data: { logoUrl?: string; primaryColor?: string }) {
    return this.prisma.merchantQrCode.upsert({
      where: { merchantId },
      update: data,
      create: {
        merchantId,
        logoUrl: data.logoUrl || null,
        primaryColor: data.primaryColor || '#00103e',
      },
    });
  }

  async getQrStats(merchantId: string) {
    const totalScans = await this.prisma.qrScan.count({
      where: { merchantId },
    });

    const paidScans = await this.prisma.qrScan.count({
      where: { merchantId, paid: true },
    });

    const payments = await this.prisma.payment.findMany({
      where: {
        merchantId,
        status: 'SUCCESS',
        metadata: {
          path: ['isQrScan'],
          equals: true,
        },
      },
      select: { amount: true },
    });

    const totalVolume = payments.reduce((sum, p) => sum + Number(p.amount), 0);

    const conversionRate = totalScans > 0 ? (paidScans / totalScans) * 100 : 0;

    // Scan activity 30 days
    const scans = await this.prisma.qrScan.findMany({
      where: { merchantId },
      select: { scannedAt: true },
    });

    const dailyScansMap = new Map<string, number>();
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      dailyScansMap.set(key, 0);
    }

    scans.forEach((s) => {
      const key = s.scannedAt.toISOString().split('T')[0];
      if (dailyScansMap.has(key)) {
        dailyScansMap.set(key, dailyScansMap.get(key)! + 1);
      }
    });

    const dailyScans = Array.from(dailyScansMap.entries()).map(([date, count]) => ({
      date,
      scans: count,
    }));

    return {
      metrics: {
        totalScans,
        paidScans,
        totalVolume,
        conversionRate,
      },
      dailyScans,
    };
  }

  async logQrScan(merchantId: string, ipAddress?: string, userAgent?: string) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { id: merchantId },
    });

    if (!merchant) {
      throw new NotFoundException('Marchand introuvable');
    }

    return this.prisma.qrScan.create({
      data: {
        merchantId,
        ipAddress,
        userAgent,
        paid: false,
      },
    });
  }
}
