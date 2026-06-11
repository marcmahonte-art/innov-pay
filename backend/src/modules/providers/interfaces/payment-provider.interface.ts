export interface ProviderPaymentResponse {
  providerReference: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  redirectUrl?: string; // e.g., for Orange Money Web Payment or Card 3D Secure redirect
  instructions?: string; // e.g., USSD instructions (e.g., "*133#")
}

export interface ProviderStatusResponse {
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  rawResponse: any;
}

export interface ProviderRefundResponse {
  refundReference: string;
  status: 'SUCCESS' | 'FAILED';
}

export interface PaymentProvider {
  createPayment(payment: {
    amount: number;
    currency: string;
    reference: string;
    customerEmail: string;
    customerPhone?: string;
  }): Promise<ProviderPaymentResponse>;

  getPaymentStatus(providerReference: string): Promise<ProviderStatusResponse>;

  refundPayment(providerReference: string, amount: number): Promise<ProviderRefundResponse>;

  validateWebhook(headers: Record<string, string>, body: any): Promise<boolean>;
}
