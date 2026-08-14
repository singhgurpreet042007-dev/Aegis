import { IsEmail, IsString, MinLength, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'newuser@aegis-ai.com' })
  @IsEmail({}, { message: 'Please enter a valid email address' })
  email: string;

  @ApiProperty({ example: 'SecureP@ss123!' })
  @IsString()
  @MinLength(4, { message: 'Password must be at least 4 characters long' })
  @MaxLength(128)
  password: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @MinLength(2, { message: 'Full name must be at least 2 characters long' })
  @MaxLength(255)
  fullName: string;

  @ApiProperty({ example: '123456', required: false })
  @IsOptional()
  @IsString()
  otpCode?: string;
}
