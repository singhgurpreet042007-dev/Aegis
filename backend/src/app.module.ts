// ═══════════════════════════════════════════════════════════
// Aegis AI — Root Application Module
// ═══════════════════════════════════════════════════════════

import { Module } from '@nestjs/common';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { BullModule } from '@nestjs/bullmq';

import { PrismaModule } from './database/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { BiometricsModule } from './modules/biometrics/biometrics.module';
import { WebSocketsModule } from './modules/websockets/websockets.module';
import { AlertsModule } from './modules/alerts/alerts.module';
import { SessionReplayModule } from './modules/session-replay/session-replay.module';
import { IntruderModule } from './modules/intruder/intruder.module';
import { RiskModule } from './modules/risk/risk.module';
import { SentinelModule } from './modules/sentinel/sentinel.module';
import { BillingModule } from './modules/billing/billing.module';
import { appConfig } from './config/app.config';

import { ScheduleModule } from '@nestjs/schedule';
import { LoggerModule } from 'nestjs-pino';
import { AuditModule } from './modules/audit/audit.module';

@Module({
  imports: [
    // Global configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      envFilePath: [
        '../config/env/.env.development',
        '../config/env/.env.production',
      ],
    }),

    // Structured Pino Logger
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL || 'info',
        transport: process.env.NODE_ENV !== 'production' ? { target: 'pino-pretty', options: { colorize: true, singleLine: true } } : undefined,
      },
    }),

    // NestJS Managed Scheduled Cron Jobs
    ScheduleModule.forRoot(),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100,
      },
    ]),

    // BullMQ queue configuration
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
      },
    }),

    // Database & Audit
    PrismaModule,
    AuditModule,

    // Zero Trust Behavioral Biometrics & Core Modules
    AuthModule,
    BiometricsModule,
    WebSocketsModule,
    AlertsModule,
    SessionReplayModule,
    IntruderModule,
    RiskModule,
    SentinelModule,
    BillingModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
