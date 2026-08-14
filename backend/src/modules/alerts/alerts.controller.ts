import { Controller, Get, Patch, Param, Body, Query } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { AlertStatus } from '@aegis/shared';

@Controller('v1/alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  async getAlerts(@Query('limit') limit?: string) {
    const lim = limit ? parseInt(limit, 10) : 50;
    return this.alertsService.getAlerts(lim);
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body('status') status: AlertStatus) {
    return this.alertsService.updateStatus(id, status);
  }

  @Get('threat-map')
  async getThreatMapPoints() {
    return this.alertsService.getThreatMapPoints();
  }
}
