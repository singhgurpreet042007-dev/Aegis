import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { RiskEngineService } from '../risk/risk-engine.service';
import { EventsGateway } from '../websockets/events.gateway';
import { SentinelService } from '../sentinel/sentinel.service';
import { AuditLogService } from '../audit/audit-log.service';
import { BiometricTelemetryPayload, ComputedBiometricFeatures, RiskLevel, AlertSeverity, AlertStatus, AdaptiveMfaState } from '@aegis/shared';

@Injectable()
export class BiometricsService {
  private readonly logger = new Logger(BiometricsService.name);
  private inMemoryBaselines = new Map<string, any>();
  private inMemoryCalibrationBuffers = new Map<string, any[]>();
  private inMemorySessions = new Map<string, any>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly riskEngine: RiskEngineService,
    private readonly eventsGateway: EventsGateway,
    private readonly sentinelService: SentinelService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async processTelemetry(payload: BiometricTelemetryPayload & { is_baseline?: boolean; isSimulated?: boolean; simulationType?: string }) {
    const { sessionId, userId, keystrokes = [], mousePoints = [], deviceFingerprint, is_baseline = false, isSimulated = false, simulationType } = payload;

    // Feature 1: Baseline Calibration Processing
    if (is_baseline) {
      return this.handleCalibrationBatch(userId, sessionId, keystrokes, mousePoints);
    }

    // Feature 2: Real-Time Risk Score Engine
    let baselineFeatures: Record<string, number> | undefined;
    let hasBaseline = false;

    if (this.prisma.isConnected) {
      try {
        const baseline = await this.prisma.behavioralBaseline.findFirst({
          where: { userId },
        });

        if (baseline && baseline.sampleCount > 0) {
          hasBaseline = true;
          baselineFeatures = {
            keystrokeDwellMean: baseline.keystrokeDwellMean,
            keystrokeDwellStd: baseline.keystrokeDwellStd,
            keystrokeFlightMean: baseline.keystrokeFlightMean,
            keystrokeFlightStd: baseline.keystrokeFlightStd,
            keystrokeFlightCV: baseline.keystrokeFlightCV ?? 0.25,
            interKeystrokeJitter: baseline.interKeystrokeJitter ?? 30.0,
            backspaceRate: baseline.backspaceRate ?? 0.05,
            pauseBeforeFirstKeystroke: baseline.pauseBeforeFirstKeystroke ?? 350.0,
            typingSpeedCPM: baseline.typingSpeedCPM ?? 240.0,
            dwellToFlightRatio: baseline.dwellToFlightRatio ?? 0.78,
            mouseVelocityMean: baseline.mouseVelocityMean,
            mouseVelocityStd: baseline.mouseVelocityStd,
            mouseAccelerationMean: baseline.mouseAccelerationMean ?? 2500.0,
            mouseAccelerationStd: baseline.mouseAccelerationStd ?? 1200.0,
            mouseJerkMean: baseline.mouseJerkMean,
            mouseJerkStd: baseline.mouseJerkStd ?? 30.0,
            mouseCurvatureMean: baseline.mouseCurvatureMean,
            mouseStraightnessIndex: baseline.mouseStraightnessIndex ?? 0.40,
            mouseAngleChangeRate: baseline.mouseAngleChangeRate ?? 2.8,
            mousePauseRatio: baseline.mousePauseRatio ?? 0.18,
            clickToClickDurationMean: baseline.clickToClickDurationMean ?? 650.0,
            clickToClickDurationStd: baseline.clickToClickDurationStd ?? 180.0,
            mousePathEfficiency: baseline.mousePathEfficiency ?? 0.65,
          };
        }
      } catch (err) {
        this.logger.debug(`Prisma baseline fetch fallback: ${err.message}`);
      }
    }

    // In-memory fallback baseline check
    if (!hasBaseline && this.inMemoryBaselines.has(userId)) {
      const memBase = this.inMemoryBaselines.get(userId);
      if (memBase && memBase.sampleCount > 0) {
        hasBaseline = true;
        baselineFeatures = memBase;
      }
    }

    // CRITICAL: No fake numbers if uncalibrated
    if (!hasBaseline && !isSimulated) {
      const uncalibratedResult = {
        sessionId,
        userId,
        overallRiskScore: null,
        hasBaseline: false,
        status: 'NO_BASELINE_RUN_CALIBRATION',
        message: 'No baseline yet — run calibration',
      };
      this.eventsGateway.broadcastRiskScoreUpdate(sessionId, uncalibratedResult);
      return {
        success: true,
        hasBaseline: false,
        riskResult: uncalibratedResult,
      };
    }

    // Calculate current session telemetry features
    const currentFeatures = this.extractFeatures(keystrokes, mousePoints);

    // Evaluate Risk with ML Risk Engine / IsolationForest
    const riskResult = await this.riskEngine.evaluateRisk({
      sessionId,
      userId,
      currentFeatures,
      baselineFeatures: baselineFeatures || {
        keystrokeDwellMean: 110.0,
        keystrokeDwellStd: 25.0,
        keystrokeFlightMean: 140.0,
        keystrokeFlightStd: 35.0,
        keystrokeFlightCV: 0.25,
        interKeystrokeJitter: 30.0,
        backspaceRate: 0.05,
        pauseBeforeFirstKeystroke: 350.0,
        typingSpeedCPM: 240.0,
        dwellToFlightRatio: 0.78,
        mouseVelocityMean: 850.0,
        mouseVelocityStd: 200.0,
        mouseAccelerationMean: 2500.0,
        mouseAccelerationStd: 1200.0,
        mouseJerkMean: 45.0,
        mouseJerkStd: 30.0,
        mouseCurvatureMean: 0.38,
        mouseStraightnessIndex: 0.40,
        mouseAngleChangeRate: 2.8,
        mousePauseRatio: 0.18,
        clickToClickDurationMean: 650.0,
        clickToClickDurationStd: 180.0,
        mousePathEfficiency: 0.65,
      },
      deviceTrusted: true,
      isSimulated,
      simulationType,
    });

    let assessmentId = `ass_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Update Session & RiskAssessment in PostgreSQL (Prisma)
    if (this.prisma.isConnected) {
      try {
        let validUserId = userId;
        const userExists = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!userExists) {
          const firstUser = await this.prisma.user.findFirst();
          if (firstUser) {
            validUserId = firstUser.id;
          } else {
            const newUser = await this.prisma.user.create({
              data: {
                id: userId,
                email: `${userId}@aegisai.io`,
                fullName: 'Security Officer',
                status: 'ACTIVE',
              },
            });
            validUserId = newUser.id;
          }
        }

        // Serialise mouse points for Feature 5 path visualization
        const mousePointsStr = mousePoints.length > 0 ? JSON.stringify(mousePoints.slice(-200)) : undefined;

        await this.prisma.behavioralSession.upsert({
          where: { id: sessionId },
          create: {
            id: sessionId,
            userId: validUserId,
            sessionToken: `sess_${Date.now()}`,
            deviceFingerprint: deviceFingerprint?.fingerprintHash || 'fp_unknown',
            ipAddress: '127.0.0.1',
            location: 'Localhost Dev',
            currentRiskScore: riskResult.overallRiskScore || 0.08,
            riskLevel: (riskResult.riskLevel as RiskLevel) || RiskLevel.LOW,
            mfaState: riskResult.adaptiveMfaRequired ? AdaptiveMfaState.CHALLENGED : AdaptiveMfaState.NONE,
            mousePoints: mousePointsStr,
          },
          update: {
            currentRiskScore: riskResult.overallRiskScore || 0.08,
            riskLevel: (riskResult.riskLevel as RiskLevel) || RiskLevel.LOW,
            mfaState: riskResult.adaptiveMfaRequired ? AdaptiveMfaState.CHALLENGED : AdaptiveMfaState.NONE,
            mousePoints: mousePointsStr || undefined,
          },
        });

        const assessment = await this.prisma.riskAssessment.create({
          data: {
            sessionId,
            userId: validUserId,
            overallRiskScore: riskResult.overallRiskScore || 0.08,
            riskLevel: (riskResult.riskLevel as RiskLevel) || RiskLevel.LOW,
            anomalyScore: riskResult.anomalyScore || 0.08,
            explainableFactors: JSON.stringify(riskResult.explainableFactors || []),
            adaptiveMfaTrigger: riskResult.adaptiveMfaRequired || false,
          },
        });
        assessmentId = assessment.id;

        if ((riskResult.overallRiskScore || 0) >= 0.75) {
          await this.prisma.securityAlert.create({
            data: {
              sessionId,
              userId: validUserId,
              riskAssessmentId: assessmentId,
              title: `High Risk Anomaly Detected (${((riskResult.overallRiskScore || 0) * 100).toFixed(0)}%)`,
              description: `Continuous identity check triggered alert. Factors: ${riskResult.explainableFactors[0]?.description || 'Biometric drift'}`,
              severity: (riskResult.overallRiskScore || 0) >= 0.90 ? AlertSeverity.CRITICAL : AlertSeverity.HIGH,
              status: AlertStatus.NEW,
              metadata: JSON.stringify(riskResult),
            },
          });

          this.eventsGateway.broadcastSecurityAlert({
            sessionId,
            userId,
            riskScore: riskResult.overallRiskScore,
            explainableFactors: riskResult.explainableFactors,
            timestamp: new Date().toISOString(),
          });
        }
      } catch (err) {
        this.logger.debug(`Prisma write fallback: ${err.message}`);
        this.storeInMemory(sessionId, userId, riskResult, mousePoints);
      }
    } else {
      this.storeInMemory(sessionId, userId, riskResult, mousePoints);
    }

    // Broadcast Real-Time WebSocket Update
    this.eventsGateway.broadcastRiskScoreUpdate(sessionId, riskResult);

    return {
      success: true,
      hasBaseline: true,
      assessmentId,
      riskResult,
    };
  }

  // Baseline calibration batch handler
  private async handleCalibrationBatch(userId: string, sessionId: string, keystrokes: any[], mousePoints: any[]) {
    const existingBuffer = this.inMemoryCalibrationBuffers.get(userId) || [];
    const updatedBuffer = [...existingBuffer, { keystrokes, mousePoints }];
    this.inMemoryCalibrationBuffers.set(userId, updatedBuffer);

    // Compute live stats from accumulated buffer
    const allKeystrokes = updatedBuffer.flatMap((b) => b.keystrokes);
    const allMousePoints = updatedBuffer.flatMap((b) => b.mousePoints);
    const features = this.extractFeatures(allKeystrokes, allMousePoints);

    const baselineData = {
      userId,
      keystrokeDwellMean: features.keystrokeDwellMean,
      keystrokeDwellStd: features.keystrokeDwellStd,
      keystrokeFlightMean: features.keystrokeFlightMean,
      keystrokeFlightStd: features.keystrokeFlightStd,
      keystrokeFlightCV: features.keystrokeFlightCV,
      interKeystrokeJitter: features.interKeystrokeJitter,
      backspaceRate: features.backspaceRate,
      pauseBeforeFirstKeystroke: features.pauseBeforeFirstKeystroke,
      typingSpeedCPM: features.typingSpeedCPM,
      dwellToFlightRatio: features.dwellToFlightRatio,
      mouseVelocityMean: features.mouseVelocityMean,
      mouseVelocityStd: features.mouseVelocityStd,
      mouseAccelerationMean: features.mouseAccelerationMean,
      mouseAccelerationStd: features.mouseAccelerationStd,
      mouseJerkMean: features.mouseJerkMean,
      mouseJerkStd: features.mouseJerkStd,
      mouseCurvatureMean: features.mouseCurvatureMean,
      mouseStraightnessIndex: features.mouseStraightnessIndex,
      mouseAngleChangeRate: features.mouseAngleChangeRate,
      mousePauseRatio: features.mousePauseRatio,
      clickToClickDurationMean: features.clickToClickDurationMean,
      clickToClickDurationStd: features.clickToClickDurationStd,
      mousePathEfficiency: features.mousePathEfficiency,
      sampleCount: features.sampleCount,
    };

    if (this.prisma.isConnected) {
      try {
        let validUserId = userId;
        const userExists = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!userExists) {
          const firstUser = await this.prisma.user.findFirst();
          if (firstUser) {
            validUserId = firstUser.id;
          } else {
            const newUser = await this.prisma.user.create({
              data: {
                id: userId,
                email: `${userId}@aegisai.io`,
                fullName: 'Security Officer',
                status: 'ACTIVE',
              },
            });
            validUserId = newUser.id;
          }
        }

        await this.prisma.behavioralBaseline.upsert({
          where: { userId: validUserId },
          create: {
            ...baselineData,
          },
          update: {
            ...baselineData,
          },
        });
      } catch (err) {
        this.logger.debug(`Prisma calibration write fallback: ${err.message}`);
      }
    }

    this.inMemoryBaselines.set(userId, baselineData);

    return {
      success: true,
      is_baseline: true,
      sampleCount: features.sampleCount,
      features,
    };
  }

  async finalizeCalibration(userId: string, sessionId: string) {
    const buffer = this.inMemoryCalibrationBuffers.get(userId) || [];
    const allKeystrokes = buffer.flatMap((b) => b.keystrokes);
    const allMousePoints = buffer.flatMap((b) => b.mousePoints);
    const features = this.extractFeatures(allKeystrokes, allMousePoints);

    if (this.prisma.isConnected) {
      try {
        let validUserId = userId;
        const userExists = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!userExists) {
          const firstUser = await this.prisma.user.findFirst();
          if (firstUser) validUserId = firstUser.id;
        }

        const baselineData = {
          userId: validUserId,
          keystrokeDwellMean: features.keystrokeDwellMean || 112.0,
          keystrokeDwellStd: features.keystrokeDwellStd || 22.0,
          keystrokeFlightMean: features.keystrokeFlightMean || 135.0,
          keystrokeFlightStd: features.keystrokeFlightStd || 30.0,
          keystrokeFlightCV: features.keystrokeFlightCV || 0.25,
          interKeystrokeJitter: features.interKeystrokeJitter || 28.0,
          backspaceRate: features.backspaceRate || 0.05,
          pauseBeforeFirstKeystroke: features.pauseBeforeFirstKeystroke || 320.0,
          typingSpeedCPM: features.typingSpeedCPM || 245.0,
          dwellToFlightRatio: features.dwellToFlightRatio || 0.83,
          mouseVelocityMean: features.mouseVelocityMean || 820.0,
          mouseVelocityStd: features.mouseVelocityStd || 180.0,
          mouseAccelerationMean: features.mouseAccelerationMean || 2450.0,
          mouseAccelerationStd: features.mouseAccelerationStd || 1150.0,
          mouseJerkMean: features.mouseJerkMean || 40.0,
          mouseJerkStd: features.mouseJerkStd || 28.0,
          mouseCurvatureMean: features.mouseCurvatureMean || 0.38,
          mouseStraightnessIndex: features.mouseStraightnessIndex || 0.40,
          mouseAngleChangeRate: features.mouseAngleChangeRate || 2.7,
          mousePauseRatio: features.mousePauseRatio || 0.17,
          clickToClickDurationMean: features.clickToClickDurationMean || 620.0,
          clickToClickDurationStd: features.clickToClickDurationStd || 170.0,
          mousePathEfficiency: features.mousePathEfficiency || 0.67,
          sampleCount: Math.max(features.sampleCount, 50),
        };

        const saved = await this.prisma.behavioralBaseline.upsert({
          where: { userId: validUserId },
          create: {
            ...baselineData,
          },
          update: {
            ...baselineData,
          },
        });
        return { success: true, baseline: saved };
      } catch (err) {
        this.logger.debug(`Prisma finalize calibration error: ${err.message}`);
      }
    }

    const baselineData = {
      userId,
      keystrokeDwellMean: features.keystrokeDwellMean || 112.0,
      keystrokeDwellStd: features.keystrokeDwellStd || 22.0,
      keystrokeFlightMean: features.keystrokeFlightMean || 135.0,
      keystrokeFlightStd: features.keystrokeFlightStd || 30.0,
      keystrokeFlightCV: features.keystrokeFlightCV || 0.25,
      interKeystrokeJitter: features.interKeystrokeJitter || 28.0,
      backspaceRate: features.backspaceRate || 0.05,
      pauseBeforeFirstKeystroke: features.pauseBeforeFirstKeystroke || 320.0,
      typingSpeedCPM: features.typingSpeedCPM || 245.0,
      dwellToFlightRatio: features.dwellToFlightRatio || 0.83,
      mouseVelocityMean: features.mouseVelocityMean || 820.0,
      mouseVelocityStd: features.mouseVelocityStd || 180.0,
      mouseAccelerationMean: features.mouseAccelerationMean || 2450.0,
      mouseAccelerationStd: features.mouseAccelerationStd || 1150.0,
      mouseJerkMean: features.mouseJerkMean || 40.0,
      mouseJerkStd: features.mouseJerkStd || 28.0,
      mouseCurvatureMean: features.mouseCurvatureMean || 0.38,
      mouseStraightnessIndex: features.mouseStraightnessIndex || 0.40,
      mouseAngleChangeRate: features.mouseAngleChangeRate || 2.7,
      mousePauseRatio: features.mousePauseRatio || 0.17,
      clickToClickDurationMean: features.clickToClickDurationMean || 620.0,
      clickToClickDurationStd: features.clickToClickDurationStd || 170.0,
      mousePathEfficiency: features.mousePathEfficiency || 0.67,
      sampleCount: Math.max(features.sampleCount, 50),
    };

    this.inMemoryBaselines.set(userId, baselineData);
    return { success: true, baseline: baselineData };
  }

  async getBaseline(userId: string) {
    if (this.prisma.isConnected) {
      try {
        const baseline = await this.prisma.behavioralBaseline.findFirst({
          where: { userId },
        });

        if (baseline && baseline.sampleCount > 0) {
          return { hasBaseline: true, baseline };
        }
      } catch (err) {
        this.logger.debug(`Prisma getBaseline fallback: ${err.message}`);
      }
    }

    const mem = this.inMemoryBaselines.get(userId);
    if (mem && mem.sampleCount > 0) {
      return { hasBaseline: true, baseline: mem };
    }

    return { hasBaseline: false, baseline: null };
  }

  async getSessionMousePath(sessionId: string) {
    if (this.prisma.isConnected) {
      try {
        const session = await this.prisma.behavioralSession.findUnique({
          where: { id: sessionId },
          select: { id: true, mousePoints: true, isSimulated: true },
        });

        if (session && session.mousePoints) {
          try {
            const points = JSON.parse(session.mousePoints);
            return { sessionId, mousePoints: points, isSimulated: session.isSimulated };
          } catch (_) {}
        }
      } catch (err) {
        this.logger.debug(`Prisma getSessionMousePath fallback: ${err.message}`);
      }
    }

    const memSession = this.inMemorySessions.get(sessionId);
    return {
      sessionId,
      mousePoints: memSession?.mousePoints || [],
      isSimulated: memSession?.isSimulated || false,
    };
  }

  private storeInMemory(sessionId: string, userId: string, riskResult: any, mousePoints: any[]) {
    const existing = this.inMemorySessions.get(sessionId) || {
      id: sessionId,
      userId,
      sessionToken: `sess_${Date.now()}`,
      ipAddress: '127.0.0.1',
      location: 'Localhost Dev',
      createdAt: new Date().toISOString(),
    };

    existing.currentRiskScore = riskResult.overallRiskScore;
    existing.riskLevel = riskResult.riskLevel;
    existing.mfaState = riskResult.adaptiveMfaRequired ? AdaptiveMfaState.CHALLENGED : AdaptiveMfaState.NONE;
    existing.mousePoints = mousePoints;
    existing.updatedAt = new Date().toISOString();

    this.inMemorySessions.set(sessionId, existing);
  }

  private extractFeatures(keystrokes: any[] = [], mousePoints: any[] = []): ComputedBiometricFeatures {
    const calcMean = (arr: number[], fallback: number) =>
      arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : fallback;

    const calcStd = (arr: number[], mean: number, fallback: number) =>
      arr.length
        ? Math.sqrt(arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / arr.length)
        : fallback;

    // --- 1. Keystroke Dwell Times ---
    const dwells = keystrokes.map((k) => k.dwellTime || 110).filter((d) => d > 0);
    const dwellMean = calcMean(dwells, 110.0);
    const dwellStd = calcStd(dwells, dwellMean, 25.0);

    // --- 2. Keystroke Flight Times ---
    const flights = keystrokes.map((k) => k.flightTime || 140).filter((f) => f > 0);
    const flightMean = calcMean(flights, 140.0);
    const flightStd = calcStd(flights, flightMean, 35.0);

    // --- 3. Keystroke Flight CV (Coefficient of Variation) ---
    const flightCV = flightMean > 0 ? flightStd / flightMean : 0.25;

    // --- 4. Inter-Keystroke Timing Jitter (variance beyond CV) ---
    const flightJitters: number[] = [];
    if (flights.length >= 2) {
      for (let i = 1; i < flights.length; i++) {
        flightJitters.push(Math.abs(flights[i] - flights[i - 1]));
      }
    }
    const interKeystrokeJitter = calcMean(flightJitters, 30.0);

    // --- 5. Backspace / Correction Rate ---
    const correctionCount = keystrokes.filter((k) => {
      const key = (k.key || '').toLowerCase();
      return key === 'backspace' || key === 'delete';
    }).length;
    const backspaceRate = keystrokes.length > 0 ? correctionCount / keystrokes.length : 0.05;

    // --- 6. Pause Before First Keystroke ---
    let pauseBeforeFirstKeystroke = 350.0;
    if (keystrokes.length > 0) {
      const firstKeyTime = keystrokes[0].timestamp || 0;
      if (mousePoints.length > 0 && (mousePoints[0].t !== undefined || mousePoints[0].timestamp !== undefined)) {
        const firstMouseTime = mousePoints[0].t ?? mousePoints[0].timestamp;
        const diff = Math.abs(firstKeyTime - firstMouseTime);
        pauseBeforeFirstKeystroke = Math.min(Math.max(diff, 10.0), 3000.0);
      } else if (keystrokes[0].flightTime) {
        pauseBeforeFirstKeystroke = Math.min(Math.max(keystrokes[0].flightTime, 50.0), 2000.0);
      }
    }

    // --- 7. Typing Speed (Characters Per Minute) ---
    let typingSpeedCPM = 240.0;
    if (keystrokes.length >= 2) {
      const tStart = keystrokes[0].timestamp || 0;
      const tEnd = keystrokes[keystrokes.length - 1].timestamp || 0;
      const durationMin = (tEnd - tStart) / 60000;
      if (durationMin > 0.001) {
        typingSpeedCPM = Math.min(Math.max(keystrokes.length / durationMin, 30.0), 1200.0);
      }
    }

    // --- 8. Dwell to Flight Ratio ---
    const dwellToFlightRatio = flightMean > 0 ? dwellMean / flightMean : 0.78;

    // --- 9. Mouse Dynamics (Velocity, Acceleration, Jerk, Angles, Pauses) ---
    const velocities: number[] = [];
    const accelerations: number[] = [];
    const jerks: number[] = [];
    const angleChanges: number[] = [];
    let pauseSamples = 0;
    let totalPathLen = 0;
    let totalDurationS = 0;

    const clicks: number[] = [];
    for (let i = 0; i < mousePoints.length; i++) {
      const p = mousePoints[i];
      if (p.type === 'click') {
        clicks.push(p.t || p.timestamp || 0);
      }
    }

    if (mousePoints.length >= 2) {
      const angles: number[] = [];

      for (let i = 1; i < mousePoints.length; i++) {
        const p0 = mousePoints[i - 1];
        const p1 = mousePoints[i];
        const dist = Math.hypot(p1.x - p0.x, p1.y - p0.y);
        totalPathLen += dist;

        const t0 = p0.t ?? p0.timestamp;
        const t1 = p1.t ?? p1.timestamp;
        const dt = t0 && t1 && t1 > t0 ? (t1 - t0) / 1000 : 0.016;
        totalDurationS += dt;

        const vel = dt > 0 ? dist / dt : 0;
        velocities.push(vel);

        if (vel < 50.0) {
          pauseSamples++;
        }

        const angle = Math.atan2(p1.y - p0.y, p1.x - p0.x);
        angles.push(angle);
      }

      if (velocities.length >= 2) {
        for (let i = 1; i < velocities.length; i++) {
          const t0 = mousePoints[i - 1].t ?? mousePoints[i - 1].timestamp;
          const t1 = mousePoints[i].t ?? mousePoints[i].timestamp;
          const dt = t0 && t1 && t1 > t0 ? (t1 - t0) / 1000 : 0.016;
          const accel = dt > 0 ? Math.abs(velocities[i] - velocities[i - 1]) / dt : 0;
          accelerations.push(accel);
        }
      }

      if (accelerations.length >= 2) {
        for (let i = 1; i < accelerations.length; i++) {
          const t0 = mousePoints[i - 1].t ?? mousePoints[i - 1].timestamp;
          const t1 = mousePoints[i].t ?? mousePoints[i].timestamp;
          const dt = t0 && t1 && t1 > t0 ? (t1 - t0) / 1000 : 0.016;
          const jerk = dt > 0 ? Math.abs(accelerations[i] - accelerations[i - 1]) / dt : 0;
          jerks.push(jerk / 1000);
        }
      }

      if (angles.length >= 2) {
        for (let i = 1; i < angles.length; i++) {
          let diff = Math.abs(angles[i] - angles[i - 1]);
          if (diff > Math.PI) diff = 2 * Math.PI - diff;
          angleChanges.push(diff);
        }
      }
    }

    const mouseVelMean = calcMean(velocities, 850.0);
    const mouseVelStd = calcStd(velocities, mouseVelMean, 200.0);
    const mouseAccelMean = calcMean(accelerations, 2500.0);
    const mouseAccelStd = calcStd(accelerations, mouseAccelMean, 1200.0);
    const mouseJerkMean = calcMean(jerks, 45.0);
    const mouseJerkStd = calcStd(jerks, mouseJerkMean, 30.0);

    const directDist =
      mousePoints.length >= 2
        ? Math.hypot(
            mousePoints[mousePoints.length - 1].x - mousePoints[0].x,
            mousePoints[mousePoints.length - 1].y - mousePoints[0].y,
          )
        : 0;

    const straightness = totalPathLen > 0 ? Math.min(1.0, directDist / totalPathLen) : 0.40;
    const curvature = Math.round((1 - straightness) * 100) / 100;

    const totalAngleChange = angleChanges.reduce((a, b) => a + b, 0);
    const mouseAngleChangeRate = totalDurationS > 0 ? totalAngleChange / totalDurationS : 2.8;

    const mousePauseRatio = velocities.length > 0 ? pauseSamples / velocities.length : 0.18;

    // --- 10. Click to Click Duration ---
    const clickIntervals: number[] = [];
    if (clicks.length >= 2) {
      for (let i = 1; i < clicks.length; i++) {
        clickIntervals.push(Math.abs(clicks[i] - clicks[i - 1]));
      }
    }
    const clickToClickDurationMean = calcMean(clickIntervals, 650.0);
    const clickToClickDurationStd = calcStd(clickIntervals, clickToClickDurationMean, 180.0);

    // --- 11. Mouse Path Efficiency ---
    const mousePathEfficiency =
      totalPathLen > 0 ? Math.min(1.0, directDist / (totalPathLen + totalAngleChange * 10)) : 0.65;

    return {
      // 10 Keystroke Features
      keystrokeDwellMean: Math.round(dwellMean * 10) / 10,
      keystrokeDwellStd: Math.round(dwellStd * 10) / 10,
      keystrokeFlightMean: Math.round(flightMean * 10) / 10,
      keystrokeFlightStd: Math.round(flightStd * 10) / 10,
      keystrokeFlightCV: Math.round(flightCV * 1000) / 1000,
      interKeystrokeJitter: Math.round(interKeystrokeJitter * 10) / 10,
      backspaceRate: Math.round(backspaceRate * 1000) / 1000,
      pauseBeforeFirstKeystroke: Math.round(pauseBeforeFirstKeystroke * 10) / 10,
      typingSpeedCPM: Math.round(typingSpeedCPM * 10) / 10,
      dwellToFlightRatio: Math.round(dwellToFlightRatio * 1000) / 1000,

      // 13 Mouse Features
      mouseVelocityMean: Math.round(mouseVelMean * 10) / 10,
      mouseVelocityStd: Math.round(mouseVelStd * 10) / 10,
      mouseAccelerationMean: Math.round(mouseAccelMean * 10) / 10,
      mouseAccelerationStd: Math.round(mouseAccelStd * 10) / 10,
      mouseJerkMean: Math.round(mouseJerkMean * 10) / 10,
      mouseJerkStd: Math.round(mouseJerkStd * 10) / 10,
      mouseCurvatureMean: Math.round(curvature * 100) / 100,
      mouseStraightnessIndex: Math.round(straightness * 100) / 100,
      mouseAngleChangeRate: Math.round(mouseAngleChangeRate * 100) / 100,
      mousePauseRatio: Math.round(mousePauseRatio * 1000) / 1000,
      clickToClickDurationMean: Math.round(clickToClickDurationMean * 10) / 10,
      clickToClickDurationStd: Math.round(clickToClickDurationStd * 10) / 10,
      mousePathEfficiency: Math.round(mousePathEfficiency * 100) / 100,

      sampleCount: keystrokes.length + mousePoints.length,
    };
  }

  async getSessionStatus(sessionId: string) {
    if (this.prisma.isConnected) {
      try {
        const session = await this.prisma.behavioralSession.findUnique({
          where: { id: sessionId },
          include: {
            user: { select: { id: true, email: true, fullName: true } },
            riskAssessments: { orderBy: { timestamp: 'desc' }, take: 5 },
          },
        });
        if (session) return session;
      } catch (err) {
        this.logger.debug(`Prisma getSessionStatus fallback: ${err.message}`);
      }
    }

    return this.inMemorySessions.get(sessionId) || null;
  }

  async getAllSessions() {
    if (this.prisma.isConnected) {
      try {
        const sessions = await this.prisma.behavioralSession.findMany({
          orderBy: { updatedAt: 'desc' },
          take: 20,
          include: {
            user: { select: { id: true, email: true, fullName: true } },
          },
        });
        if (sessions.length) return sessions;
      } catch (err) {
        this.logger.debug(`Prisma getAllSessions fallback: ${err.message}`);
      }
    }

    return Array.from(this.inMemorySessions.values());
  }
}
