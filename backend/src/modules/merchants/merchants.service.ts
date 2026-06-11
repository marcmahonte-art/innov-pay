import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class MerchantsService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(merchantId: string) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { id: merchantId },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!merchant) {
      throw new NotFoundException('Merchant not found');
    }

    return merchant;
  }

  async updateProfile(merchantId: string, data: { businessName?: string; phone?: string; address?: string }) {
    return this.prisma.merchant.update({
      where: { id: merchantId },
      data,
    });
  }

  // --- API Key Management ---

  async getApiKeys(merchantId: string) {
    return this.prisma.apiKey.findMany({
      where: { merchantId },
      select: {
        id: true,
        publicKey: true,
        isLive: true,
        lastUsedAt: true,
        expiresAt: true,
        createdAt: true,
      },
    });
  }

  async generateApiKey(merchantId: string, isLive: boolean) {
    const prefix = isLive ? 'live' : 'test';
    const uuidStr = merchantId.replace(/-/g, '');
    const publicKey = `pk_${prefix}_${uuidStr}`;
    
    // Generate a long random secret key
    const secretEntropy = crypto.randomBytes(24).toString('hex');
    const secretKey = `sk_${prefix}_${uuidStr}${secretEntropy}`;
    
    // Store only the SHA-256 hash of the secret key in database
    const secretHash = crypto.createHash('sha256').update(secretKey).digest('hex');

    const apiKey = await this.prisma.apiKey.create({
      data: {
        merchantId,
        publicKey,
        secretHash,
        isLive,
      },
    });

    return {
      id: apiKey.id,
      publicKey: apiKey.publicKey,
      secretKey, // Return raw key only once
      isLive: apiKey.isLive,
      createdAt: apiKey.createdAt,
    };
  }

  async rotateApiKey(merchantId: string, apiKeyId: string) {
    const existingKey = await this.prisma.apiKey.findUnique({
      where: { id: apiKeyId },
    });

    if (!existingKey || existingKey.merchantId !== merchantId) {
      throw new NotFoundException('API Key not found or does not belong to this merchant');
    }

    // Revoke old key
    await this.prisma.apiKey.delete({
      where: { id: apiKeyId },
    });

    // Generate a new one with same environment (live/test)
    return this.generateApiKey(merchantId, existingKey.isLive);
  }

  async revokeApiKey(merchantId: string, apiKeyId: string) {
    const existingKey = await this.prisma.apiKey.findUnique({
      where: { id: apiKeyId },
    });

    if (!existingKey || existingKey.merchantId !== merchantId) {
      throw new NotFoundException('API Key not found or does not belong to this merchant');
    }

    await this.prisma.apiKey.delete({
      where: { id: apiKeyId },
    });

    return { message: 'API key successfully revoked' };
  }

  // --- Dashboard Aggregations ---

  async getDashboardStats(merchantId: string) {
    const payments = await this.prisma.payment.findMany({
      where: { merchantId },
      select: {
        amount: true,
        status: true,
        createdAt: true,
      },
    });

    const totalVolume = payments
      .filter((p) => p.status === 'SUCCESS')
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const totalTransactions = payments.length;
    const successTransactions = payments.filter((p) => p.status === 'SUCCESS').length;
    const successRate = totalTransactions > 0 ? (successTransactions / totalTransactions) * 100 : 0;

    // Last 7 days metrics
    const dailyVolumeMap = new Map<string, number>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      dailyVolumeMap.set(key, 0);
    }

    payments
      .filter((p) => p.status === 'SUCCESS')
      .forEach((p) => {
        const key = p.createdAt.toISOString().split('T')[0];
        if (dailyVolumeMap.has(key)) {
          dailyVolumeMap.set(key, dailyVolumeMap.get(key)! + Number(p.amount));
        }
      });

    const dailyVolume = Array.from(dailyVolumeMap.entries()).map(([date, volume]) => ({
      date,
      volume,
    }));

    // Merchant balances
    const merchant = await this.prisma.merchant.findUnique({
      where: { id: merchantId },
      select: { balance: true, pendingBal: true, currency: true },
    });

    return {
      metrics: {
        totalVolume,
        totalTransactions,
        successRate,
        balance: merchant?.balance || 0,
        pendingBalance: merchant?.pendingBal || 0,
        currency: merchant?.currency || 'XAF',
      },
      dailyVolume,
    };
  }
}
