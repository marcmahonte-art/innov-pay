import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentsService } from '../payments/payments.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { PaySessionDto } from './dto/pay-session.dto';
import * as crypto from 'crypto';

interface CheckoutSession {
  id: string;
  merchantId: string;
  amount: number;
  currency: string;
  merchantReference: string;
  customerEmail: string;
  customerPhone?: string;
  successUrl?: string;
  cancelUrl?: string;
  metadata?: any;
  status: 'open' | 'completed' | 'expired';
  isLive: boolean;
  createdAt: Date;
}

@Injectable()
export class CheckoutService {
  // In-memory storage for checkout sessions
  private sessions = new Map<string, CheckoutSession>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentsService: PaymentsService,
  ) {}

  /**
   * Create a new checkout session (server-to-server with API key)
   */
  async createSession(merchantId: string, isLive: boolean, dto: CreateSessionDto) {
    const sessionId = `cs_${isLive ? 'live' : 'test'}_${crypto.randomUUID()}`;

    const session: CheckoutSession = {
      id: sessionId,
      merchantId,
      amount: dto.amount,
      currency: dto.currency || 'XAF',
      merchantReference: dto.merchantReference,
      customerEmail: dto.customerEmail,
      customerPhone: dto.customerPhone,
      successUrl: dto.successUrl,
      cancelUrl: dto.cancelUrl,
      metadata: dto.metadata,
      status: 'open',
      isLive,
      createdAt: new Date(),
    };

    this.sessions.set(sessionId, session);

    return {
      id: sessionId,
      url: `http://localhost:3000/checkout/${sessionId}`, // Local dev frontend url (or relative)
      amount: session.amount,
      currency: session.currency,
      status: session.status,
    };
  }

  /**
   * Get public details of a checkout session
   */
  async getSession(sessionId: string) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new NotFoundException('Session de paiement introuvable ou expirée');
    }

    // Load merchant business name
    const merchant = await this.prisma.merchant.findUnique({
      where: { id: session.merchantId },
      select: { businessName: true },
    });

    return {
      id: session.id,
      merchantId: session.merchantId,
      merchantName: merchant?.businessName || 'Innov Pay Merchant',
      amount: session.amount,
      currency: session.currency,
      customerEmail: session.customerEmail,
      customerPhone: session.customerPhone,
      status: session.status,
      successUrl: session.successUrl,
      cancelUrl: session.cancelUrl,
    };
  }

  /**
   * Pay a checkout session (submit payment)
   */
  async paySession(sessionId: string, dto: PaySessionDto) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new NotFoundException('Session de paiement introuvable ou expirée');
    }

    if (session.status !== 'open') {
      throw new BadRequestException('Cette session a déjà été payée ou a expiré');
    }

    // Trigger the actual payment creation/execution
    const paymentResult = await this.paymentsService.createPayment(session.merchantId, {
      amount: session.amount,
      currency: session.currency,
      paymentMethod: dto.paymentMethod,
      customerEmail: session.customerEmail,
      customerPhone: dto.customerPhone || session.customerPhone,
      merchantReference: session.merchantReference,
      metadata: session.metadata,
    });

    // Mark session as completed
    session.status = 'completed';
    this.sessions.set(sessionId, session);

    return {
      ...paymentResult,
      successUrl: session.successUrl,
      cancelUrl: session.cancelUrl,
    };
  }
}
