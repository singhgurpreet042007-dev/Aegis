import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface LogAuditParams {
  actor: string;
  actorEmail?: string;
  action: string; // LOGIN | LOGOUT | INCIDENT_VERIFIED | POLICY_CHANGED | SESSION_REVOKED | TRUST_ADDED | TRUST_REVOKED | EVENT_INGESTED
  resourceType?: string;
  resourceId?: string;
  outcome?: 'SUCCESS' | 'FAILURE';
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Log an immutable security audit entry to the database.
   */
  async log(params: LogAuditParams): Promise<void> {
    const {
      actor,
      actorEmail,
      action,
      resourceType,
      resourceId,
      outcome = 'SUCCESS',
      ipAddress,
      userAgent,
      metadata,
    } = params;

    this.logger.log(`[AUDIT] [${outcome}] ${action} by ${actor}${actorEmail ? ` (${actorEmail})` : ''}`);

    if (!this.prisma.isConnected) return;

    try {
      await (this.prisma as any).auditLog.create({
        data: {
          actor,
          actorEmail,
          action,
          resourceType,
          resourceId,
          outcome,
          ipAddress,
          userAgent,
          metadata: metadata ? JSON.stringify(metadata) : null,
        },
      });
    } catch (err) {
      this.logger.debug(`Failed to persist audit log: ${err.message}`);
    }
  }

  /**
   * Fetch audit logs for compliance & security dashboard display.
   */
  async getAuditLogs(limit = 50) {
    if (!this.prisma.isConnected) return [];

    try {
      return await (this.prisma as any).auditLog.findMany({
        orderBy: { timestamp: 'desc' },
        take: limit,
      });
    } catch (err) {
      this.logger.debug(`Failed to fetch audit logs: ${err.message}`);
      return [];
    }
  }
}
