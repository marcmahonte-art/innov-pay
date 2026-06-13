import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentRouter } from './services/payment-router.service';
import { ProvidersService } from '../providers/providers.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentStatus, PaymentMethod } from '@prisma/client';
import { WebhooksService } from '../webhooks/webhooks.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentRouter: PaymentRouter,
    private readonly providersService: ProvidersService,
    private readonly webhooksService: WebhooksService,
    private readonly mailService: MailService,
  ) {}

  /**
   * Public API: Create a payment
   */
  async createPayment(merchantId: string, dto: CreatePaymentDto) {
    // 1. Verify merchant order ID uniqueness
    const existing = await this.prisma.payment.findUnique({
      where: {
        merchantId_merchantReference: {
          merchantId,
          merchantReference: dto.merchantReference,
        },
      },
    });

    if (existing) {
      throw new ConflictException(`Payment with reference '${dto.merchantReference}' already exists`);
    }

    // 2. Route the payment to the appropriate provider and call provider client
    const { provider, response } = await this.paymentRouter.routeAndCreatePayment(
      {
        amount: dto.amount,
        currency: dto.currency,
        reference: dto.merchantReference,
        customerEmail: dto.customerEmail,
        customerPhone: dto.customerPhone,
      },
      dto.paymentMethod,
    );

    // 3. Fee calculation (CEMAC standard rates)
    // Airtel/Moov/Konoom: 2.0% total fee, Cards: 3.5% total fee
    const feeRate = ([PaymentMethod.VISA, PaymentMethod.MASTERCARD] as PaymentMethod[]).includes(dto.paymentMethod) ? 0.035 : 0.02;
    const fee = Number(dto.amount) * feeRate;
    const providerFee = fee * 0.6; // Assuming provider takes 60% of our fee
    const netAmount = Number(dto.amount) - fee;

    // 4. Save payment in database
    const paymentRecord = await this.prisma.payment.create({
      data: {
        merchantId,
        amount: dto.amount,
        currency: dto.currency,
        paymentMethod: dto.paymentMethod,
        customerEmail: dto.customerEmail,
        customerPhone: dto.customerPhone,
        providerId: provider.id,
        providerReference: response.providerReference,
        merchantReference: dto.merchantReference,
        fee,
        providerFee,
        netAmount,
        status: response.status as PaymentStatus,
        metadata: dto.metadata || {},
      },
      include: {
        merchant: true,
      },
    });

    // If status resolves instantly (e.g. mock instant success), update balances
    if (paymentRecord.status === PaymentStatus.SUCCESS) {
      await this.creditMerchantBalance(merchantId, netAmount);
      this.mailService.sendPaymentReceivedEmail(
        paymentRecord.merchant.email,
        paymentRecord.customerEmail || paymentRecord.customerPhone || 'Client',
        Number(paymentRecord.amount),
        paymentRecord.currency,
        paymentRecord.id,
      );
    }

    return {
      paymentId: paymentRecord.id,
      merchantReference: paymentRecord.merchantReference,
      status: paymentRecord.status,
      instructions: response.instructions,
      redirectUrl: response.redirectUrl,
      createdAt: paymentRecord.createdAt,
    };
  }

  /**
   * Retrieve payment status (and update from provider if pending)
   */
  async getPaymentStatus(paymentId: string, merchantId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { id: paymentId, merchantId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // If still pending or processing, sync with provider
    if (payment.status === PaymentStatus.PENDING || payment.status === PaymentStatus.PROCESSING) {
      try {
        const providerInstance = await this.providersService.getProviderInstance(payment.providerId);
        const statusRes = await providerInstance.getPaymentStatus(payment.providerReference || '');

        if (statusRes.status !== payment.status) {
          // Status updated! Update in DB
          const updatedPayment = await this.prisma.payment.update({
            where: { id: payment.id },
            data: { status: statusRes.status as PaymentStatus },
            include: { merchant: true },
          });

          // If payment succeeded, credit merchant balance
          if (updatedPayment.status === PaymentStatus.SUCCESS) {
            await this.creditMerchantBalance(merchantId, Number(updatedPayment.netAmount));
            this.mailService.sendPaymentReceivedEmail(
              updatedPayment.merchant.email,
              updatedPayment.customerEmail || updatedPayment.customerPhone || 'Client',
              Number(updatedPayment.amount),
              updatedPayment.currency,
              updatedPayment.id,
            );
          }

          // Trigger asynchronous webhook delivery
          this.webhooksService.queueWebhook(
            merchantId,
            updatedPayment.status === PaymentStatus.SUCCESS ? 'payment.success' : 'payment.failed',
            {
              paymentId: updatedPayment.id,
              merchantReference: updatedPayment.merchantReference,
              amount: Number(updatedPayment.amount),
              currency: updatedPayment.currency,
              status: updatedPayment.status,
              fee: Number(updatedPayment.fee),
              netAmount: Number(updatedPayment.netAmount),
              customerEmail: updatedPayment.customerEmail,
              customerPhone: updatedPayment.customerPhone,
              createdAt: updatedPayment.createdAt,
            },
            updatedPayment.id,
          ).catch(err => console.error('Error queuing webhook:', err));

          return {
            paymentId: updatedPayment.id,
            merchantReference: updatedPayment.merchantReference,
            status: updatedPayment.status,
            amount: Number(updatedPayment.amount),
            currency: updatedPayment.currency,
          };
        }
      } catch (err) {
        console.error('Failed to sync payment status with provider:', err);
      }
    }

    return {
      paymentId: payment.id,
      merchantReference: payment.merchantReference,
      status: payment.status,
      amount: Number(payment.amount),
      currency: payment.currency,
    };
  }

  /**
   * Refund a successful payment
   */
  async refundPayment(paymentId: string, merchantId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { id: paymentId, merchantId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== PaymentStatus.SUCCESS) {
      throw new BadRequestException('Only successful payments can be refunded');
    }

    const providerInstance = await this.providersService.getProviderInstance(payment.providerId);
    const refundRes = await providerInstance.refundPayment(payment.providerReference || '', Number(payment.amount));

    if (refundRes.status === 'SUCCESS') {
      const updated = await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.REFUNDED },
      });

      // Deduct from merchant balance
      await this.deductMerchantBalance(merchantId, Number(payment.netAmount));

      // Queue webhook
      this.webhooksService.queueWebhook(
        merchantId,
        'payment.refunded',
        {
          paymentId: updated.id,
          merchantReference: updated.merchantReference,
          amount: Number(updated.amount),
          status: updated.status,
        },
        updated.id,
      ).catch(err => console.error('Error queuing webhook:', err));

      return {
        paymentId: updated.id,
        status: updated.status,
        refundReference: refundRes.refundReference,
      };
    } else {
      throw new BadRequestException('Refund was declined by provider');
    }
  }

  /**
   * List and filter payments (history search)
   */
  async getPaymentsList(
    merchantId: string,
    filters: {
      status?: PaymentStatus;
      method?: PaymentMethod;
      search?: string;
      startDate?: string;
      endDate?: string;
      limit?: number;
      offset?: number;
    },
  ) {
    const whereClause: any = { merchantId };

    if (filters.status) {
      whereClause.status = filters.status;
    }
    if (filters.method) {
      whereClause.paymentMethod = filters.method;
    }
    if (filters.search) {
      whereClause.OR = [
        { merchantReference: { contains: filters.search, mode: 'insensitive' } },
        { customerEmail: { contains: filters.search, mode: 'insensitive' } },
        { customerPhone: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    if (filters.startDate || filters.endDate) {
      whereClause.createdAt = {};
      if (filters.startDate) {
        whereClause.createdAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        whereClause.createdAt.lte = new Date(filters.endDate);
      }
    }

    const limit = Number(filters.limit) || 10;
    const offset = Number(filters.offset) || 0;

    const [total, data] = await this.prisma.$transaction([
      this.prisma.payment.count({ where: whereClause }),
      this.prisma.payment.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
    ]);

    return {
      total,
      limit,
      offset,
      data,
    };
  }

  // --- Ledgers & Balances Helpers ---

  private async creditMerchantBalance(merchantId: string, amount: number) {
    await this.prisma.merchant.update({
      where: { id: merchantId },
      data: {
        balance: { increment: amount },
      },
    });
  }

  private async deductMerchantBalance(merchantId: string, amount: number) {
    await this.prisma.merchant.update({
      where: { id: merchantId },
      data: {
        balance: { decrement: amount },
      },
    });
  }

  /**
   * For simulated OTP validation: transition a payment to SUCCESS, credit the merchant balance,
   * send the payment email, and trigger the merchant webhook callback.
   */
  async completePaymentSuccessfully(paymentId: string, merchantId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { id: paymentId, merchantId },
      include: { merchant: true },
    });

    if (!payment) {
      throw new NotFoundException('Transaction introuvable');
    }

    if (payment.status === PaymentStatus.SUCCESS) {
      return; // Already processed
    }

    const updatedPayment = await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.SUCCESS,
      },
      include: { merchant: true },
    });

    // Credit merchant balance
    await this.creditMerchantBalance(merchantId, Number(updatedPayment.netAmount));

    // Send email notification
    this.mailService.sendPaymentReceivedEmail(
      updatedPayment.merchant.email,
      updatedPayment.customerEmail || updatedPayment.customerPhone || 'Client',
      Number(updatedPayment.amount),
      updatedPayment.currency,
      updatedPayment.id,
    );

    // Queue webhook notification asynchronously
    this.webhooksService.queueWebhook(
      merchantId,
      'payment.success',
      {
        paymentId: updatedPayment.id,
        merchantReference: updatedPayment.merchantReference,
        amount: Number(updatedPayment.amount),
        currency: updatedPayment.currency,
        status: updatedPayment.status,
        fee: Number(updatedPayment.fee),
        netAmount: Number(updatedPayment.netAmount),
        customerEmail: updatedPayment.customerEmail,
        customerPhone: updatedPayment.customerPhone,
        createdAt: updatedPayment.createdAt,
      },
      updatedPayment.id,
    ).catch(err => console.error('Failed to queue webhook after OTP validation:', err));
  }
}
