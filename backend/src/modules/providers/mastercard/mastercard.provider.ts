import { Injectable } from '@nestjs/common';
import { PaymentProvider, ProviderPaymentResponse, ProviderStatusResponse, ProviderRefundResponse } from '../interfaces/payment-provider.interface';
import * as crypto from 'crypto';

@Injectable()
export class MastercardProvider implements PaymentProvider {
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
    console.log(`[MastercardProvider] Processing Mastercard transaction of ${payment.amount} ${payment.currency}`);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const providerReference = `mastercard_tx_${crypto.randomUUID().substring(0, 8)}`;
    
    // Simulate 3D Secure redirect
    return {
      providerReference,
      status: 'PENDING',
      redirectUrl: `https://mock.mastercard-gateway.com/3ds/auth?tx=${providerReference}`,
    };
  }

  async getPaymentStatus(providerReference: string): Promise<ProviderStatusResponse> {
    console.log(`[MastercardProvider] Checking transaction status for ${providerReference}`);
    await new Promise((resolve) => setTimeout(resolve, 200));

    return {
      status: 'SUCCESS',
      rawResponse: { approvalCode: 'MC7421', transactionState: 'SUCCESS' },
    };
  }

  async refundPayment(providerReference: string, amount: number): Promise<ProviderRefundResponse> {
    console.log(`[MastercardProvider] Refunding transaction ${providerReference} amount ${amount}`);
    await new Promise((resolve) => setTimeout(resolve, 400));
    return {
      refundReference: `mastercard_ref_${crypto.randomUUID().substring(0, 8)}`,
      status: 'SUCCESS',
    };
  }

  async validateWebhook(headers: Record<string, string>, body: any): Promise<boolean> {
    const signature = headers['x-mastercard-signature'];
    if (!signature) return false;

    const expectedSignature = crypto
      .createHmac('sha256', this.credentials.sharedSecret || 'mastercard_mock_secret')
      .update(JSON.stringify(body))
      .digest('hex');

    return signature === expectedSignature;
  }
}
