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

  async getDashboardStats(merchantId: string, isLive?: boolean) {
    const isLiveBool = isLive !== undefined ? (String(isLive) === 'true' || isLive === true) : false;
    const whereClause: any = { merchantId };
    whereClause.isLive = isLiveBool;

    const payments = await this.prisma.payment.findMany({
      where: whereClause,
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
      select: { balance: true, pendingBal: true, sandboxBalance: true, sandboxPendingBal: true, currency: true },
    });

    return {
      metrics: {
        totalVolume,
        totalTransactions,
        successRate,
        balance: isLiveBool ? Number(merchant?.balance || 0) : Number(merchant?.sandboxBalance || 0),
        pendingBalance: isLiveBool ? Number(merchant?.pendingBal || 0) : Number(merchant?.sandboxPendingBal || 0),
        currency: merchant?.currency || 'XAF',
      },
      dailyVolume,
    };
  }

  // --- Team Management ---

  async getTeam(merchantId: string) {
    return this.prisma.user.findMany({
      where: { merchantId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async inviteTeamMember(merchantId: string, email: string, name: string, role: any) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ForbiddenException('Un utilisateur avec cet email existe déjà');
    }

    const bcrypt = require('bcrypt');
    const passwordHash = await bcrypt.hash('Password123', 10);

    return this.prisma.user.create({
      data: {
        email,
        name,
        role,
        passwordHash,
        merchantId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  async updateTeamMember(merchantId: string, userId: string, data: { role?: any; isActive?: boolean }) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser || existingUser.merchantId !== merchantId) {
      throw new NotFoundException('Utilisateur introuvable dans votre organisation');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  async deleteTeamMember(merchantId: string, userId: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser || existingUser.merchantId !== merchantId) {
      throw new NotFoundException('Utilisateur introuvable dans votre organisation');
    }

    await this.prisma.user.delete({
      where: { id: userId },
    });

    return { message: 'Membre supprimé avec succès' };
  }

  async getAdvancedAnalytics(merchantId: string) {
    const payments = await this.prisma.payment.findMany({
      where: { merchantId },
    });

    const settlements = await this.prisma.settlement.findMany({
      where: { merchantId },
    });

    // 1. volumeChart (30 days daily credit vs debit)
    const dailyVolumeMap = new Map<string, { credit: number; debit: number }>();
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      dailyVolumeMap.set(key, { credit: 0, debit: 0 });
    }

    payments
      .filter((p) => p.status === 'SUCCESS')
      .forEach((p) => {
        const key = p.createdAt.toISOString().split('T')[0];
        if (dailyVolumeMap.has(key)) {
          const val = dailyVolumeMap.get(key)!;
          val.credit += Number(p.amount);
          dailyVolumeMap.set(key, val);
        }
      });

    settlements
      .filter((s) => s.status === 'PROCESSED')
      .forEach((s) => {
        const key = s.createdAt.toISOString().split('T')[0];
        if (dailyVolumeMap.has(key)) {
          const val = dailyVolumeMap.get(key)!;
          val.debit += Number(s.amount);
          dailyVolumeMap.set(key, val);
        }
      });

    const volumeChart = Array.from(dailyVolumeMap.entries()).map(([date, val]) => ({
      date,
      credit: val.credit,
      debit: val.debit,
    }));

    // 2. transactionsChart (30 days success vs failed counts)
    const dailyCountMap = new Map<string, { success: number; failed: number }>();
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      dailyCountMap.set(key, { success: 0, failed: 0 });
    }

    payments.forEach((p) => {
      const key = p.createdAt.toISOString().split('T')[0];
      if (dailyCountMap.has(key)) {
        const val = dailyCountMap.get(key)!;
        if (p.status === 'SUCCESS') {
          val.success += 1;
        } else if (p.status === 'FAILED') {
          val.failed += 1;
        }
        dailyCountMap.set(key, val);
      }
    });

    const transactionsChart = Array.from(dailyCountMap.entries()).map(([date, val]) => ({
      date,
      success: val.success,
      failed: val.failed,
    }));

    // 3. methodsShare (Group by paymentMethod)
    const methodShareMap = new Map<string, number>();
    payments
      .filter((p) => p.status === 'SUCCESS')
      .forEach((p) => {
        const method = p.paymentMethod;
        methodShareMap.set(method, (methodShareMap.get(method) || 0) + Number(p.amount));
      });

    const methodsShare = Array.from(methodShareMap.entries()).map(([method, value]) => ({
      name: method.replace('_MONEY', '').toLowerCase(),
      value,
    }));

    // 4. settlementsStatus
    const settlementsPending = settlements
      .filter((s) => s.status === 'PENDING')
      .reduce((sum, s) => sum + Number(s.amount), 0);
    const settlementsProcessed = settlements
      .filter((s) => s.status === 'PROCESSED')
      .reduce((sum, s) => sum + Number(s.amount), 0);

    const settlementsStatus = [
      { name: 'En attente', value: settlementsPending },
      { name: 'Traités', value: settlementsProcessed },
    ];

    // 5. operatorLatency (Mocked realistic latencies in ms)
    const operatorLatency = [
      { name: 'Konoom Money', latency: 120 },
      { name: 'Airtel Money', latency: 310 },
      { name: 'Moov Money', latency: 280 },
      { name: 'Visa / GIMAC', latency: 450 },
      { name: 'Mastercard', latency: 480 },
    ];

    return {
      volumeChart,
      transactionsChart,
      methodsShare,
      settlementsStatus,
      operatorLatency,
    };
  }

  async topupBalance(merchantId: string, amount: number) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { id: merchantId },
    });
    if (!merchant) {
      throw new NotFoundException('Merchant not found');
    }
    return this.prisma.merchant.update({
      where: { id: merchantId },
      data: {
        sandboxBalance: {
          increment: amount,
        },
      },
    });
  }
}
