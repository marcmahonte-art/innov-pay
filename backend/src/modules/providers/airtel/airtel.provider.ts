import { Injectable } from '@nestjs/common';
import { PaymentProvider, ProviderPaymentResponse, ProviderStatusResponse, ProviderRefundResponse } from '../interfaces/payment-provider.interface';
import * as crypto from 'crypto';

@Injectable()
export class AirtelProvider implements PaymentProvider {
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
    // Simulate Airtel Money API call
    console.log(`[AirtelProvider] Initiating payment for ${payment.amount} ${payment.currency} for phone ${payment.customerPhone}`);
    
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const providerReference = `airtel_tx_${crypto.randomUUID().substring(0, 8)}`;
    
    // Return standard Airtel response
    return {
      providerReference,
      status: 'PENDING',
      instructions: `Veuillez composer le *133# sur votre numéro Airtel pour confirmer le paiement de ${payment.amount} FCFA.`,
    };
  }

  async getPaymentStatus(providerReference: string): Promise<ProviderStatusResponse> {
    console.log(`[AirtelProvider] Fetching payment status for reference ${providerReference}`);
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Simulate different outcomes based on reference suffix for testing
    if (providerReference.endsWith('f')) {
      return { status: 'FAILED', rawResponse: { code: '402', error: 'Insufficient balance' } };
    }
    
    return { status: 'SUCCESS', rawResponse: { code: '200', transaction_status: 'SUCCESS' } };
  }

  async refundPayment(providerReference: string, amount: number): Promise<ProviderRefundResponse> {
    console.log(`[AirtelProvider] Refunding payment for reference ${providerReference} amount ${amount}`);
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      refundReference: `airtel_ref_${crypto.randomUUID().substring(0, 8)}`,
      status: 'SUCCESS',
    };
  }

  async validateWebhook(headers: Record<string, string>, body: any): Promise<boolean> {
    console.log('[AirtelProvider] Validating webhook signature');
    const signature = headers['x-airtel-signature'];
    if (!signature) return false;
    
    // Simulate HMAC validation against client secret
    const expectedSignature = crypto
      .createHmac('sha256', this.credentials.clientSecret || 'airtel_mock_secret')
      .update(JSON.stringify(body))
      .digest('hex');

    return signature === expectedSignature;
  }
}
