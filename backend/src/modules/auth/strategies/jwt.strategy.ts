import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../database/prisma.service';
import { JwtPayload } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('app.jwt.secret') || process.env.JWT_SECRET || 'aegis_ai_super_secret_jwt_key_2026',
    });
  }

  async validate(payload: JwtPayload) {
    if (this.prisma.isConnected) {
      try {
        const user = await this.prisma.user.findUnique({
          where: { id: payload.sub },
          select: {
            id: true,
            email: true,
            fullName: true,
            status: true,
          },
        });

        if (user) {
          if (user.status !== 'ACTIVE') {
            throw new UnauthorizedException('User inactive');
          }
          return { id: user.id, email: user.email, fullName: user.fullName };
        }
      } catch (err) {
        // Fallback for offline database mode
      }
    }

    return {
      id: payload.sub || 'usr_demo',
      email: payload.email || 'demo@aegis.ai',
      fullName: payload.fullName || 'Demo User',
    };
  }
}
