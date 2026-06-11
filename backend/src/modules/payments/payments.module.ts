import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { PaymentRouter } from './services/payment-router.service';
import { ProvidersModule } from '../providers/providers.module';
import { WebhooksModule } from '../webhooks/webhooks.module';

@Module({
  imports: [ProvidersModule, WebhooksModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentRouter],
  exports: [PaymentsService, PaymentRouter],
})
export class PaymentsModule {}
