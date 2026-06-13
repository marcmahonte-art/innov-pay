import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AutoCollectService {
  constructor(private readonly prisma: PrismaService) {}

  async createCollection(
    merchantId: string,
    data: {
      name: string;
      type: string;
      amount?: number;
      currency?: string;
      endDate?: string;
      reminderMsg?: string;
      frequency: string;
      members: Array<{
        name: string;
        phone: string;
        email?: string;
        amount: number;
      }>;
    },
  ) {
    return this.prisma.$transaction(async (tx) => {
      const collection = await tx.collection.create({
        data: {
          merchantId,
          name: data.name,
          type: data.type,
          amount: data.amount ? Number(data.amount) : null,
          currency: data.currency || 'XAF',
          endDate: data.endDate ? new Date(data.endDate) : null,
          reminderMsg: data.reminderMsg || null,
          frequency: data.frequency,
        },
      });

      if (data.members && data.members.length > 0) {
        await tx.collectionMember.createMany({
          data: data.members.map((m) => ({
            collectionId: collection.id,
            name: m.name,
            phone: m.phone,
            email: m.email || null,
            amount: Number(m.amount),
            status: 'PENDING',
          })),
        });
      }

      return tx.collection.findUnique({
        where: { id: collection.id },
        include: { members: true },
      });
    });
  }

  async getCollections(merchantId: string) {
    const collections = await this.prisma.collection.findMany({
      where: { merchantId },
      include: {
        _count: {
          select: { members: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Compute status counts for each collection
    const result = await Promise.all(
      collections.map(async (c) => {
        const paidCount = await this.prisma.collectionMember.count({
          where: { collectionId: c.id, status: 'PAID' },
        });
        const totalAmount = await this.prisma.collectionMember.aggregate({
          where: { collectionId: c.id },
          _sum: { amount: true },
        });
        const paidAmount = await this.prisma.collectionMember.aggregate({
          where: { collectionId: c.id, status: 'PAID' },
          _sum: { amount: true },
        });

        return {
          ...c,
          totalMembers: c._count.members,
          paidMembers: paidCount,
          totalAmount: totalAmount._sum.amount || 0,
          collectedAmount: paidAmount._sum.amount || 0,
        };
      }),
    );

    return result;
  }

  async getCollectionDetails(merchantId: string, id: string) {
    const collection = await this.prisma.collection.findUnique({
      where: { id },
      include: { members: true },
    });

    if (!collection || collection.merchantId !== merchantId) {
      throw new NotFoundException('Campagne de collecte introuvable');
    }

    return collection;
  }

  async triggerReminder(merchantId: string, collectionId: string, memberId?: string) {
    const collection = await this.prisma.collection.findUnique({
      where: { id: collectionId },
    });

    if (!collection || collection.merchantId !== merchantId) {
      throw new NotFoundException('Campagne de collecte introuvable');
    }

    const whereClause: any = { collectionId, status: 'PENDING' };
    if (memberId) {
      whereClause.id = memberId;
    }

    const pendingMembers = await this.prisma.collectionMember.findMany({
      where: whereClause,
    });

    if (pendingMembers.length === 0) {
      return { message: 'Aucun rappel à envoyer (tous les membres ont payé ou le membre spécifié a payé).' };
    }

    // Simulate sending SMS / Emails
    console.log(`[AutoCollectService] Sending reminders for Campaign: ${collection.name}`);
    pendingMembers.forEach((member) => {
      const msg = collection.reminderMsg || `Rappel de paiement: Veuillez régler votre facture de ${member.amount} FCFA.`;
      console.log(`[SMS sent to ${member.phone}] Message: ${msg}`);
    });

    return {
      message: `${pendingMembers.length} rappel(s) envoyé(s) avec succès.`,
      count: pendingMembers.length,
    };
  }

  async updateMemberPaymentStatus(
    merchantId: string,
    collectionId: string,
    memberId: string,
    status: 'PAID' | 'PENDING' | 'OVERDUE',
  ) {
    const collection = await this.prisma.collection.findUnique({
      where: { id: collectionId },
    });

    if (!collection || collection.merchantId !== merchantId) {
      throw new NotFoundException('Campagne de collecte introuvable');
    }

    const member = await this.prisma.collectionMember.findUnique({
      where: { id: memberId },
    });

    if (!member || member.collectionId !== collectionId) {
      throw new NotFoundException('Membre introuvable dans cette collecte');
    }

    return this.prisma.collectionMember.update({
      where: { id: memberId },
      data: {
        status,
        paidAt: status === 'PAID' ? new Date() : null,
      },
    });
  }

  async updateCollection(merchantId: string, id: string, data: any) {
    // Ensure the collection belongs to the merchant
    const collection = await this.prisma.collection.findUnique({
      where: { id },
    });
    if (!collection || collection.merchantId !== merchantId) {
      throw new NotFoundException('Campagne de collecte introuvable');
    }
    // Update collection fields (allow partial update)
    const updated = await this.prisma.collection.update({
      where: { id },
      data: {
        name: data.name ?? undefined,
        type: data.type ?? undefined,
        amount: data.amount ? Number(data.amount) : undefined,
        currency: data.currency ?? undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        reminderMsg: data.reminderMsg ?? undefined,
        frequency: data.frequency ?? undefined,
      },
      include: { members: true },
    });
    return updated;
  }

  async deleteCollection(merchantId: string, id: string) {
    const collection = await this.prisma.collection.findUnique({
      where: { id },
    });

    if (!collection || collection.merchantId !== merchantId) {
      throw new NotFoundException('Campagne de collecte introuvable');
    }

    await this.prisma.collection.delete({
      where: { id },
    });

    return { message: 'Campagne de collecte supprimée avec succès' };
  }
}
