import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BiometricsService } from './biometrics.service';
import { IngestTelemetryDto } from './dto/ingest-telemetry.dto';

@ApiTags('Behavioral Biometrics')
@Controller('v1/biometrics')
export class BiometricsController {
  constructor(private readonly biometricsService: BiometricsService) {}

  @Post('ingest')
  @ApiOperation({ summary: 'Ingest real-time keystroke and mouse movement telemetry' })
  @ApiResponse({ status: 200, description: 'Telemetry processed and risk score evaluated successfully.' })
  async ingestTelemetry(@Body() payload: IngestTelemetryDto) {
    return this.biometricsService.processTelemetry(payload as any);
  }

  @Post('calibrate/complete')
  @ApiOperation({ summary: 'Finalize and enroll baseline calibration profile for user' })
  async finalizeCalibration(@Body() body: { userId: string; sessionId: string }) {
    return this.biometricsService.finalizeCalibration(body.userId, body.sessionId);
  }

  @Get('session/:sessionId')
  @ApiOperation({ summary: 'Get current behavioral session status and risk score' })
  async getSessionStatus(@Param('sessionId') sessionId: string) {
    return this.biometricsService.getSessionStatus(sessionId);
  }

  @Get('session/:sessionId/mouse-path')
  @ApiOperation({ summary: 'Get raw mouse coordinates array for session canvas replay' })
  async getSessionMousePath(@Param('sessionId') sessionId: string) {
    return this.biometricsService.getSessionMousePath(sessionId);
  }

  @Get('sessions')
  @ApiOperation({ summary: 'List all active monitored behavioral sessions' })
  async getAllSessions() {
    return this.biometricsService.getAllSessions();
  }

  @Get('baseline/:userId')
  @ApiOperation({ summary: 'Get user identity baseline profile (keystroke & mouse metrics)' })
  async getBaseline(@Param('userId') userId: string) {
    return this.biometricsService.getBaseline(userId);
  }
}
