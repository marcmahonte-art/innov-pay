import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ProvidersService } from '../../providers/providers.service';
import { PaymentMethod, Provider } from '@prisma/client';
import { ProviderPaymentResponse } from '../../providers/interfaces/payment-provider.interface';

@Injectable()
export class PaymentRouter {
  private readonly logger = new Logger(PaymentRouter.name);

  constructor(private readonly providersService: ProvidersService) {}

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
    // 1. Get all active, healthy providers for the payment method
    const candidates = await this.providersService.getActiveProvidersForMethod(method);

    if (candidates.length === 0) {
      throw new InternalServerErrorException(`No active or healthy providers available for method ${method}`);
    }

    // Group candidates by priority (e.g. 1, 2, 3)
    const groupedByPriority = this.groupByPriority(candidates);
    const sortedPriorities = Array.from(groupedByPriority.keys()).sort((a, b) => a - b);

    // Iterate through priority levels (lower number = higher priority)
    for (const priority of sortedPriorities) {
      const providersInPriority = [...(groupedByPriority.get(priority) || [])];
      
      // Keep trying providers in the current priority tier
      while (providersInPriority.length > 0) {
        // 2. Select a provider based on weight within this priority tier
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
          
          // Failover: Mark provider unhealthy in the database so subsequent transactions bypass it
          await this.providersService.setHealthStatus(chosenProvider.id, false);
          
          // Remove from local list to prevent infinite loop
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
      // Fallback to equal probability random if weights are invalid
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
