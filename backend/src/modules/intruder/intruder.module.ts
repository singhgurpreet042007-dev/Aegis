import { Module } from '@nestjs/common';
import { IntruderController } from './intruder.controller';
import { IntruderService } from './intruder.service';
import { RiskEngineService } from '../risk/risk-engine.service';
import { PrismaModule } from '../../database/prisma.module';
import { SentinelModule } from '../sentinel/sentinel.module';

@Module({
  imports: [PrismaModule, SentinelModule],
  controllers: [IntruderController],
  providers: [IntruderService, RiskEngineService],
  exports: [IntruderService],
})
export class IntruderModule {}
