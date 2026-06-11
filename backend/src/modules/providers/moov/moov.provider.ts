import { Injectable } from '@nestjs/common';
import { PaymentProvider, ProviderPaymentResponse, ProviderStatusResponse, ProviderRefundResponse } from '../interfaces/payment-provider.interface';
import * as crypto from 'crypto';

@Injectable()
export class MoovProvider implements PaymentProvider {
  private credentials: any;

  constructor(credentials: any = {}) {
    this.credentials = credentials;
  }

  async createPayment(payment: {
    amount: number;
    currency: string;
    reference: string;
    customerEmail: string;
    customerPhone?: string;
  }): Promise<ProviderPaymentResponse> {
    console.log(`[MoovProvider] Initiating push payment for ${payment.amount} ${payment.currency} on ${payment.customerPhone}`);
    await new Promise((resolve) => setTimeout(resolve, 300));

    const providerReference = `moov_tx_${crypto.randomUUID().substring(0, 8)}`;
    
    return {
      providerReference,
      status: 'PENDING',
      instructions: `Un message de validation USSD vous a été envoyé. Veuillez saisir votre code PIN Moov Money.`,
    };
  }

  async getPaymentStatus(providerReference: string): Promise<ProviderStatusResponse> {
    console.log(`[MoovProvider] Querying transaction status for ${providerReference}`);
    await new Promise((resolve) => setTimeout(resolve, 200));

    return {
      status: 'SUCCESS',
      rawResponse: { status: 'COMPLETED', code: '00' },
    };
  }

  async refundPayment(providerReference: string, amount: number): Promise<ProviderRefundResponse> {
    console.log(`[MoovProvider] Refunding payment ${providerReference}`);
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      refundReference: `moov_ref_${crypto.randomUUID().substring(0, 8)}`,
      status: 'SUCCESS',
    };
  }

  async validateWebhook(headers: Record<string, string>, body: any): Promise<boolean> {
    const signature = headers['x-moov-signature'];
    if (!signature) return false;

    const expectedSignature = crypto
      .createHmac('sha256', this.credentials.secretKey || 'moov_mock_secret')
      .update(JSON.stringify(body))
      .digest('hex');

    return signature === expectedSignature;
  }
}
