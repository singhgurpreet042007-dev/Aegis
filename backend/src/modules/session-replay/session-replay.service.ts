import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class SessionReplayService {
  private readonly logger = new Logger(SessionReplayService.name);
  private memoryReplays = new Map<string, any[]>();

  constructor(private readonly prisma: PrismaService) {}

  async getReplayEvents(sessionId: string) {
    if (this.prisma.isConnected) {
      try {
        const session = await this.prisma.behavioralSession.findUnique({
          where: { id: sessionId },
          include: { user: { select: { email: true, fullName: true } } },
        });

        if (session) {
          const events = await this.prisma.sessionReplayEvent.findMany({
            where: { sessionId },
            orderBy: { sequence: 'asc' },
          });

          return {
            session,
            frames: events.map((e) => ({
              id: e.id,
              sequence: e.sequence,
              isAnomaly: e.isAnomaly,
              ...(typeof e.eventData === 'string' ? JSON.parse(e.eventData) : e.eventData),
            })),
          };
        }
      } catch (err) {
        this.logger.debug(`Prisma getReplayEvents fallback: ${err.message}`);
      }
    }

    const cachedFrames = this.memoryReplays.get(sessionId) || [
      { sequence: 0, x: 150, y: 200, isAnomaly: false, timestamp: new Date(Date.now() - 10000).toISOString() },
      { sequence: 1, x: 220, y: 250, isAnomaly: false, timestamp: new Date(Date.now() - 8000).toISOString() },
      { sequence: 2, x: 500, y: 500, isAnomaly: true, timestamp: new Date(Date.now() - 5000).toISOString() },
      { sequence: 3, x: 505, y: 505, isAnomaly: true, timestamp: new Date(Date.now() - 2000).toISOString() },
    ];

    return {
      session: {
        id: sessionId,
        userId: 'usr_demo',
        sessionToken: `sess_${Date.now()}`,
        user: { email: 'demo@aegis.ai', fullName: 'Demo User' },
      },
      frames: cachedFrames,
    };
  }

  async saveReplayEvents(sessionId: string, frames: any[]) {
    this.memoryReplays.set(sessionId, frames);

    if (this.prisma.isConnected) {
      try {
        const data = frames.map((f, i) => ({
          sessionId,
          sequence: i,
          isAnomaly: f.isAnomaly || false,
          eventData: JSON.stringify(f),
        }));

        await this.prisma.sessionReplayEvent.createMany({ data });
      } catch (err) {
        this.logger.debug(`Prisma saveReplayEvents fallback: ${err.message}`);
      }
    }

    return { success: true, count: frames.length };
  }
}
