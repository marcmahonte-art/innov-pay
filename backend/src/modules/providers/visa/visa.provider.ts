import { Injectable } from '@nestjs/common';
import { PaymentProvider, ProviderPaymentResponse, ProviderStatusResponse, ProviderRefundResponse } from '../interfaces/payment-provider.interface';
import * as crypto from 'crypto';

@Injectable()
export class VisaProvider implements PaymentProvider {
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
    console.log(`[VisaProvider] Processing Visa card transaction for ${payment.amount} ${payment.currency}`);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const providerReference = `visa_tx_${crypto.randomUUID().substring(0, 8)}`;
    
    // Simulate 3D Secure redirect
    return {
      providerReference,
      status: 'PENDING',
      redirectUrl: `https://mock.visa-gateway.com/3ds/secure-auth?tx=${providerReference}`,
    };
  }

  async getPaymentStatus(providerReference: string): Promise<ProviderStatusResponse> {
    console.log(`[VisaProvider] Checking Visa txn state for ${providerReference}`);
    await new Promise((resolve) => setTimeout(resolve, 200));

    return {
      status: 'SUCCESS',
      rawResponse: { authCode: '04829', status: 'SETTLED' },
    };
  }

  async refundPayment(providerReference: string, amount: number): Promise<ProviderRefundResponse> {
    console.log(`[VisaProvider] Initiating card refund for ${providerReference}`);
    await new Promise((resolve) => setTimeout(resolve, 400));
    return {
      refundReference: `visa_ref_${crypto.randomUUID().substring(0, 8)}`,
      status: 'SUCCESS',
    };
  }

  async validateWebhook(headers: Record<string, string>, body: any): Promise<boolean> {
    // Standard signature validation (e.g. CyberSource secret key)
    const signature = headers['x-visa-signature'];
    if (!signature) return false;

    const expectedSignature = crypto
      .createHmac('sha256', this.credentials.sharedSecret || 'visa_mock_secret')
      .update(JSON.stringify(body))
      .digest('hex');

    return signature === expectedSignature;
  }
}
