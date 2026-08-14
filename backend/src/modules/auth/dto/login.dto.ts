import { IsEmail, IsString, MinLength, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@aegis-ai.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'AegisDemo123!' })
  @IsString()
  @MinLength(1)
  password: string;

  @ApiProperty({ required: false, description: '6-digit TOTP MFA code' })
  @IsOptional()
  @IsString()
  @MinLength(6)
  @MaxLength(6)
  mfaCode?: string;

  @ApiProperty({ required: false, description: '6-digit Email Verification OTP code' })
  @IsOptional()
  @IsString()
  otpCode?: string;
}
