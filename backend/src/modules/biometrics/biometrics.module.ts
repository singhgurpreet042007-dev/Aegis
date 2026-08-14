import { Module } from '@nestjs/common';
import { BiometricsController } from './biometrics.controller';
import { BiometricsService } from './biometrics.service';
import { RiskEngineService } from '../risk/risk-engine.service';
import { PrismaModule } from '../../database/prisma.module';
import { SentinelModule } from '../sentinel/sentinel.module';

@Module({
  imports: [PrismaModule, SentinelModule],
  controllers: [BiometricsController],
  providers: [BiometricsService, RiskEngineService],
  exports: [BiometricsService, RiskEngineService],
})
export class BiometricsModule {}
