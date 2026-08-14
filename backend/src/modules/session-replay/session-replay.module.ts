import { Module } from '@nestjs/common';
import { SessionReplayController } from './session-replay.controller';
import { SessionReplayService } from './session-replay.service';
import { PrismaModule } from '../../database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SessionReplayController],
  providers: [SessionReplayService],
  exports: [SessionReplayService],
})
export class SessionReplayModule {}
