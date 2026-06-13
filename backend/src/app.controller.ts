import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './modules/prisma/prisma.service';
import { MailService } from './modules/mail/mail.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/health')
  health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
  }

  @Get('/health/db')
  async healthDb() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        db: 'ok',
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      return {
        db: 'error',
        message: error.message || 'Database connection failed',
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get('/admin/mail-test')
  async mailTest(@Query('email') email: string) {
    if (!email) {
      return { error: 'Query parameter "email" is required' };
    }
    this.mailService.sendWelcomeEmail(email, 'Test Business Tchad');
    return {
      message: 'Test welcome email queued/dispatched.',
      email,
      timestamp: new Date().toISOString(),
    };
  }
}
