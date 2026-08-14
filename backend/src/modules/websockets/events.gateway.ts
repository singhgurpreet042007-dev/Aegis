import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, Inject, forwardRef, Optional } from '@nestjs/common';
import { BiometricsService } from '../biometrics/biometrics.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/biometrics',
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(EventsGateway.name);

  constructor(
    @Optional()
    @Inject(forwardRef(() => BiometricsService))
    private readonly biometricsService?: BiometricsService,
  ) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected to Aegis Biometrics WebSockets: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribe_session')
  handleSubscribeSession(client: Socket, payload: { sessionId: string }) {
    client.join(`session_${payload.sessionId}`);
    this.logger.log(`Client ${client.id} subscribed to session: ${payload.sessionId}`);
    return { status: 'subscribed', sessionId: payload.sessionId };
  }

  @SubscribeMessage('subscribe_admin_threats')
  handleSubscribeAdminThreats(client: Socket) {
    client.join('admin_threat_feed');
    this.logger.log(`Client ${client.id} subscribed to admin threat feed`);
    return { status: 'subscribed_admin' };
  }

  @SubscribeMessage('telemetry_batch')
  async handleTelemetryBatch(client: Socket, payload: any) {
    if (this.biometricsService) {
      try {
        const result = await this.biometricsService.processTelemetry(payload);
        return { status: 'ok', data: result };
      } catch (err) {
        this.logger.error(`WebSocket telemetry batch error: ${err.message}`);
      }
    }
    return { status: 'received' };
  }

  public broadcastRiskScoreUpdate(sessionId: string, riskData: any) {
    if (this.server) {
      this.server.to(`session_${sessionId}`).emit('risk_score_update', riskData);
      this.server.to('admin_threat_feed').emit('live_session_risk_change', {
        sessionId,
        ...riskData,
      });
    }
  }

  public broadcastSecurityAlert(alertData: any) {
    if (this.server) {
      this.server.to('admin_threat_feed').emit('security_alert', alertData);
    }
  }

  public broadcastThreatMapUpdate(threatPoint: any) {
    if (this.server) {
      this.server.to('admin_threat_feed').emit('threat_map_point', threatPoint);
    }
  }
}
