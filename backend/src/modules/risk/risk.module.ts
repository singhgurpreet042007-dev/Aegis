import { Module } from '@nestjs/common';
import { RiskEngineService } from './risk-engine.service';
import { RiskDecayService } from './risk-decay.service';
import { RiskController } from './risk.controller';
import { PrismaModule } from '../../database/prisma.module';
import { WebSocketsModule } from '../websockets/websockets.module';

@Module({
  imports: [PrismaModule, WebSocketsModule],
  controllers: [RiskController],
  providers: [RiskEngineService, RiskDecayService],
  exports: [RiskEngineService, RiskDecayService],
})
export class RiskModule {}
