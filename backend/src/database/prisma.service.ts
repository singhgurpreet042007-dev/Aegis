import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  public isConnected = false;

  constructor() {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'stdout', level: 'info' },
        { emit: 'stdout', level: 'warn' },
        { emit: 'stdout', level: 'error' },
      ],
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.isConnected = true;
      this.logger.log('✅ PostgreSQL database connection established');

      if (process.env.NODE_ENV === 'development') {
        // @ts-expect-error — Prisma event typing
        this.$on('query', (e: { duration: number; query: string }) => {
          if (e.duration > 500) {
            this.logger.warn(`Slow query (${e.duration}ms): ${e.query}`);
          }
        });
      }
    } catch (err) {
      this.isConnected = false;
      this.logger.warn(`⚠️ PostgreSQL connection not available (${err.message}). In-memory fallback mode active.`);
    }
  }

  async onModuleDestroy() {
    if (this.isConnected) {
      await this.$disconnect();
      this.logger.log('Database connection closed');
    }
  }
}
