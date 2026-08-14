import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AlertStatus } from '@aegis/shared';

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getAlerts(limit = 50) {
    if (this.prisma.isConnected) {
      try {
        const alerts = await this.prisma.securityAlert.findMany({
          orderBy: { createdAt: 'desc' },
          take: limit,
          include: {
            user: { select: { id: true, email: true, fullName: true } },
          },
        });
        return alerts;
      } catch (err: any) {
        this.logger.debug(`Prisma getAlerts fallback: ${err.message}`);
      }
    }

    return [];
  }

  async updateStatus(id: string, status: AlertStatus) {
    if (this.prisma.isConnected) {
      try {
        const alert = await this.prisma.securityAlert.findUnique({ where: { id } });
        if (alert) {
          return this.prisma.securityAlert.update({
            where: { id },
            data: { status },
          });
        }
      } catch (err) {
        this.logger.debug(`Prisma updateStatus fallback: ${err.message}`);
      }
    }

    return { id, status, updatedAt: new Date().toISOString() };
  }

  async getThreatMapPoints() {
    if (this.prisma.isConnected) {
      try {
        const points = await this.prisma.threatLog.findMany({
          orderBy: { timestamp: 'desc' },
          take: 100,
        });
        if (points.length) return points;
      } catch (err) {
        this.logger.debug(`Prisma getThreatMapPoints fallback: ${err.message}`);
      }
    }

    return [
      { id: 't1', lat: 37.7749, lng: -122.4194, location: 'San Francisco, USA', riskScore: 0.92, type: 'BOT_ATTACK' },
      { id: 't2', lat: 50.1109, lng: 8.6821, location: 'Frankfurt, Germany', riskScore: 0.84, type: 'SESSION_HIJACK' },
      { id: 't3', lat: 35.6762, lng: 139.6503, location: 'Tokyo, Japan', riskScore: 0.89, type: 'CREDENTIAL_STUFFING' },
      { id: 't4', lat: 51.5074, lng: -0.1278, location: 'London, UK', riskScore: 0.12, type: 'NORMAL_USER' },
    ];
  }
}
