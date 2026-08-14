import { Controller, Post, Body } from '@nestjs/common';
import { IntruderService } from './intruder.service';
import { SimulatorScenario } from '@aegis/shared';

@Controller('v1/intruder')
export class IntruderController {
  constructor(private readonly intruderService: IntruderService) {}

  @Post('simulate')
  async triggerSimulation(
    @Body('sessionId') sessionId: string,
    @Body('userId') userId: string,
    @Body('scenario') scenario: SimulatorScenario,
  ) {
    return this.intruderService.triggerSimulation(sessionId || 'sess_demo_default', userId || 'usr_demo_default', scenario);
  }
}
