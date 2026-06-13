import { Injectable, Logger } from '@nestjs/common';
import { PaymentProvider, ProviderPaymentResponse, ProviderStatusResponse, ProviderRefundResponse } from '../interfaces/payment-provider.interface';
import axios from 'axios';
import * as crypto from 'crypto';

@Injectable()
export class AirtelProvider implements PaymentProvider {
  private readonly logger = new Logger(AirtelProvider.name);
  private credentials: any;

  constructor(credentials: any = {}) {
    this.credentials = credentials;
  }

  private isProduction(): boolean {
    return process.env.PAYMENT_MODE === 'production' && 
      !!this.credentials.clientId && 
      !!this.credentials.clientSecret;
  }

  private getBaseUrl(): string {
    return this.credentials.baseUrl || process.env.AIRTEL_BASE_URL || 'https://openapi.airtel.in';
  }

  private async getAccessToken(): Promise<string> {
    const baseUrl = this.getBaseUrl();
    const url = `${baseUrl}/auth/oauth2/token`;
    
    const response = await axios.post(
      url,
      {
        client_id: this.credentials.clientId,
        client_secret: this.credentials.clientSecret,
        grant_type: 'client_credentials',
      },
      {
        headers: { 'Content-Type': 'application/json' },
      },
    );

    if (response.data && response.data.access_token) {
      return response.data.access_token;
    }
    throw new Error('Failed to retrieve Airtel access token');
  }

  async createPayment(payment: {
    amount: number;
    currency: string;
    reference: string;
    customerEmail: string;
    customerPhone?: string;
  }): Promise<ProviderPaymentResponse> {
    if (!this.isProduction()) {
      this.logger.log(`[AirtelProvider Sandbox] Mock push payment for ${payment.amount} XAF`);
      await new Promise((resolve) => setTimeout(resolve, 300));
      return {
        providerReference: `airtel_tx_${crypto.randomUUID().substring(0, 8)}`,
        status: 'PENDING',
        instructions: `Veuillez composer le *133# sur votre numéro Airtel pour confirmer le paiement de ${payment.amount} FCFA.`,
      };
    }

    try {
      const token = await this.getAccessToken();
      const baseUrl = this.getBaseUrl();
      const url = `${baseUrl}/merchant/v1/payments/`;

      const phone = payment.customerPhone?.replace(/\+/g, '').replace(/\s/g, '') || '';

      const response = await axios.post(
        url,
        {
          reference: payment.reference,
          subscriber: {
            country: 'TD',
            currency: 'XAF',
            msisdn: phone,
          },
          transaction: {
            amount: payment.amount,
            id: payment.reference,
            description: `Paiement Innov Pay Ref ${payment.reference}`,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'X-Country': 'TD',
            'X-Currency': 'XAF',
          },
        },
      );

      const status: 'PENDING' | 'FAILED' = response.data?.status?.code === '200' ? 'PENDING' : 'FAILED';
      return {
        providerReference: response.data?.transaction?.id || payment.reference,
        status,
        instructions: response.data?.status?.message || `Veuillez confirmer le push USSD sur votre mobile Airtel.`,
        rawResponse: response.data,
      };
    } catch (err: any) {
      this.logger.error(`Airtel Payment creation failed: ${err.message}`, err.response?.data);
      return {
        providerReference: `airtel_failed_${Date.now()}`,
        status: 'FAILED',
        instructions: 'La transaction a échoué lors de la connexion à l\'opérateur Airtel.',
        rawResponse: err.response?.data || { error: err.message },
      };
    }
  }

  async getPaymentStatus(providerReference: string): Promise<ProviderStatusResponse> {
    if (!this.isProduction()) {
      if (providerReference.endsWith('f')) {
        return { status: 'FAILED', rawResponse: { code: '402', error: 'Insufficient balance' } };
      }
      return { status: 'SUCCESS', rawResponse: { code: '200', transaction_status: 'SUCCESS' } };
    }

    try {
      const token = await this.getAccessToken();
      const baseUrl = this.getBaseUrl();
      const url = `${baseUrl}/standard/v1/payments/${providerReference}`;

      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Country': 'TD',
          'X-Currency': 'XAF',
        },
      });

      const airtelStatus = response.data?.transaction?.status;
      let status: 'PENDING' | 'SUCCESS' | 'FAILED' = 'PENDING';
      if (airtelStatus === 'SUCCESS') status = 'SUCCESS';
      else if (airtelStatus === 'FAILED') status = 'FAILED';

      return {
        status,
        rawResponse: response.data,
      };
    } catch (err: any) {
      this.logger.error(`Airtel status sync failed: ${err.message}`);
      return { status: 'PENDING', rawResponse: err.response?.data || { error: err.message } };
    }
  }

  async refundPayment(providerReference: string, amount: number): Promise<ProviderRefundResponse> {
    if (!this.isProduction()) {
      return {
        refundReference: `airtel_ref_${crypto.randomUUID().substring(0, 8)}`,
        status: 'SUCCESS',
      };
    }

    try {
      const token = await this.getAccessToken();
      const baseUrl = this.getBaseUrl();
      const url = `${baseUrl}/standard/v1/payments/refund`;

      const response = await axios.post(
        url,
        {
          transaction: {
            airtel_money_id: providerReference,
            amount,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'X-Country': 'TD',
            'X-Currency': 'XAF',
          },
        },
      );

      const status: 'SUCCESS' | 'FAILED' = response.data?.status?.code === '200' ? 'SUCCESS' : 'FAILED';
      return {
        refundReference: response.data?.transaction?.refund_id || `airtel_ref_${Date.now()}`,
        status,
        rawResponse: response.data,
      };
    } catch (err: any) {
      this.logger.error(`Airtel refund failed: ${err.message}`);
      return { status: 'FAILED', rawResponse: err.response?.data || { error: err.message } };
    }
  }

  async validateWebhook(headers: Record<string, string>, body: any): Promise<boolean> {
    const signature = headers['x-airtel-signature'];
    if (!signature) return false;
    
    const clientSecret = this.credentials.clientSecret || 'airtel_mock_secret';
    const expectedSignature = crypto
      .createHmac('sha256', clientSecret)
      .update(JSON.stringify(body))
      .digest('hex');

    return signature === expectedSignature;
  }
}
