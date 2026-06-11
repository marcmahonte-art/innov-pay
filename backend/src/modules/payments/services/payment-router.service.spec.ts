import { Test, TestingModule } from '@nestjs/testing';
import { PaymentRouter } from './payment-router.service';
import { ProvidersService } from '../../providers/providers.service';
import { PaymentMethod, Provider } from '@prisma/client';
import { InternalServerErrorException } from '@nestjs/common';

describe('PaymentRouter', () => {
  let router: PaymentRouter;
  let providersService: jest.Mocked<any>;

  const mockProvider = (id: string, name: string, priority: number, weight: number): Provider => ({
    id,
    name,
    method: PaymentMethod.AIRTEL_MONEY,
    isHealthy: true,
    priority,
    weight,
    credentials: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  beforeEach(async () => {
    providersService = {
      getActiveProvidersForMethod: jest.fn(),
      getProviderInstance: jest.fn(),
      setHealthStatus: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentRouter,
        {
          provide: ProvidersService,
          useValue: providersService,
        },
      ],
    }).compile();

    router = module.get<PaymentRouter>(PaymentRouter);
  });

  it('should route to the single healthy provider when only one is available', async () => {
    const singleProvider = mockProvider('1', 'airtel', 1, 100);
    providersService.getActiveProvidersForMethod.mockResolvedValue([singleProvider]);
    
    const mockDriver = {
      createPayment: jest.fn().mockResolvedValue({
        providerReference: 'tx_airtel_123',
        status: 'PENDING',
      }),
    };
    providersService.getProviderInstance.mockResolvedValue(mockDriver);

    const paymentReq = {
      amount: 1000,
      currency: 'XAF',
      reference: 'ref_123',
      customerEmail: 'test@test.com',
    };

    const result = await router.routeAndCreatePayment(paymentReq, PaymentMethod.AIRTEL_MONEY);

    expect(result.provider.name).toBe('airtel');
    expect(result.response.providerReference).toBe('tx_airtel_123');
    expect(providersService.getActiveProvidersForMethod).toHaveBeenCalledWith(PaymentMethod.AIRTEL_MONEY);
  });

  it('should respect priority groups (route to priority 1 before priority 2)', async () => {
    const p1 = mockProvider('1', 'airtel', 1, 100);
    const p2 = mockProvider('2', 'moov', 2, 100);
    providersService.getActiveProvidersForMethod.mockResolvedValue([p2, p1]); // returned unordered

    const mockDriver = {
      createPayment: jest.fn().mockResolvedValue({
        providerReference: 'tx_airtel_123',
        status: 'PENDING',
      }),
    };
    providersService.getProviderInstance.mockResolvedValue(mockDriver);

    const paymentReq = { amount: 1000, currency: 'XAF', reference: 'ref_123', customerEmail: 'test@test.com' };
    const result = await router.routeAndCreatePayment(paymentReq, PaymentMethod.AIRTEL_MONEY);

    expect(result.provider.name).toBe('airtel'); // priority 1
    expect(mockDriver.createPayment).toHaveBeenCalledTimes(1);
  });

  it('should trigger failover and mark provider unhealthy if selected provider fails', async () => {
    const p1 = mockProvider('1', 'airtel', 1, 100);
    const p2 = mockProvider('2', 'moov', 1, 100); // Same priority
    providersService.getActiveProvidersForMethod.mockResolvedValue([p1, p2]);

    const failingDriver = {
      createPayment: jest.fn().mockRejectedValue(new Error('Network Timeout')),
    };
    const successDriver = {
      createPayment: jest.fn().mockResolvedValue({
        providerReference: 'tx_moov_456',
        status: 'PENDING',
      }),
    };

    // First call to getProviderInstance returns failing driver, second returns successful driver
    providersService.getProviderInstance
      .mockResolvedValueOnce(failingDriver)
      .mockResolvedValueOnce(successDriver);

    const paymentReq = { amount: 1000, currency: 'XAF', reference: 'ref_123', customerEmail: 'test@test.com' };
    const result = await router.routeAndCreatePayment(paymentReq, PaymentMethod.AIRTEL_MONEY);

    // Should succeed on failover provider
    expect(result.response.providerReference).toBe('tx_moov_456');
    
    // Check database health update call
    expect(providersService.setHealthStatus).toHaveBeenCalledWith(expect.any(String), false);
  });

  it('should throw exception if all candidate providers fail', async () => {
    const p1 = mockProvider('1', 'airtel', 1, 100);
    providersService.getActiveProvidersForMethod.mockResolvedValue([p1]);
    providersService.getProviderInstance.mockResolvedValue({
      createPayment: jest.fn().mockRejectedValue(new Error('Internal connection error')),
    });

    const paymentReq = { amount: 1000, currency: 'XAF', reference: 'ref_123', customerEmail: 'test@test.com' };
    
    await expect(router.routeAndCreatePayment(paymentReq, PaymentMethod.AIRTEL_MONEY))
      .rejects.toThrow(InternalServerErrorException);
  });
});
