import { Module } from '@nestjs/common';
import { SentinelController } from './sentinel.controller';
import { SentinelService } from './sentinel.service';
import { PrismaModule } from '../../database/prisma.module';
import { RiskModule } from '../risk/risk.module';

@Module({
  imports: [PrismaModule, RiskModule],
  controllers: [SentinelController],
  providers: [SentinelService],
  exports: [SentinelService],
})
export class SentinelModule {}

