

import { Controller, Get, Post, Body, Param, Query, Patch, Delete } from '@nestjs/common';
import { AutoCollectService } from './autocollect.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';

@Controller('v1/collections')
export class AutoCollectController {
  constructor(private readonly autocollectService: AutoCollectService) {}

  @Post()
  async create(@Query('merchantId') merchantId: string, @Body() dto: CreateCollectionDto) {
    return this.autocollectService.createCollection(merchantId, dto);
  }

  @Get()
  async findAll(@Query('merchantId') merchantId: string) {
    return this.autocollectService.getCollections(merchantId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Query('merchantId') merchantId: string) {
    return this.autocollectService.getCollectionDetails(merchantId, id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Query('merchantId') merchantId: string) {
    return this.autocollectService.deleteCollection(merchantId, id);
  }

  @Post(':id/remind')
  async sendReminder(@Param('id') id: string, @Query('merchantId') merchantId: string, @Query('memberId') memberId?: string) {
    return this.autocollectService.triggerReminder(merchantId, id, memberId);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Query('merchantId') merchantId: string, @Body() dto: UpdateCollectionDto) {
    return this.autocollectService.updateCollection(merchantId, id, dto);
  }

  @Patch(':id/members/:memberId')
  async updateMemberStatus(@Param('id') collectionId: string, @Param('memberId') memberId: string, @Query('merchantId') merchantId: string, @Body('status') status: string) {
    return this.autocollectService.updateMemberPaymentStatus(merchantId, collectionId, memberId, status as any);
  }
}
