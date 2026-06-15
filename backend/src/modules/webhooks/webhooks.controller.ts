import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { WebhooksService } from './webhooks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Webhooks Management')
@Controller('webhooks')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('config')
  @Roles(UserRole.MERCHANT_OWNER, UserRole.DEVELOPER)
  @ApiOperation({ summary: 'Register or update webhook endpoint configuration' })
  @ApiResponse({ status: 201, description: 'Webhook configuration saved successfully' })
  configureWebhook(
    @GetUser('merchantId') merchantId: string,
    @Body() body: { url: string; events: string[] },
  ) {
    return this.webhooksService.registerWebhook(merchantId, body.url, body.events);
  }

  @Get('config')
  @Roles(UserRole.MERCHANT_OWNER, UserRole.DEVELOPER)
  @ApiOperation({ summary: 'Get webhook configurations' })
  getWebhookConfig(@GetUser('merchantId') merchantId: string) {
    return this.webhooksService.getWebhookConfig(merchantId);
  }

  @Get('logs')
  @Roles(UserRole.MERCHANT_OWNER, UserRole.DEVELOPER, UserRole.SUPPORT)
  @ApiOperation({ summary: 'Get historical webhook delivery logs' })
  getWebhookLogs(
    @GetUser('merchantId') merchantId: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.webhooksService.getWebhookLogs(merchantId, limit ? Number(limit) : 20, offset ? Number(offset) : 0);
  }

  @Post('simulate')
  @Roles(UserRole.MERCHANT_OWNER, UserRole.DEVELOPER)
  @ApiOperation({ summary: 'Simulate a webhook event delivery for developers' })
  @ApiResponse({ status: 200, description: 'Webhook simulation completed' })
  simulateWebhook(
    @GetUser('merchantId') merchantId: string,
    @Body() body: { event: string },
  ) {
    return this.webhooksService.simulateWebhookEvent(merchantId, body.event);
  }
}
