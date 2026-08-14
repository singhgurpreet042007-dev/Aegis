import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { SessionReplayService } from './session-replay.service';

@Controller('v1/session-replay')
export class SessionReplayController {
  constructor(private readonly replayService: SessionReplayService) {}

  @Get(':sessionId')
  async getReplayEvents(@Param('sessionId') sessionId: string) {
    return this.replayService.getReplayEvents(sessionId);
  }

  @Post(':sessionId')
  async saveReplayEvents(@Param('sessionId') sessionId: string, @Body('frames') frames: any[]) {
    return this.replayService.saveReplayEvents(sessionId, frames || []);
  }
}
