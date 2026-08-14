import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../database/prisma.service';
import { EventsGateway } from '../websockets/events.gateway';
import { AuditLogService } from '../audit/audit-log.service';
import { RiskLevel } from '@aegis/shared';

@Injectable()
export class RiskDecayService {
  private readonly logger = new Logger(RiskDecayService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventsGateway: EventsGateway,
    private readonly auditLogService: AuditLogService,
  ) {}

  /**
   * NestJS Managed Scheduled Cron Job:
   * Decays risk scores over time for idle sessions every 2 minutes.
   * - Sessions inactive > 10 min: reduce risk score by 15%
   * - Sessions inactive > 30 min: reset risk score to baseline 0.08 (LOW)
   */
  @Cron('*/2 * * * *')
  async decayStaleRiskScores() {
    if (!this.prisma.isConnected) return;

    try {
      const now = new Date();
      const tenMinsAgo = new Date(now.getTime() - 10 * 60 * 1000);
      const thirtyMinsAgo = new Date(now.getTime() - 30 * 60 * 1000);

      // 1. Reset sessions idle > 30 mins to baseline
      const resetSessions = await this.prisma.behavioralSession.findMany({
        where: {
          updatedAt: { lt: thirtyMinsAgo },
          currentRiskScore: { gt: 0.08 },
        },
      });

      for (const session of resetSessions) {
        await this.prisma.behavioralSession.update({
          where: { id: session.id },
          data: {
            currentRiskScore: 0.08,
            riskLevel: RiskLevel.LOW,
          },
        });

        // Record event
        try {
          await (this.prisma as any).telemetryEvent.create({
            data: {
              sessionId: session.id,
              userId: session.userId,
              eventType: 'RISK_DECAYED',
              riskScore: 0.08,
              riskLevel: RiskLevel.LOW,
              metadata: JSON.stringify({ reason: 'IDLE_RESET_30MIN', previousScore: session.currentRiskScore }),
            },
          });
        } catch (_) {}

        this.eventsGateway.broadcastRiskScoreUpdate(session.id, {
          sessionId: session.id,
          userId: session.userId,
          overallRiskScore: 0.08,
          riskLevel: RiskLevel.LOW,
          anomalyScore: 0.08,
          explainableFactors: [
            {
              feature: 'Time-Decay Recovery',
              impact: 'NORMAL',
              score: 0.0,
              description: 'Risk score decayed back to baseline due to inactivity.',
            },
          ],
          adaptiveMfaRequired: false,
          mfaState: 'NONE',
          evaluatedAt: new Date().toISOString(),
        });
      }

      // 2. Reduce risk score by 15% for sessions inactive > 10 mins (and <= 30 mins)
      const decaySessions = await this.prisma.behavioralSession.findMany({
        where: {
          updatedAt: { lt: tenMinsAgo, gte: thirtyMinsAgo },
          currentRiskScore: { gt: 0.15 },
        },
      });

      for (const session of decaySessions) {
        const decayedScore = Math.max(0.08, Math.round(session.currentRiskScore * 0.85 * 1000) / 1000);
        const newLevel = decayedScore >= 0.75 ? RiskLevel.HIGH : decayedScore >= 0.40 ? RiskLevel.MEDIUM : RiskLevel.LOW;

        await this.prisma.behavioralSession.update({
          where: { id: session.id },
          data: {
            currentRiskScore: decayedScore,
            riskLevel: newLevel,
          },
        });

        try {
          await (this.prisma as any).telemetryEvent.create({
            data: {
              sessionId: session.id,
              userId: session.userId,
              eventType: 'RISK_DECAYED',
              riskScore: decayedScore,
              riskLevel: newLevel,
              metadata: JSON.stringify({ reason: 'IDLE_DECAY_10MIN', previousScore: session.currentRiskScore }),
            },
          });
        } catch (_) {}
      }

      if (resetSessions.length > 0 || decaySessions.length > 0) {
        this.logger.log(`Risk decay cycle: ${resetSessions.length} reset to baseline, ${decaySessions.length} decayed by 15%.`);
        this.auditLogService
          .log({
            actor: 'SYSTEM_RISK_DECAY',
            action: 'RISK_SCORE_DECAYED',
            resourceType: 'BehavioralSession',
            outcome: 'SUCCESS',
            metadata: {
              resetCount: resetSessions.length,
              decayedCount: decaySessions.length,
            },
          })
          .catch(() => {});
      }
    } catch (err) {
      this.logger.debug(`Risk decay error: ${err.message}`);
    }
  }
}
