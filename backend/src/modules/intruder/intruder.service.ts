import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { RiskEngineService } from '../risk/risk-engine.service';
import { EventsGateway } from '../websockets/events.gateway';
import { SentinelService } from '../sentinel/sentinel.service';
import { SimulatorScenario, AlertSeverity, AlertStatus, AdaptiveMfaState, RiskLevel } from '@aegis/shared';

@Injectable()
export class IntruderService {
  private readonly logger = new Logger(IntruderService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly riskEngine: RiskEngineService,
    private readonly eventsGateway: EventsGateway,
    private readonly sentinelService: SentinelService,
  ) {}

  async triggerSimulation(sessionId: string, userId: string, scenario: SimulatorScenario) {
    this.logger.log(`Triggering Intruder Simulation: ${scenario} for Session: ${sessionId}`);

    // Call Risk Engine with simulation mode
    const riskResult = await this.riskEngine.evaluateRisk({
      sessionId,
      userId,
      currentFeatures: {},
      isSimulated: true,
      simulationType: scenario,
    });

    let assessmentId = `ass_sim_${Date.now()}`;

    if (this.prisma.isConnected) {
      try {
        const session = await this.prisma.behavioralSession.upsert({
          where: { id: sessionId },
          create: {
            id: sessionId,
            userId,
            sessionToken: `sess_sim_${Date.now()}`,
        deviceFingerprint: 'fp_simulated_bot',
            ipAddress: '185.220.101.5',
            location: 'Frankfurt, Germany (Simulated)',
            currentRiskScore: riskResult.overallRiskScore,
            riskLevel: riskResult.riskLevel as RiskLevel,
            mfaState: riskResult.adaptiveMfaRequired ? AdaptiveMfaState.CHALLENGED : AdaptiveMfaState.NONE,
            isSimulated: true,
            simulationType: scenario,
          },
          update: {
            currentRiskScore: riskResult.overallRiskScore,
            riskLevel: riskResult.riskLevel as RiskLevel,
            mfaState: riskResult.adaptiveMfaRequired ? AdaptiveMfaState.CHALLENGED : AdaptiveMfaState.NONE,
            isSimulated: true,
            simulationType: scenario,
          },
        });

        const assessment = await this.prisma.riskAssessment.create({
          data: {
            sessionId,
            userId,
            overallRiskScore: riskResult.overallRiskScore,
            riskLevel: riskResult.riskLevel as RiskLevel,
            anomalyScore: riskResult.anomalyScore,
            explainableFactors: JSON.stringify(riskResult.explainableFactors),
            adaptiveMfaTrigger: riskResult.adaptiveMfaRequired,
          },
        });
        assessmentId = assessment.id;

        if (riskResult.overallRiskScore >= 0.70) {
          await this.prisma.securityAlert.create({
            data: {
              sessionId,
              userId,
              title: `[SIMULATED ATTACK] ${scenario} Threat Detected`,
              description: `Intruder simulator executed ${scenario}. Risk score spiked to ${(riskResult.overallRiskScore * 100).toFixed(0)}%. ${riskResult.explainableFactors[0]?.description}`,
              severity: riskResult.overallRiskScore >= 0.90 ? AlertSeverity.CRITICAL : AlertSeverity.HIGH,
              status: AlertStatus.NEW,
              metadata: JSON.stringify(riskResult),
            },
          });
        }
      } catch (err) {
        this.logger.debug(`Prisma intruder simulation fallback: ${err.message}`);
      }
    }

    if (riskResult.overallRiskScore >= 0.85 && scenario !== SimulatorScenario.NORMAL_USER) {
      this.eventsGateway.broadcastSecurityAlert({
        sessionId,
        userId,
        scenario,
        riskScore: riskResult.overallRiskScore,
        explainableFactors: riskResult.explainableFactors,
        timestamp: new Date().toISOString(),
      });

      // Dispatch real Gmail Threat Alert Email to registered owner
      this.sentinelService.sendSecurityThreatAlertEmail(
        'minakshisehgal13@gmail.com',
        'https://my-app.vercel.app',
        'my-app.vercel.app',
        `ATTACK SIMULATION DETECTED (${scenario})`,
        riskResult.overallRiskScore,
        `Simulated attack vector '${scenario}' triggered a high risk score (${(riskResult.overallRiskScore * 100).toFixed(0)}%). Biometric fingerprint baseline mismatch detected.`,
      ).catch((err) => this.logger.error(`Simulation email dispatch error: ${err.message}`));
    }

    // Broadcast over WebSockets
    this.eventsGateway.broadcastRiskScoreUpdate(sessionId, riskResult);

    return {
      success: true,
      scenario,
      assessmentId,
      riskResult,
    };
  }
}
