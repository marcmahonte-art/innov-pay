import { Injectable, Logger } from '@nestjs/common';
import { PaymentProvider, ProviderPaymentResponse, ProviderStatusResponse, ProviderRefundResponse } from '../interfaces/payment-provider.interface';
import axios from 'axios';
import * as crypto from 'crypto';

@Injectable()
export class OrangeProvider implements PaymentProvider {
  private readonly logger = new Logger(OrangeProvider.name);
  private credentials: any;

  constructor(credentials: any = {}) {
    this.credentials = credentials;
  }

  private isProduction(): boolean {
    return process.env.PAYMENT_MODE === 'production' && 
      !!this.credentials.clientId && 
      !!this.credentials.clientSecret &&
      !!this.credentials.merchantKey;
  }

  private getBaseUrl(): string {
    return this.credentials.baseUrl || process.env.ORANGE_BASE_URL || 'https://api.orange.com';
  }

  private async getAccessToken(): Promise<string> {
    const baseUrl = this.getBaseUrl();
    const url = `${baseUrl}/oauth/v3/token`;

    const authHeader = Buffer.from(
      `${this.credentials.clientId}:${this.credentials.clientSecret}`,
    ).toString('base64');

    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');

    const response = await axios.post(url, params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${authHeader}`,
      },
    });

    if (response.data && response.data.access_token) {
      return response.data.access_token;
    }
    throw new Error('Failed to retrieve Orange access token');
  }

  async createPayment(payment: {
    amount: number;
    currency: string;
    reference: string;
    customerEmail: string;
    customerPhone?: string;
  }): Promise<ProviderPaymentResponse> {
    if (!this.isProduction()) {
      this.logger.log(`[OrangeProvider Sandbox] Mock Web Payment for ${payment.amount} XAF`);
      await new Promise((resolve) => setTimeout(resolve, 400));
      const ref = `orange_tx_${crypto.randomUUID().substring(0, 8)}`;
      return {
        providerReference: ref,
        status: 'PENDING',
        redirectUrl: `https://mock.orange.money/checkout?token=${ref}&amount=${payment.amount}`,
      };
    }

    try {
      const token = await this.getAccessToken();
      const baseUrl = this.getBaseUrl();
      
      const isSandboxOrDev = baseUrl.includes('dev') || baseUrl.includes('sandbox') || !process.env.PAYMENT_MODE;
      const endpointPath = isSandboxOrDev
        ? '/orange-money-webpay/dev/v1/webpayment'
        : '/orange-money-webpay/v1/webpayment';
      const url = `${baseUrl}${endpointPath}`;

      const callbackUrl = process.env.FRONTEND_URL || 'https://frontend-polo6.vercel.app';

      const response = await axios.post(
        url,
        {
          merchant_key: this.credentials.merchantKey,
          currency: 'OUV',
          order_id: payment.reference,
          amount: payment.amount,
          reference: `Innov Pay Ref ${payment.reference}`,
          return_url: `${callbackUrl}/checkout/success?ref=${payment.reference}`,
          cancel_url: `${callbackUrl}/checkout/cancel?ref=${payment.reference}`,
          notif_url: `${process.env.BACKEND_URL || 'https://backend-polo6.vercel.app'}/payments/webhook/orange`,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        },
      );

      return {
        providerReference: response.data?.pay_token || payment.reference,
        status: 'PENDING',
        redirectUrl: response.data?.payment_url,
        rawResponse: response.data,
      };
    } catch (err: any) {
      this.logger.error(`Orange Payment creation failed: ${err.message}`, err.response?.data);
      return {
        providerReference: `orange_failed_${Date.now()}`,
        status: 'FAILED',
        instructions: 'La redirection Orange Money Web Payment a échoué.',
        rawResponse: err.response?.data || { error: err.message },
      };
    }
  }

  async getPaymentStatus(providerReference: string): Promise<ProviderStatusResponse> {
    if (!this.isProduction()) {
      return {
        status: 'SUCCESS',
        rawResponse: { status: 'SUCCESSFUL', tx_id: providerReference },
      };
    }

    try {
      const token = await this.getAccessToken();
      const baseUrl = this.getBaseUrl();
      const url = `${baseUrl}/orange-money-webpay/v1/transactionstatus/${providerReference}`;

      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const orangeStatus = response.data?.status;
      let status: 'PENDING' | 'SUCCESS' | 'FAILED' = 'PENDING';
      if (orangeStatus === 'SUCCESSFUL') status = 'SUCCESS';
      else if (orangeStatus === 'FAILED') status = 'FAILED';

      return {
        status,
        rawResponse: response.data,
      };
    } catch (err: any) {
      this.logger.error(`Orange status sync failed: ${err.message}`);
      return { status: 'PENDING', rawResponse: err.response?.data || { error: err.message } };
    }
  }

  async refundPayment(providerReference: string, amount: number): Promise<ProviderRefundResponse> {
    if (!this.isProduction()) {
      return {
        refundReference: `orange_ref_${crypto.randomUUID().substring(0, 8)}`,
        status: 'SUCCESS',
      };
    }

    try {
      const token = await this.getAccessToken();
      const baseUrl = this.getBaseUrl();
      const url = `${baseUrl}/orange-money-webpay/v1/refund`;

      const response = await axios.post(
        url,
        {
          pay_token: providerReference,
          amount,
          merchant_key: this.credentials.merchantKey,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        },
      );

      const status: 'SUCCESS' | 'FAILED' = response.data?.status === 'SUCCESSFUL' ? 'SUCCESS' : 'FAILED';
      return {
        refundReference: response.data?.refund_id || `orange_ref_${Date.now()}`,
        status,
        rawResponse: response.data,
      };
    } catch (err: any) {
      this.logger.error(`Orange refund failed: ${err.message}`);
      return { status: 'FAILED', rawResponse: err.response?.data || { error: err.message } };
    }
  }

  async validateWebhook(headers: Record<string, string>, body: any): Promise<boolean> {
    const signature = headers['x-orange-signature'];
    if (!signature) return false;

    const merchantKey = this.credentials.merchantKey || 'orange_mock_secret';
    const expectedSignature = crypto
      .createHmac('sha256', merchantKey)
      .update(JSON.stringify(body))
      .digest('hex');

    return signature === expectedSignature;
  }
}
