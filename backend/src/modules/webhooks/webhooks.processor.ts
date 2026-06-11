import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { WebhooksService } from './webhooks.service';
import { Logger } from '@nestjs/common';

@Processor('webhooks')
export class WebhooksProcessor extends WorkerHost {
  private readonly logger = new Logger(WebhooksProcessor.name);

  constructor(private readonly webhooksService: WebhooksService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing job ${job.id} of type ${job.name}`);
    
    if (job.name === 'deliver') {
      const data = job.data;
      // Inject correct attempt number from BullMQ job execution
      data.attempt = (job.attemptsMade || 0) + 1;
      
      await this.webhooksService.deliverWebhook(data);
    }
  }
}
