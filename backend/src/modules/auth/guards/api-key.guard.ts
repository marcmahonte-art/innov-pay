import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];
    
    let key: string | null = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      key = authHeader.substring(7);
    } else {
      // Fallback to custom header
      const apiKeyHeader = request.headers['x-api-key'];
      if (typeof apiKeyHeader === 'string') {
        key = apiKeyHeader;
      }
    }

    if (!key || (!key.startsWith('sk_live_') && !key.startsWith('sk_test_'))) {
      throw new UnauthorizedException('Missing or invalid API key formatting. Must start with sk_live_ or sk_test_');
    }

    // Hash the secret key using SHA-256 to compare with database
    const secretHash = crypto.createHash('sha256').update(key).digest('hex');

    const apiKeyRecord = await this.prisma.apiKey.findFirst({
      where: {
        secretHash,
      },
      include: {
        merchant: true,
      },
    });

    if (!apiKeyRecord) {
      throw new UnauthorizedException('Invalid API key');
    }

    if (apiKeyRecord.expiresAt && apiKeyRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('API key has expired');
    }

    // Update last used timestamp asynchronously
    this.prisma.apiKey.update({
      where: { id: apiKeyRecord.id },
      data: { lastUsedAt: new Date() },
    }).catch(err => console.error('Error updating api key last used', err));

    // Attach merchant and api key meta to request object
    request.merchant = apiKeyRecord.merchant;
    request.isLiveKey = apiKeyRecord.isLive;

    return true;
  }
}
