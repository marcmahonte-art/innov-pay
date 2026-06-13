import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SettlementStatus } from '@prisma/client';
import { MailService } from '../mail/mail.service';

@Injectable()
export class SettlementsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  /**
   * Aggregate all successful, unsettled payments and generate a Settlement request.
   */
  async createSettlementRequest(merchantId: string, payoutPhone?: string, bankDetails?: any) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { id: merchantId },
    });

    if (!merchant) {
      throw new NotFoundException('Merchant not found');
    }

    // Find all successful payments that are not yet tied to a settlement
    const unsettledPayments = await this.prisma.payment.findMany({
      where: {
        merchantId,
        status: 'SUCCESS',
        settlementId: null,
      },
    });

    if (unsettledPayments.length === 0) {
      throw new BadRequestException('No successful unsettled payments found for this merchant');
    }

    const amountTotal = unsettledPayments.reduce((sum, p) => sum + Number(p.amount), 0);
    const feeTotal = unsettledPayments.reduce((sum, p) => sum + Number(p.fee), 0);
    const netPayout = amountTotal - feeTotal;

    if (netPayout <= 0) {
      throw new BadRequestException('Settlement amount must be greater than zero');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Create the Settlement record
      const settlement = await tx.settlement.create({
        data: {
          merchantId,
          amount: netPayout,
          feeTotal,
          currency: merchant.currency,
          status: SettlementStatus.PENDING,
          payoutPhone,
          bankDetails: bankDetails || null,
        },
      });

      // 2. Bind the payments to this settlement
      await tx.payment.updateMany({
        where: {
          id: { in: unsettledPayments.map((p) => p.id) },
        },
        data: {
          settlementId: settlement.id,
        },
      });

      // 3. Deduct from the merchant's current balance (ledger logic)
      await tx.merchant.update({
        where: { id: merchantId },
        data: {
          balance: { decrement: netPayout },
        },
      });

      return settlement;
    });
  }

  async getSettlementsList(merchantId: string) {
    return this.prisma.settlement.findMany({
      where: { merchantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Admin-Only: Process settlement payout (simulates GIMAC/bank wire)
   */
  async processPayout(settlementId: string) {
    const settlement = await this.prisma.settlement.findUnique({
      where: { id: settlementId },
      include: { merchant: true },
    });

    if (!settlement) {
      throw new NotFoundException('Settlement request not found');
    }

    if (settlement.status !== SettlementStatus.PENDING) {
      throw new BadRequestException('Settlement has already been processed or failed');
    }

    const updated = await this.prisma.settlement.update({
      where: { id: settlementId },
      data: {
        status: SettlementStatus.PROCESSED,
        updatedAt: new Date(),
      },
    });

    // Send email notification to merchant
    const accountDetails = settlement.payoutPhone
      ? `Mobile Money (+235 ${settlement.payoutPhone})`
      : settlement.bankDetails
      ? typeof settlement.bankDetails === 'string'
        ? settlement.bankDetails
        : JSON.stringify(settlement.bankDetails)
      : 'Coordonnées bancaires enregistrées';

    const reference = `SET-${settlement.id.substring(0, 8).toUpperCase()}`;

    this.mailService.sendPayoutEmail(
      settlement.merchant.email,
      Number(settlement.amount),
      settlement.currency,
      accountDetails,
      reference,
    );

    return updated;
  }

  /**
   * Admin-Only: Retrieve all pending settlements across the system
   */
  async getAllPendingSettlements() {
    return this.prisma.settlement.findMany({
      where: { status: SettlementStatus.PENDING },
      include: {
        merchant: {
          select: {
            businessName: true,
            email: true,
          },
        },
      },
    });
  }
}
