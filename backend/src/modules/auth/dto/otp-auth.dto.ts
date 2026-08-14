import { IsEmail, IsString, IsNotEmpty, MinLength } from 'class-validator';

export class SendOtpDto {
  @IsEmail()
  email: string;
}

export class VerifyOtpDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  code: string;
}

export class ResetPasswordDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  otpCode: string;

  @IsString()
  @MinLength(8)
  newPassword: string;
}
