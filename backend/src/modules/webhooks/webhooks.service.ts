import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';
import axios from 'axios';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('webhooks') private readonly webhookQueue: Queue,
  ) {}

  /**
   * Register or update webhook config
   */
  async registerWebhook(merchantId: string, url: string, events: string[]) {
    const secret = `whsec_${crypto.randomBytes(16).toString('hex')}`;
    
    return this.prisma.webhook.upsert({
      where: { merchantId },
      update: { url, events, isActive: true },
      create: {
        merchantId,
        url,
        secret,
        events,
        isActive: true,
      },
    });
  }

  async getWebhookConfig(merchantId: string) {
    const config = await this.prisma.webhook.findUnique({
      where: { merchantId },
    });
    if (!config) {
      throw new NotFoundException('Webhook configuration not found for this merchant');
    }
    return config;
  }

  async getWebhookLogs(merchantId: string, limit = 20, offset = 0) {
    const config = await this.prisma.webhook.findUnique({
      where: { merchantId },
    });
    if (!config) {
      return { total: 0, data: [] };
    }

    const [total, data] = await this.prisma.$transaction([
      this.prisma.webhookLog.count({ where: { webhookId: config.id } }),
      this.prisma.webhookLog.findMany({
        where: { webhookId: config.id },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
    ]);

    return { total, limit, offset, data };
  }

  /**
   * Queue a webhook event for delivery (BullMQ)
   */
  async queueWebhook(merchantId: string, event: string, payload: any, paymentId: string) {
    const webhook = await this.prisma.webhook.findUnique({
      where: { merchantId },
    });

    if (!webhook || !webhook.isActive || !webhook.events.includes(event)) {
      this.logger.debug(`Webhook not configured or inactive for merchant ${merchantId} or event ${event}`);
      return;
    }

    const jobData = {
      webhookId: webhook.id,
      paymentId,
      url: webhook.url,
      secret: webhook.secret,
      event,
      payload,
      attempt: 1,
    };

    try {
      // Add to BullMQ queue
      await this.webhookQueue.add('deliver', jobData, {
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 5000, // starting at 5s (5s, 10s, 20s, 40s, 80s)
        },
      });
      this.logger.log(`Webhook job added to queue for payment ${paymentId}`);
    } catch (err) {
      this.logger.warn(`Failed to queue webhook in Redis. Falling back to direct execution: ${err.message}`);
      // Resilient fallback: deliver immediately in background
      this.deliverWebhook(jobData).catch(e => this.logger.error(`Direct webhook delivery failed: ${e.message}`));
    }
  }

  /**
   * Deliver the webhook HTTP request and log results
   */
  async deliverWebhook(jobData: {
    webhookId: string;
    paymentId: string;
    url: string;
    secret: string;
    event: string;
    payload: any;
    attempt: number;
  }) {
    const timestamp = Math.floor(Date.now() / 1000);
    const signaturePayload = `${timestamp}.${JSON.stringify(jobData.payload)}`;
    
    // Sign payload using HMAC SHA-256
    const signature = crypto
      .createHmac('sha256', jobData.secret)
      .update(signaturePayload)
      .digest('hex');

    const headers = {
      'Content-Type': 'application/json',
      'X-InnovPay-Event': jobData.event,
      'X-InnovPay-Signature': `t=${timestamp},v1=${signature}`,
      'User-Agent': 'InnovPay-Webhook-Dispatcher/1.0',
    };

    let statusCode: number | null = null;
    let responseBody = '';
    let success = false;

    try {
      this.logger.log(`Dispatching webhook to ${jobData.url} for event ${jobData.event}`);
      const res = await axios.post(jobData.url, jobData.payload, {
        headers,
        timeout: 10000, // 10 seconds timeout
      });

      statusCode = res.status;
      responseBody = typeof res.data === 'object' ? JSON.stringify(res.data) : String(res.data);
      success = res.status >= 200 && res.status < 300;
    } catch (err: any) {
      if (err.response) {
        statusCode = err.response.status;
        responseBody = typeof err.response.data === 'object' ? JSON.stringify(err.response.data) : String(err.response.data);
      } else {
        responseBody = err.message;
      }
      success = false;
      this.logger.error(`Webhook delivery attempt ${jobData.attempt} failed for payment ${jobData.paymentId}: ${err.message}`);
      throw err; // Throw error to trigger BullMQ's automatic retry
    } finally {
      // Store execution history in DB
      await this.prisma.webhookLog.create({
        data: {
          webhookId: jobData.webhookId,
          paymentId: jobData.paymentId,
          event: jobData.event,
          payload: jobData.payload,
          url: jobData.url,
          headers: headers as any,
          statusCode,
          response: responseBody.substring(0, 1000), // truncate long bodies
          success,
          attempt: jobData.attempt,
        },
      });
    }
  }
}
