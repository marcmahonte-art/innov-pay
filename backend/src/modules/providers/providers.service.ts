import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentMethod } from '@prisma/client';
import { AirtelProvider } from './airtel/airtel.provider';
import { MoovProvider } from './moov/moov.provider';
import { OrangeProvider } from './orange/orange.provider';
import { VisaProvider } from './visa/visa.provider';
import { MastercardProvider } from './mastercard/mastercard.provider';
import { KonoomProvider } from './konoom/konoom.provider';
import { PaymentProvider } from './interfaces/payment-provider.interface';
import { EncryptionUtil } from '../../common/utils/encryption.util';

@Injectable()
export class ProvidersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Instantiate and return the payment provider driver with decrypted credentials
   */
  async getProviderInstance(name: string): Promise<PaymentProvider> {
    const providerRecord = await this.prisma.provider.findUnique({
      where: { name: name.toLowerCase() },
    });

    if (!providerRecord) {
      throw new NotFoundException(`Provider ${name} not found`);
    }

    let credentials = {};
    if (providerRecord.credentials) {
      try {
        if (typeof providerRecord.credentials === 'string') {
          const decrypted = EncryptionUtil.decrypt(providerRecord.credentials);
          credentials = JSON.parse(decrypted);
        } else {
          // If stored as JSON already in DB, try to parse it or use directly
          const credsString = JSON.stringify(providerRecord.credentials);
          try {
            // Check if it looks like an encrypted string
            if (credsString.includes(':') && credsString.split(':').length === 3) {
              const decrypted = EncryptionUtil.decrypt(credsString);
              credentials = JSON.parse(decrypted);
            } else {
              credentials = providerRecord.credentials as any;
            }
          } catch {
            credentials = providerRecord.credentials as any;
          }
        }
      } catch (err) {
        console.error(`Failed to decrypt credentials for provider ${name}`, err);
        credentials = providerRecord.credentials as any; // fallback
      }
    }

    switch (name.toLowerCase()) {
      case 'airtel':
        return new AirtelProvider(credentials);
      case 'moov':
        return new MoovProvider(credentials);
      case 'orange':
        return new OrangeProvider(credentials);
      case 'visa':
        return new VisaProvider(credentials);
      case 'mastercard':
        return new MastercardProvider(credentials);
      case 'konoom':
        return new KonoomProvider(credentials);
      default:
        throw new NotFoundException(`Provider implementation for ${name} not found`);
    }
  }

  /**
   * Get all active, healthy providers for a given PaymentMethod, ordered by priority and weight.
   */
  async getActiveProvidersForMethod(method: PaymentMethod) {
    return this.prisma.provider.findMany({
      where: {
        method,
        isHealthy: true,
      },
      orderBy: [
        { priority: 'asc' }, // 1 is highest priority
        { weight: 'desc' }, // 100 is highest weight
      ],
    });
  }

  async setHealthStatus(providerId: string, isHealthy: boolean) {
    return this.prisma.provider.update({
      where: { id: providerId },
      data: { isHealthy },
    });
  }

  async getAllProviders() {
    return this.prisma.provider.findMany({
      select: {
        id: true,
        name: true,
        method: true,
        isHealthy: true,
        priority: true,
        weight: true,
        createdAt: true,
      },
    });
  }
}
