import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from './modules/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { MerchantsModule } from './modules/merchants/merchants.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ProvidersModule } from './modules/providers/providers.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { SettlementsModule } from './modules/settlements/settlements.module';
import { KycModule } from './modules/kyc/kyc.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { PayLinksModule } from './modules/paylinks/paylinks.module';
import { BulkPayoutsModule } from './modules/bulk-payouts/bulk-payouts.module';
import { CheckoutModule } from './modules/checkout/checkout.module';
import { MailModule } from './modules/mail/mail.module';
import { QrModule } from './modules/qr/qr.module';
import { AutoCollectModule } from './modules/autocollect/autocollect.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const redisUrl = configService.get<string>('REDIS_URL') || 'redis://localhost:6379';
        try {
          const url = new URL(redisUrl);
          const isTls = url.protocol === 'rediss:';
          return {
            connection: {
              host: url.hostname,
              port: parseInt(url.port, 10) || 6379,
              username: url.username || undefined,
              password: url.password || undefined,
              ...(isTls ? { tls: {} } : {}),
            },
          };
        } catch {
          return {
            connection: {
              host: 'localhost',
              port: 6379,
            },
          };
        }
      },
    }),
    PrismaModule,
    AuditLogsModule,
    AuthModule,
    MerchantsModule,
    PaymentsModule,
    ProvidersModule,
    WebhooksModule,
    SettlementsModule,
    KycModule,
    PayLinksModule,
    BulkPayoutsModule,
    CheckoutModule,
    MailModule,
    QrModule,
    AutoCollectModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
