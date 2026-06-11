import { Module } from '@nestjs/common';
import { BulkPayoutsController } from './bulk-payouts.controller';
import { BulkPayoutsService } from './bulk-payouts.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ProvidersModule } from '../providers/providers.module';

@Module({
  imports: [PrismaModule, ProvidersModule],
  controllers: [BulkPayoutsController],
  providers: [BulkPayoutsService],
  exports: [BulkPayoutsService],
})
export class BulkPayoutsModule {}
