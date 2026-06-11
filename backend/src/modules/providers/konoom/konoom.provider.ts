import { Injectable } from '@nestjs/common';
import { PaymentProvider, ProviderPaymentResponse, ProviderStatusResponse, ProviderRefundResponse } from '../interfaces/payment-provider.interface';
import * as crypto from 'crypto';

/**
 * Konoom Mobile Money Provider (konoom.td)
 * Institution de paiement agréée au Tchad — monnaie électronique, QR codes, USSD.
 * 
 * Ce provider implémente un mock réaliste basé sur le flux standard Konoom:
 * 1. Push USSD vers le numéro client
 * 2. Client confirme via PIN sur son téléphone
 * 3. Callback de confirmation vers notre webhook
 * 
 * À remplacer par les vrais endpoints API Konoom une fois le partenariat signé.
 * Contact: service.client@konoom.td | +235 66 28 59 19
 */
@Injectable()
export class KonoomProvider implements PaymentProvider {
  private credentials: any;
  private baseUrl: string;

  constructor(credentials: any = {}) {
    this.credentials = credentials;
    this.baseUrl = credentials.baseUrl || 'https://api.konoom.td/v1';
  }

  async createPayment(payment: {
    amount: number;
    currency: string;
    reference: string;
    customerEmail: string;
    customerPhone?: string;
  }): Promise<ProviderPaymentResponse> {
    console.log(`[KonoomProvider] Initiating Konoom Money payment for ${payment.amount} ${payment.currency} to ${payment.customerPhone}`);

    // Simulate API delay (Konoom push USSD)
    await new Promise((resolve) => setTimeout(resolve, 400));

    const providerReference = `knm_tx_${crypto.randomUUID().substring(0, 12)}`;

    // Konoom uses a push notification / USSD flow
    return {
      providerReference,
      status: 'PENDING',
      instructions: `Vous recevrez une notification Konoom sur votre numéro ${payment.customerPhone || 'enregistré'}. Veuillez saisir votre code PIN pour confirmer le paiement de ${payment.amount} FCFA.`,
    };
  }

  async getPaymentStatus(providerReference: string): Promise<ProviderStatusResponse> {
    console.log(`[KonoomProvider] Checking payment status for ${providerReference}`);
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Simulate outcomes based on reference suffix for testing
    if (providerReference.endsWith('f')) {
      return {
        status: 'FAILED',
        rawResponse: { code: 'KNM_ERR_402', message: 'Solde insuffisant sur le compte Konoom' },
      };
    }

    return {
      status: 'SUCCESS',
      rawResponse: { code: 'KNM_200', transaction_status: 'COMPLETED', message: 'Transaction confirmée' },
    };
  }

  async refundPayment(providerReference: string, amount: number): Promise<ProviderRefundResponse> {
    console.log(`[KonoomProvider] Initiating refund for ${providerReference}, amount: ${amount} FCFA`);
    await new Promise((resolve) => setTimeout(resolve, 350));

    return {
      refundReference: `knm_ref_${crypto.randomUUID().substring(0, 8)}`,
      status: 'SUCCESS',
    };
  }

  async validateWebhook(headers: Record<string, string>, body: any): Promise<boolean> {
    console.log('[KonoomProvider] Validating Konoom webhook signature');
    const signature = headers['x-konoom-signature'] || headers['x-konoom-hmac'];
    if (!signature) return false;

    const expectedSignature = crypto
      .createHmac('sha256', this.credentials.webhookSecret || this.credentials.clientSecret || 'konoom_mock_secret')
      .update(JSON.stringify(body))
      .digest('hex');

    return signature === expectedSignature;
  }
}
