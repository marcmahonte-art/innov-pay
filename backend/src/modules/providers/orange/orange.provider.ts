import { Injectable } from '@nestjs/common';
import { PaymentProvider, ProviderPaymentResponse, ProviderStatusResponse, ProviderRefundResponse } from '../interfaces/payment-provider.interface';
import * as crypto from 'crypto';

@Injectable()
export class OrangeProvider implements PaymentProvider {
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
    console.log(`[OrangeProvider] Initiating Web Payment for ${payment.amount} ${payment.currency}`);
    await new Promise((resolve) => setTimeout(resolve, 400));

    const providerReference = `orange_tx_${crypto.randomUUID().substring(0, 8)}`;
    
    // Orange Money Web Payment redirect flow
    return {
      providerReference,
      status: 'PENDING',
      redirectUrl: `https://mock.orange.money/checkout?token=${providerReference}&amount=${payment.amount}`,
    };
  }

  async getPaymentStatus(providerReference: string): Promise<ProviderStatusResponse> {
    console.log(`[OrangeProvider] Checking web payment status for ${providerReference}`);
    await new Promise((resolve) => setTimeout(resolve, 200));

    return {
      status: 'SUCCESS',
      rawResponse: { status: 'SUCCESSFUL', tx_id: providerReference },
    };
  }

  async refundPayment(providerReference: string, amount: number): Promise<ProviderRefundResponse> {
    console.log(`[OrangeProvider] Refunding payment ${providerReference}`);
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      refundReference: `orange_ref_${crypto.randomUUID().substring(0, 8)}`,
      status: 'SUCCESS',
    };
  }

  async validateWebhook(headers: Record<string, string>, body: any): Promise<boolean> {
    const signature = headers['x-orange-signature'];
    if (!signature) return false;

    const expectedSignature = crypto
      .createHmac('sha256', this.credentials.merchantKey || 'orange_mock_secret')
      .update(JSON.stringify(body))
      .digest('hex');

    return signature === expectedSignature;
  }
}
