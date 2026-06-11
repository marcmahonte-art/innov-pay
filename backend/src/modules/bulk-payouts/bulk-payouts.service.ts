import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BulkPayoutStatus, PayoutItemStatus } from '@prisma/client';
import { CreateBulkPayoutDto } from './dto/create-bulk-payout.dto';
import { ProvidersService } from '../providers/providers.service';

@Injectable()
export class BulkPayoutsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly providersService: ProvidersService,
  ) {}

  /**
   * Create a new Bulk Payout batch (DRAFT state)
   */
  async createBulkPayout(merchantId: string, dto: CreateBulkPayoutDto) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('La liste des bénéficiaires est vide');
    }

    const totalAmount = dto.items.reduce((sum, item) => sum + item.amount, 0);

    // Verify merchant has enough balance
    const merchant = await this.prisma.merchant.findUnique({
      where: { id: merchantId },
    });

    if (!merchant) {
      throw new NotFoundException('Marchand non trouvé');
    }

    if (Number(merchant.balance) < totalAmount) {
      throw new BadRequestException(
        `Solde insuffisant. Solde actuel: ${merchant.balance} FCFA. Montant requis: ${totalAmount} FCFA`,
      );
    }

    // Create the bulk payout and all items in a transaction
    return this.prisma.$transaction(async (tx) => {
      const bulkPayout = await tx.bulkPayout.create({
        data: {
          merchantId,
          totalAmount,
          currency: dto.currency || 'XAF',
          status: BulkPayoutStatus.DRAFT,
          totalItems: dto.items.length,
          items: {
            create: dto.items.map((item) => ({
              recipientPhone: item.recipientPhone,
              recipientName: item.recipientName || null,
              amount: item.amount,
              provider: item.provider.toLowerCase(),
              status: PayoutItemStatus.PENDING,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      return bulkPayout;
    });
  }

  /**
   * List all bulk payouts for a merchant
   */
  async getBulkPayouts(merchantId: string) {
    return this.prisma.bulkPayout.findMany({
      where: { merchantId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { items: true },
        },
      },
    });
  }

  /**
   * Get details of a specific bulk payout (with all items)
   */
  async getBulkPayoutDetails(merchantId: string, bulkPayoutId: string) {
    const bulkPayout = await this.prisma.bulkPayout.findFirst({
      where: { id: bulkPayoutId, merchantId },
      include: {
        items: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!bulkPayout) {
      throw new NotFoundException('Batch de paiement non trouvé');
    }

    return bulkPayout;
  }

  /**
   * Execute a DRAFT bulk payout batch
   * Processes each item sequentially, calling the appropriate provider for each transfer.
   */
  async executeBulkPayout(merchantId: string, bulkPayoutId: string) {
    const bulkPayout = await this.prisma.bulkPayout.findFirst({
      where: { id: bulkPayoutId, merchantId },
      include: { items: true },
    });

    if (!bulkPayout) {
      throw new NotFoundException('Batch de paiement non trouvé');
    }

    if (bulkPayout.status !== BulkPayoutStatus.DRAFT) {
      throw new BadRequestException('Ce batch a déjà été traité ou est en cours de traitement');
    }

    // Re-verify balance
    const merchant = await this.prisma.merchant.findUnique({
      where: { id: merchantId },
    });

    if (Number(merchant!.balance) < Number(bulkPayout.totalAmount)) {
      throw new BadRequestException('Solde insuffisant pour exécuter ce batch');
    }

    // Mark as PROCESSING
    await this.prisma.bulkPayout.update({
      where: { id: bulkPayoutId },
      data: { status: BulkPayoutStatus.PROCESSING },
    });

    // Deduct total amount from merchant balance upfront
    await this.prisma.merchant.update({
      where: { id: merchantId },
      data: { balance: { decrement: Number(bulkPayout.totalAmount) } },
    });

    let successCount = 0;
    let failedCount = 0;
    let totalFees = 0;

    // Process each item
    for (const item of bulkPayout.items) {
      try {
        const providerInstance = await this.providersService.getProviderInstance(item.provider);

        // Use createPayment to simulate the payout (in production, you'd use a dedicated payout API)
        const result = await providerInstance.createPayment({
          amount: Number(item.amount),
          currency: bulkPayout.currency,
          reference: `bp_${bulkPayoutId}_${item.id}`,
          customerEmail: 'payout@innovpay.com',
          customerPhone: item.recipientPhone,
        });

        const fee = Number(item.amount) * 0.015; // 1.5% payout fee
        totalFees += fee;

        await this.prisma.payoutItem.update({
          where: { id: item.id },
          data: {
            status: PayoutItemStatus.SUCCESS,
            providerRef: result.providerReference,
          },
        });

        successCount++;
      } catch (error: any) {
        await this.prisma.payoutItem.update({
          where: { id: item.id },
          data: {
            status: PayoutItemStatus.FAILED,
            errorMessage: error.message || 'Erreur inconnue du provider',
          },
        });

        failedCount++;
      }
    }

    // Refund failed items back to merchant balance
    if (failedCount > 0) {
      const failedItems = bulkPayout.items.filter((_, idx) => {
        // Simple approach: re-query to check updated statuses
        return false; // Will be handled by the update below
      });

      const failedTotal = await this.prisma.payoutItem.aggregate({
        where: {
          bulkPayoutId,
          status: PayoutItemStatus.FAILED,
        },
        _sum: { amount: true },
      });

      if (failedTotal._sum.amount) {
        await this.prisma.merchant.update({
          where: { id: merchantId },
          data: { balance: { increment: Number(failedTotal._sum.amount) } },
        });
      }
    }

    // Update final status
    const finalStatus = failedCount === bulkPayout.items.length
      ? BulkPayoutStatus.FAILED
      : BulkPayoutStatus.COMPLETED;

    return this.prisma.bulkPayout.update({
      where: { id: bulkPayoutId },
      data: {
        status: finalStatus,
        successCount,
        failedCount,
        totalFees,
      },
      include: {
        items: true,
      },
    });
  }
}
