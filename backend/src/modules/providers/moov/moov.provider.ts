import { Injectable, Logger } from '@nestjs/common';
import { PaymentProvider, ProviderPaymentResponse, ProviderStatusResponse, ProviderRefundResponse } from '../interfaces/payment-provider.interface';
import axios from 'axios';
import * as crypto from 'crypto';

@Injectable()
export class MoovProvider implements PaymentProvider {
  private readonly logger = new Logger(MoovProvider.name);
  private credentials: any;

  constructor(credentials: any = {}) {
    this.credentials = credentials;
  }

  private isProduction(): boolean {
    return process.env.PAYMENT_MODE === 'production' && 
      !!this.credentials.apiKey && 
      !!this.credentials.merchantCode;
  }

  private getBaseUrl(): string {
    return this.credentials.baseUrl || process.env.MOOV_BASE_URL || 'https://api.moov-africa.td';
  }

  async createPayment(payment: {
    amount: number;
    currency: string;
    reference: string;
    customerEmail: string;
    customerPhone?: string;
  }): Promise<ProviderPaymentResponse> {
    if (!this.isProduction()) {
      this.logger.log(`[MoovProvider Sandbox] Mock push payment for ${payment.amount} XAF`);
      await new Promise((resolve) => setTimeout(resolve, 300));
      return {
        providerReference: `moov_tx_${crypto.randomUUID().substring(0, 8)}`,
        status: 'PENDING',
        instructions: `Un message de validation USSD vous a été envoyé. Veuillez saisir votre code PIN Moov Money.`,
      };
    }

    try {
      const baseUrl = this.getBaseUrl();
      const url = `${baseUrl}/payment`;
      const phone = payment.customerPhone?.replace(/\+/g, '').replace(/\s/g, '') || '';

      const response = await axios.post(
        url,
        {
          merchant_code: this.credentials.merchantCode,
          amount: payment.amount,
          currency: payment.currency || 'XAF',
          phone,
          reference: payment.reference,
          description: `Innov Pay Ref ${payment.reference}`,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': this.credentials.apiKey,
          },
        },
      );

      const status: 'PENDING' | 'FAILED' = response.data?.status === 'SUCCESS' || response.data?.code === '00' ? 'PENDING' : 'FAILED';
      return {
        providerReference: response.data?.transaction_id || payment.reference,
        status,
        instructions: response.data?.message || 'Veuillez composer votre code PIN Moov pour valider la transaction.',
        rawResponse: response.data,
      };
    } catch (err: any) {
      this.logger.error(`Moov Payment creation failed: ${err.message}`, err.response?.data);
      return {
        providerReference: `moov_failed_${Date.now()}`,
        status: 'FAILED',
        instructions: 'La connexion à l\'opérateur Moov Money a échoué.',
        rawResponse: err.response?.data || { error: err.message },
      };
    }
  }

  async getPaymentStatus(providerReference: string): Promise<ProviderStatusResponse> {
    if (!this.isProduction()) {
      return {
        status: 'SUCCESS',
        rawResponse: { status: 'COMPLETED', code: '00' },
      };
    }

    try {
      const baseUrl = this.getBaseUrl();
      const url = `${baseUrl}/payment/status/${providerReference}`;

      const response = await axios.get(url, {
        headers: {
          'X-Api-Key': this.credentials.apiKey,
        },
      });

      const moovStatus = response.data?.status;
      let status: 'PENDING' | 'SUCCESS' | 'FAILED' = 'PENDING';
      if (moovStatus === 'COMPLETED' || response.data?.code === '00') status = 'SUCCESS';
      else if (moovStatus === 'FAILED' || response.data?.code === '99') status = 'FAILED';

      return {
        status,
        rawResponse: response.data,
      };
    } catch (err: any) {
      this.logger.error(`Moov status sync failed: ${err.message}`);
      return { status: 'PENDING', rawResponse: err.response?.data || { error: err.message } };
    }
  }

  async refundPayment(providerReference: string, amount: number): Promise<ProviderRefundResponse> {
    if (!this.isProduction()) {
      return {
        refundReference: `moov_ref_${crypto.randomUUID().substring(0, 8)}`,
        status: 'SUCCESS',
      };
    }

    try {
      const baseUrl = this.getBaseUrl();
      const url = `${baseUrl}/payment/refund`;

      const response = await axios.post(
        url,
        {
          transaction_id: providerReference,
          amount,
          merchant_code: this.credentials.merchantCode,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': this.credentials.apiKey,
          },
        },
      );

      const status: 'SUCCESS' | 'FAILED' = response.data?.status === 'SUCCESS' || response.data?.code === '00' ? 'SUCCESS' : 'FAILED';
      return {
        refundReference: response.data?.refund_id || `moov_ref_${Date.now()}`,
        status,
        rawResponse: response.data,
      };
    } catch (err: any) {
      this.logger.error(`Moov refund failed: ${err.message}`);
      return { status: 'FAILED', rawResponse: err.response?.data || { error: err.message } };
    }
  }

  async validateWebhook(headers: Record<string, string>, body: any): Promise<boolean> {
    const signature = headers['x-moov-signature'];
    if (!signature) return false;

    const secretKey = this.credentials.apiKey || 'moov_mock_secret';
    const expectedSignature = crypto
      .createHmac('sha256', secretKey)
      .update(JSON.stringify(body))
      .digest('hex');

    return signature === expectedSignature;
  }
}
