import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;

  constructor() {
    const databaseUrl = process.env.DATABASE_URL || 'postgresql://innov_user:innov_password@localhost:5432/innov_pay?schema=public';
    
    // Create the Node-PG connection pool
    const pool = new Pool({ connectionString: databaseUrl });
    
    // Instantiate the Prisma 7 WebAssembly driver adapter
    const adapter = new PrismaPg(pool);
    
    // Call the parent PrismaClient constructor with the driver adapter
    super({ adapter });
    
    this.pool = pool;
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
    if (this.pool) {
      await this.pool.end();
    }
  }
}
