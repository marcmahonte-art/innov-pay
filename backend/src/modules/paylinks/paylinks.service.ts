import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PayLinkStatus, PaymentMethod, PaymentStatus } from '@prisma/client';
import { CreatePayLinkDto } from './dto/create-paylink.dto';
import { PaymentRouter } from '../payments/services/payment-router.service';
import * as crypto from 'crypto';

@Injectable()
export class PayLinksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentRouter: PaymentRouter,
  ) {}

  /**
   * Generate a unique URL-safe slug
   */
  private generateSlug(): string {
    return `pay_${crypto.randomBytes(6).toString('base64url')}`;
  }

  /**
   * Create a new PayLink for a merchant
   */
  async createPayLink(merchantId: string, dto: CreatePayLinkDto) {
    const slug = this.generateSlug();

    return this.prisma.payLink.create({
      data: {
        merchantId,
        title: dto.title,
        description: dto.description,
        amount: dto.amount,
        currency: dto.currency || 'XAF',
        isReusable: dto.isReusable || false,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        maxPayments: dto.maxPayments || null,
        slug,
      },
    });
  }

  /**
   * List all PayLinks for a merchant
   */
  async getPayLinks(merchantId: string) {
    return this.prisma.payLink.findMany({
      where: { merchantId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { payments: true },
        },
      },
    });
  }

  /**
   * Cancel a PayLink
   */
  async cancelPayLink(merchantId: string, payLinkId: string) {
    const payLink = await this.prisma.payLink.findFirst({
      where: { id: payLinkId, merchantId },
    });

    if (!payLink) {
      throw new NotFoundException('PayLink non trouvé');
    }

    return this.prisma.payLink.update({
      where: { id: payLinkId },
      data: { status: PayLinkStatus.CANCELLED },
    });
  }

  /**
   * Public: Get PayLink details by slug (for checkout page)
   */
  async getPayLinkBySlug(slug: string) {
    const payLink = await this.prisma.payLink.findUnique({
      where: { slug },
      include: {
        merchant: {
          select: {
            businessName: true,
            email: true,
          },
        },
      },
    });

    if (!payLink) {
      throw new NotFoundException('Lien de paiement introuvable');
    }

    // Check expiration
    if (payLink.expiresAt && new Date() > payLink.expiresAt) {
      throw new BadRequestException('Ce lien de paiement a expiré');
    }

    // Check status
    if (payLink.status !== PayLinkStatus.ACTIVE) {
      throw new BadRequestException(`Ce lien de paiement est ${payLink.status.toLowerCase()}`);
    }

    // Check max payments reached
    if (!payLink.isReusable && payLink.totalPaid >= 1) {
      throw new BadRequestException('Ce lien de paiement a déjà été utilisé');
    }
    if (payLink.maxPayments && payLink.totalPaid >= payLink.maxPayments) {
      throw new BadRequestException('Nombre maximum de paiements atteint pour ce lien');
    }

    return {
      slug: payLink.slug,
      title: payLink.title,
      description: payLink.description,
      amount: Number(payLink.amount),
      currency: payLink.currency,
      merchantName: payLink.merchant.businessName,
      isReusable: payLink.isReusable,
    };
  }

  /**
   * Public: Process payment on a PayLink
   */
  async payViaPayLink(
    slug: string,
    paymentMethod: PaymentMethod,
    customerEmail: string,
    customerPhone?: string,
  ) {
    const payLink = await this.prisma.payLink.findUnique({
      where: { slug },
    });

    if (!payLink) {
      throw new NotFoundException('Lien de paiement introuvable');
    }

    // Validations
    if (payLink.status !== PayLinkStatus.ACTIVE) {
      throw new BadRequestException('Ce lien n\'est plus actif');
    }
    if (payLink.expiresAt && new Date() > payLink.expiresAt) {
      throw new BadRequestException('Ce lien a expiré');
    }
    if (!payLink.isReusable && payLink.totalPaid >= 1) {
      throw new BadRequestException('Ce lien a déjà été utilisé');
    }
    if (payLink.maxPayments && payLink.totalPaid >= payLink.maxPayments) {
      throw new BadRequestException('Nombre maximum de paiements atteint');
    }

    // Generate unique merchant reference for this PayLink payment
    const merchantReference = `pl_${payLink.slug}_${Date.now()}`;

    // Route payment through the payment router
    const { provider, response } = await this.paymentRouter.routeAndCreatePayment(
      {
        amount: Number(payLink.amount),
        currency: payLink.currency,
        reference: merchantReference,
        customerEmail,
        customerPhone,
      },
      paymentMethod,
    );

    // Fee calculation (same as main payments service)
    const feeRate = ([PaymentMethod.VISA, PaymentMethod.MASTERCARD] as PaymentMethod[]).includes(paymentMethod) ? 0.035 : 0.02;
    const fee = Number(payLink.amount) * feeRate;
    const providerFee = fee * 0.6;
    const netAmount = Number(payLink.amount) - fee;

    // Save payment linked to this PayLink
    const payment = await this.prisma.payment.create({
      data: {
        merchantId: payLink.merchantId,
        amount: Number(payLink.amount),
        currency: payLink.currency,
        paymentMethod,
        customerEmail,
        customerPhone,
        providerId: provider.id,
        providerReference: response.providerReference,
        merchantReference,
        fee,
        providerFee,
        netAmount,
        status: response.status as PaymentStatus,
        payLinkId: payLink.id,
      },
    });

    // Increment totalPaid counter
    await this.prisma.payLink.update({
      where: { id: payLink.id },
      data: {
        totalPaid: { increment: 1 },
        // Mark as PAID if single-use
        ...(!payLink.isReusable ? { status: PayLinkStatus.PAID } : {}),
      },
    });

    // Credit merchant if instant success
    if (payment.status === PaymentStatus.SUCCESS) {
      await this.prisma.merchant.update({
        where: { id: payLink.merchantId },
        data: { balance: { increment: netAmount } },
      });
    }

    return {
      paymentId: payment.id,
      status: payment.status,
      instructions: response.instructions,
      redirectUrl: response.redirectUrl,
    };
  }
}
