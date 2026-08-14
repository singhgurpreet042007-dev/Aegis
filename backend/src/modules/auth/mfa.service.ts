import { Injectable, Logger } from '@nestjs/common';
import { authenticator } from 'otplib';

@Injectable()
export class MfaService {
  private readonly logger = new Logger(MfaService.name);

  generateSecret(email: string): { secret: string; otpauthUrl: string } {
    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(email, 'Aegis AI', secret);
    return { secret, otpauthUrl };
  }

  verifyToken(secret: string, token: string): boolean {
    return authenticator.verify({ token, secret });
  }
}
