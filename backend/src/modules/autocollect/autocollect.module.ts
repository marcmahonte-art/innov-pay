import { Module } from '@nestjs/common';
import { AutoCollectService } from './autocollect.service';
import { AutoCollectController } from './autocollect.controller';

@Module({
  controllers: [AutoCollectController],
  providers: [AutoCollectService],
  exports: [AutoCollectService],
})
export class AutoCollectModule {}
