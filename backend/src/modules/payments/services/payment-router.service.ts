import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ProvidersService } from '../../providers/providers.service';
import { PaymentMethod, Provider } from '@prisma/client';
import { ProviderPaymentResponse } from '../../providers/interfaces/payment-provider.interface';

@Injectable()
export class PaymentRouter {
  private readonly logger = new Logger(PaymentRouter.name);

  constructor(private readonly providersService: ProvidersService) {}

  /**
   * Automatically detects the Tchad mobile operator based on phone prefix
   */
  detectOperatorFromPhone(phone?: string): PaymentMethod | null {
    if (!phone) return null;
    
    // Keep only digits
    const digits = phone.replace(/\D/g, '');
    
    // Standard Tchad number format is 235 followed by 8 digits (total 11 digits)
    // Or just 8 digits if entered locally
    let localNumber = '';
    if (digits.startsWith('235') && digits.length === 11) {
      localNumber = digits.substring(3);
    } else if (digits.length === 8) {
      localNumber = digits;
    } else {
      return null;
    }

    const prefix = localNumber.substring(0, 2);

    if (['60', '61', '62', '63', '64'].includes(prefix)) {
      return PaymentMethod.AIRTEL_MONEY;
    }
    if (['65', '66', '67', '68', '69'].includes(prefix)) {
      return PaymentMethod.MOOV_MONEY;
    }
    if (['90', '91', '92', '93', '94', '95'].includes(prefix)) {
      return PaymentMethod.KONOOM_MONEY;
    }

    return null;
  }

  /**
   * Routes a payment request to the optimal provider based on health, priority, and weight.
   * If the chosen provider fails, it marks it unhealthy and fails over to the next candidate.
   */
  async routeAndCreatePayment(
    payment: {
      amount: number;
      currency: string;
      reference: string;
      customerEmail: string;
      customerPhone?: string;
    },
    method: PaymentMethod,
  ): Promise<{ provider: Provider; response: ProviderPaymentResponse }> {
    // 1. Auto-detect operator prefix for CEMAC/Tchad mobile numbers to correct user/merchant input error
    let targetMethod = method;
    const detected = this.detectOperatorFromPhone(payment.customerPhone);
    
    if (detected && ([PaymentMethod.AIRTEL_MONEY, PaymentMethod.MOOV_MONEY, PaymentMethod.KONOOM_MONEY] as PaymentMethod[]).includes(method)) {
      if (detected !== method) {
        this.logger.warn(`Overriding payment method: phone prefix detected as ${detected} but requested method was ${method}`);
        targetMethod = detected;
      }
    }

    // 2. Get active, healthy providers for the target payment method
    const candidates = await this.providersService.getActiveProvidersForMethod(targetMethod);

    if (candidates.length === 0) {
      throw new InternalServerErrorException(`No active or healthy providers available for method ${targetMethod}`);
    }

    // Group candidates by priority
    const groupedByPriority = this.groupByPriority(candidates);
    const sortedPriorities = Array.from(groupedByPriority.keys()).sort((a, b) => a - b);

    // Iterate through priority levels
    for (const priority of sortedPriorities) {
      const providersInPriority = [...(groupedByPriority.get(priority) || [])];
      
      while (providersInPriority.length > 0) {
        // Select provider based on weight within this priority tier
        const chosenProvider = this.selectWeightedProvider(providersInPriority);
        
        try {
          this.logger.log(`Routing transaction ${payment.reference} to provider ${chosenProvider.name.toUpperCase()} (Priority ${priority}, Weight ${chosenProvider.weight})`);
          
          const providerInstance = await this.providersService.getProviderInstance(chosenProvider.name);
          const response = await providerInstance.createPayment(payment);
          
          return {
            provider: chosenProvider,
            response,
          };
        } catch (error: any) {
          this.logger.error(`Provider ${chosenProvider.name} failed to process payment: ${error.message}. Initiating failover.`);
          
          // Failover: Mark provider unhealthy in the database
          await this.providersService.setHealthStatus(chosenProvider.id, false);
          
          // Remove from local list
          const idx = providersInPriority.indexOf(chosenProvider);
          if (idx > -1) {
            providersInPriority.splice(idx, 1);
          }
        }
      }
    }

    throw new InternalServerErrorException('All available payment providers failed to process this request.');
  }

  private groupByPriority(providers: Provider[]): Map<number, Provider[]> {
    const groups = new Map<number, Provider[]>();
    for (const p of providers) {
      const list = groups.get(p.priority) || [];
      list.push(p);
      groups.set(p.priority, list);
    }
    return groups;
  }

  private selectWeightedProvider(providers: Provider[]): Provider {
    if (providers.length === 1) {
      return providers[0];
    }

    const totalWeight = providers.reduce((sum, p) => sum + p.weight, 0);
    if (totalWeight <= 0) {
      return providers[Math.floor(Math.random() * providers.length)];
    }

    const randomVal = Math.random() * totalWeight;
    let runningSum = 0;
    
    for (const p of providers) {
      runningSum += p.weight;
      if (randomVal <= runningSum) {
        return p;
      }
    }

    return providers[providers.length - 1];
  }
}
