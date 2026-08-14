import { Controller, Post, Get, Patch, Delete, Body, Param, Query, Header, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { IsString, IsOptional, IsNumber, IsObject } from 'class-validator';
import { SentinelService } from './sentinel.service';
import { SecurityEventType } from '@aegis/shared';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

export class ScanUrlDto {
  @IsString()
  url: string;

  @IsOptional()
  @IsString()
  userEmail?: string;
}

export class EventIngestionDto {
  @IsString()
  domain: string;

  @IsOptional()
  @IsString()
  targetUrl?: string;

  @IsString()
  eventType: SecurityEventType;

  @IsOptional()
  @IsString()
  userEmail?: string;

  @IsOptional()
  @IsString()
  deviceInfo?: string;

  @IsOptional()
  @IsString()
  browser?: string;

  @IsOptional()
  @IsString()
  os?: string;

  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  details?: string;

  @IsOptional()
  @IsObject()
  rawMetadata?: Record<string, any>;
}

export class IncidentActionDto {
  @IsString()
  action: 'VERIFIED' | 'COMPROMISED';
}

export class DisconnectDomainDto {
  @IsString()
  domain: string;
}

@ApiTags('Security Sentinel')
@Controller('v1/sentinel')
export class SentinelController {
  constructor(private readonly sentinelService: SentinelService) {}

  @Post('scan-url')
  @ApiOperation({ summary: 'Perform real TLS, HTTP headers, DNS audit scan & register website URL' })
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  async scanAndRegisterUrl(@Body() body: ScanUrlDto) {
    return this.sentinelService.scanAndRegisterUrl(body.url, body.userEmail);
  }

  @Get('posture-report')
  @ApiOperation({ summary: 'Get comprehensive 15-module attack surface and security posture report' })
  async getPostureReport(@Query('domain') domain?: string, @Query('url') url?: string) {
    const target = domain || url || 'my-app.com';
    return this.sentinelService.getPostureReport(target);
  }

  @Post('detect-event')
  async detectAndProcessEvent(@Body() body: EventIngestionDto) {
    return this.sentinelService.detectAndProcessEvent(body);
  }

  @Get('verify-login')
  @Header('Content-Type', 'text/html; charset=utf-8')
  async verifyLoginViaGet(@Query('incidentId') incidentId: string, @Query('action') action: 'VERIFIED' | 'COMPROMISED') {
    return this.sentinelService.verifyLoginIncident(incidentId, action || 'VERIFIED');
  }

  @Post('verify-login')
  async verifyLoginViaPost(@Body() body: { incidentId: string; action: 'VERIFIED' | 'COMPROMISED' }) {
    await this.sentinelService.verifyLoginIncident(body.incidentId, body.action);
    const updatedIncident = await this.sentinelService.getIncidentById(body.incidentId);
    return {
      success: true,
      incident: updatedIncident,
      message: body.action === 'VERIFIED'
        ? 'Login activity verified and device context trusted.'
        : 'Security incident flagged as COMPROMISED. Remediations executed.',
    };
  }

  @Get('incidents')
  async getIncidents(@Query('domain') domain?: string) {
    return this.sentinelService.getIncidents(domain);
  }

  @Get('incidents/:id')
  async getIncidentById(@Param('id') id: string) {
    return this.sentinelService.getIncidentById(id);
  }

  @Post('incidents/:id/action')
  async handleIncidentAction(@Param('id') id: string, @Body() body: IncidentActionDto) {
    await this.sentinelService.verifyLoginIncident(id, body.action);
    const incident = await this.sentinelService.getIncidentById(id);
    return {
      success: true,
      incident,
    };
  }

  @Get('trusted-contexts')
  async getTrustedContexts(@Query('domain') domain?: string) {
    return this.sentinelService.getTrustedContexts(domain);
  }

  @Delete('trusted-contexts/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SECURITY_OFFICER', 'ADMIN')
  async revokeTrustedContext(@Param('id') id: string) {
    return this.sentinelService.revokeTrustedContext(id);
  }

  @Post('disconnect')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SECURITY_OFFICER', 'ADMIN')
  async disconnectDomain(@Body() body: DisconnectDomainDto) {
    return this.sentinelService.disconnectDomain(body.domain);
  }

  @Get('monitored-urls')
  async getAllMonitoredUrls() {
    return this.sentinelService.getAllMonitoredUrls();
  }

  @Patch(':id/toggle')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SECURITY_OFFICER', 'ADMIN')
  async toggleUrlStatus(@Param('id') id: string) {
    return this.sentinelService.toggleUrlStatus(id);
  }

  @Post(':id/ping')
  async pingUrlNow(@Param('id') id: string) {
    return this.sentinelService.pingUrlNow(id);
  }
}
