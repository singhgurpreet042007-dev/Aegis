import { IsString, IsOptional, IsArray, IsObject } from 'class-validator';

export class IngestTelemetryDto {
  @IsString()
  sessionId: string;

  @IsString()
  userId: string;

  @IsOptional()
  @IsArray()
  keystrokes?: any[];

  @IsOptional()
  @IsArray()
  mousePoints?: any[];

  @IsOptional()
  @IsObject()
  deviceFingerprint?: Record<string, any>;
}
