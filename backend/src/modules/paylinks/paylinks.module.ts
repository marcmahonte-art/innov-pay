import { Module } from '@nestjs/common';
import { PayLinksController } from './paylinks.controller';
import { PayLinksService } from './paylinks.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [PrismaModule, PaymentsModule],
  controllers: [PayLinksController],
  providers: [PayLinksService],
  exports: [PayLinksService],
})
export class PayLinksModule {}
