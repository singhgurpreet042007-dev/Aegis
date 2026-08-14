import { Injectable, Logger } from '@nestjs/common';
import { RiskAssessmentResult, RiskLevel, AdaptiveMfaState } from '@aegis/shared';

// ─────────────────────────────────────────────────────────────────────────────
// Aegis AI — Risk Engine Service
// ─────────────────────────────────────────────────────────────────────────────
// Primary evaluator: calls the FastAPI ML micro-service (ai-risk-engine).
// Fallback evaluator: multi-factor weighted scoring runs in-process when the
// ML service is unreachable (local dev, cold start, etc.).
//
// Weighted formula (fallback):
//   score = w1*(keystroke_zscore)
//         + w2*(mouse_straightness_delta)
//         + w3*(velocity_anomaly_factor)
//         + w4*(inter_key_consistency_penalty)
//         + w5*(device_trust_penalty)
//
//   Weights: w1=0.30, w2=0.30, w3=0.20, w4=0.10, w5=0.10
//   Each component is normalised to [0, 1] before weighting.
// ─────────────────────────────────────────────────────────────────────────────

interface ExplainableFactor {
  feature: string;
  impact: 'NORMAL' | 'CRITICAL_ANOMALY' | 'HIGH_ANOMALY' | 'LOW_ANOMALY' | 'MATCH' | 'UNRECOGNIZED';
  score: number;       // contribution to overall risk (0.0 – 1.0)
  rawValue?: number;   // the actual measured value for audit display
  baselineValue?: number;
  description: string;
}

@Injectable()
export class RiskEngineService {
  private readonly logger = new Logger(RiskEngineService.name);
  private readonly riskEngineUrl = process.env.RISK_ENGINE_URL || 'http://localhost:8000';
  // ── Public: Primary evaluation ───────────────────────────────────────────

  /**
   * ╔══════════════════════════════════════════════════════════════════════════════════╗
   * ║                      SCORING WEIGHT JUSTIFICATION & DESIGN MATRIX                ║
   * ╠══════════════════════════════════════════════════════════════════════════════════╣
   * ║ Feature                  │ Weight │ Rationale & Cyber Threat Defense Justification ║
   * ╠──────────────────────────┼────────┼──────────────────────────────────────────────╣
   * ║ 1. Keystroke Dwell Z     │  0.30  │ Highest stability indicator in biometric ID. ║
   * ║                          │        │ Dwell time (key-down to key-up) is neuromuscular║
   * ║                          │        │ muscle memory that bots/hijackers cannot fake.║
   * ║ 2. Mouse Straightness    │  0.30  │ Bot/Script Detection anchor. Humans produce ║
   * ║    (Curvature/Jerk Delta)│        │ curved/jittered arcs. Automated scripts move  ║
   * ║                          │        │ in perfect linear vectors (straightness ~1.0).║
   * ║ 3. Mouse Velocity Z      │  0.20  │ Detects rapid automated cursor teleports vs   ║
   * ║                          │        │ natural human ballistic mouse movement curves. ║
   * ║ 4. Flight CV Consistency │  0.10  │ Inter-key timing variance (Flight CV). Measures║
   * ║                          │        │ rhythmic typing cadence vs automated replay.   ║
   * ║ 5. Device Trust Penalty  │  0.10  │ Hardware context anchor (TLS fingerprinting, ║
   * ║                          │        │ User-Agent, Screen Resolution, WebGL vendor).  ║
   * ╚══════════════════════════════════════════════════════════════════════════════════╝
   */
  async evaluateRisk(payload: {
    sessionId: string;
    userId: string;
    currentFeatures: Record<string, number>;
    baselineFeatures?: Record<string, number>;
    deviceTrusted?: boolean;
    isSimulated?: boolean;
    simulationType?: string;
  }): Promise<RiskAssessmentResult> {
    try {
      const response = await fetch(`${this.riskEngineUrl}/api/v1/predict-risk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: payload.sessionId,
          userId: payload.userId,
          currentFeatures: payload.currentFeatures,
          baselineFeatures: payload.baselineFeatures,
          deviceTrusted: payload.deviceTrusted ?? true,
          isSimulated: payload.isSimulated ?? false,
          simulationType: payload.simulationType,
        }),
        signal: AbortSignal.timeout(4000), // 4-second timeout
      });

      if (response.ok) {
        const body = await response.json();
        this.logger.debug(`ML risk score: ${body.data?.overallRiskScore} (FastAPI)`);
        return body.data;
      }
    } catch (err) {
      this.logger.warn(
        `FastAPI Risk Engine unavailable (${err.message}). Using multi-factor weighted fallback.`,
      );
    }

    return this.fallbackEvaluateRisk(payload);
  }

  // ── Private: Multi-factor weighted fallback ───────────────────────────────

  private fallbackEvaluateRisk(payload: {
    sessionId: string;
    userId: string;
    currentFeatures: Record<string, number>;
    baselineFeatures?: Record<string, number>;
    deviceTrusted?: boolean;
    isSimulated?: boolean;
    simulationType?: string;
  }): RiskAssessmentResult {
    const feat = payload.currentFeatures || {};
    const base = payload.baselineFeatures || {};
    const isSimulated = payload.isSimulated ?? false;

    // ── Component 1: Keystroke Z-Score (w = 0.30) ─────────────────────────
    // Compare measured dwell time against user's personalised baseline.
    // Z-score > 3 = critical anomaly (robot-speed or unusual rhythm).
    const dwellMean = feat.keystrokeDwellMean ?? 110;
    const dwellStd  = feat.keystrokeDwellStd  ?? 25;
    const baseDwell = base.keystrokeDwellMean  ?? 110;
    const baseStd   = base.keystrokeDwellStd   ?? 25;

    const dwellZScore = baseStd > 0 ? Math.abs(dwellMean - baseDwell) / baseStd : 0;
    const keystrokeComponent = Math.min(dwellZScore / 5, 1.0); // normalise: z=5 → score=1.0

    // ── Component 2: Mouse Straightness Delta (w = 0.30) ─────────────────
    // Human mouse paths curve; bots move in near-perfect straight lines.
    // Straightness Index: 0 = very curved (human), 1 = perfectly straight (bot).
    const straightness = feat.mouseStraightnessIndex ?? 0.40;
    const baselineStraightness = 0.40; // typical human baseline
    const straightnessDelta = Math.max(0, straightness - baselineStraightness);
    const mouseComponent = Math.min(straightnessDelta / 0.55, 1.0); // delta > 0.55 → score=1.0

    // ── Component 3: Velocity Anomaly Factor (w = 0.20) ──────────────────
    // Unusually fast (bot) or unusually slow (confused attacker) mouse velocity.
    const velocityMean = feat.mouseVelocityMean ?? 850;
    const baseVelocity = base.mouseVelocityMean ?? 850;
    const velocityStd  = base.mouseVelocityStd  ?? 200;
    const velocityZ    = velocityStd > 0 ? Math.abs(velocityMean - baseVelocity) / velocityStd : 0;
    const velocityComponent = Math.min(velocityZ / 4, 1.0); // normalise: z=4 → score=1.0

    // ── Component 4: Inter-Key Consistency Penalty (w = 0.10) ────────────
    // High coefficient of variation in flight times suggests scripted/macro input.
    const flightMean = feat.keystrokeFlightMean ?? 140;
    const flightStd  = feat.keystrokeFlightStd  ?? 35;
    const flightCV   = flightMean > 0 ? flightStd / flightMean : 0; // coefficient of variation
    // Human CV ≈ 0.25; bots CV < 0.05 (too consistent) or > 0.80 (too erratic)
    const consistencyAnomaly = flightCV < 0.05 || flightCV > 0.80;
    const consistencyComponent = consistencyAnomaly ? 0.8 : Math.min(Math.abs(flightCV - 0.25) * 2, 0.4);

    // ── Component 5: Device Trust Penalty (w = 0.10) ─────────────────────
    const deviceComponent = payload.deviceTrusted === false ? 0.9 : 0.0;

    // ── Simulated scenario overrides (for Intruder Simulator) ────────────
    let overallScore: number;
    if (isSimulated) {
      overallScore = payload.simulationType === 'BOT_ATTACK' ? 0.91 :
                     payload.simulationType === 'CREDENTIAL_STUFFING' ? 0.88 :
                     payload.simulationType === 'ACCOUNT_TAKEOVER' ? 0.82 : 0.75;
    } else {
      overallScore =
        0.30 * keystrokeComponent +
        0.30 * mouseComponent +
        0.20 * velocityComponent +
        0.10 * consistencyComponent +
        0.10 * deviceComponent;

      overallScore = Math.min(Math.max(overallScore, 0.04), 0.99);
    }

    // ── Risk level classification ─────────────────────────────────────────
    const riskLevel: RiskLevel =
      overallScore >= 0.75 ? RiskLevel.HIGH :
      overallScore >= 0.40 ? RiskLevel.MEDIUM :
      RiskLevel.LOW;

    // ── Full explainable factor breakdown ─────────────────────────────────
    const explainableFactors: ExplainableFactor[] = [
      {
        feature: 'Keystroke Dwell Time',
        impact: keystrokeComponent > 0.6 ? 'CRITICAL_ANOMALY' : keystrokeComponent > 0.3 ? 'HIGH_ANOMALY' : 'NORMAL',
        score: Math.round(keystrokeComponent * 0.30 * 100) / 100,
        rawValue: Math.round(dwellMean),
        baselineValue: Math.round(baseDwell),
        description: dwellZScore > 3
          ? `Dwell time ${dwellMean.toFixed(0)}ms deviates ${dwellZScore.toFixed(1)}σ from baseline (${baseDwell.toFixed(0)}ms) — possible scripted input.`
          : `Dwell time ${dwellMean.toFixed(0)}ms within normal range of baseline (${baseDwell.toFixed(0)}ms).`,
      },
      {
        feature: 'Mouse Path Straightness',
        impact: mouseComponent > 0.6 ? 'CRITICAL_ANOMALY' : mouseComponent > 0.3 ? 'HIGH_ANOMALY' : 'NORMAL',
        score: Math.round(mouseComponent * 0.30 * 100) / 100,
        rawValue: Math.round(straightness * 100) / 100,
        baselineValue: baselineStraightness,
        description: straightness > 0.80
          ? `Mouse straightness index ${straightness.toFixed(2)} — robotic linear trajectory detected (human expected ≤ 0.65).`
          : `Mouse path curvature ${straightness.toFixed(2)} consistent with natural human movement.`,
      },
      {
        feature: 'Mouse Velocity Profile',
        impact: velocityComponent > 0.6 ? 'CRITICAL_ANOMALY' : velocityComponent > 0.3 ? 'HIGH_ANOMALY' : 'NORMAL',
        score: Math.round(velocityComponent * 0.20 * 100) / 100,
        rawValue: Math.round(velocityMean),
        baselineValue: Math.round(baseVelocity),
        description: velocityZ > 2
          ? `Mouse velocity ${velocityMean.toFixed(0)}px/s deviates ${velocityZ.toFixed(1)}σ from baseline (${baseVelocity.toFixed(0)}px/s).`
          : `Mouse velocity ${velocityMean.toFixed(0)}px/s within normal range of baseline.`,
      },
      {
        feature: 'Inter-Key Flight Consistency',
        impact: consistencyAnomaly ? 'CRITICAL_ANOMALY' : consistencyComponent > 0.2 ? 'HIGH_ANOMALY' : 'NORMAL',
        score: Math.round(consistencyComponent * 0.10 * 100) / 100,
        rawValue: Math.round(flightCV * 100) / 100,
        description: flightCV < 0.05
          ? `Flight time CV ${flightCV.toFixed(3)} — suspiciously consistent keystrokes (automated macro pattern).`
          : flightCV > 0.80
          ? `Flight time CV ${flightCV.toFixed(3)} — highly erratic inter-key intervals (unusual access pattern).`
          : `Inter-key interval consistency CV ${flightCV.toFixed(3)} within expected human range (0.05 – 0.80).`,
      },
      {
        feature: 'Device Trust Status',
        impact: payload.deviceTrusted === false ? 'UNRECOGNIZED' : 'MATCH',
        score: deviceComponent * 0.10,
        description: payload.deviceTrusted === false
          ? 'Unrecognized device fingerprint — not in trusted device whitelist for this user.'
          : 'Device fingerprint matches a recognized and trusted device.',
      },
    ];

    const adaptiveMfa = overallScore >= 0.70;

    this.logger.debug(
      `Fallback risk score: ${overallScore.toFixed(3)} [ks=${keystrokeComponent.toFixed(2)} ms=${mouseComponent.toFixed(2)} vel=${velocityComponent.toFixed(2)} cv=${consistencyComponent.toFixed(2)} dev=${deviceComponent.toFixed(2)}]`,
    );

    return {
      sessionId: payload.sessionId,
      userId: payload.userId,
      overallRiskScore: Math.round(overallScore * 1000) / 1000,
      riskLevel,
      anomalyScore: overallScore,
      explainableFactors,
      adaptiveMfaRequired: adaptiveMfa,
      mfaState: adaptiveMfa ? AdaptiveMfaState.CHALLENGED : AdaptiveMfaState.NONE,
      evaluatedAt: new Date().toISOString(),
    };
  }

  // ── Public: Security Event Risk Classification ────────────────────────────
  /**
   * Classifies incoming security events from connected websites into risk tiers.
   * Respects trusted device contexts — suppresses redundant emails for known devices.
   */
  classifyEventRisk(payload: {
    eventType: string;
    domain: string;
    isContextTrusted?: boolean;
    deviceInfo?: string;
    ipAddress?: string;
    location?: string;
    details?: string;
  }): {
    riskScore: number;
    severity: RiskLevel;
    whySuspicious: string;
    notificationChannel: 'EMAIL' | 'IN_APP' | 'TIMELINE_ONLY';
  } {
    const { eventType, isContextTrusted, deviceInfo, ipAddress, location, details } = payload;

    // 1. Trusted device context check — suppress redundant alerts for known devices
    if (isContextTrusted && (
      eventType === 'SUSPICIOUS_LOGIN' ||
      eventType === 'NEW_LOGIN_DETECTED' ||
      eventType === 'UNRECOGNIZED_DEVICE'
    )) {
      return {
        riskScore: 0.05,
        severity: RiskLevel.LOW,
        whySuspicious: `Device context '${deviceInfo || 'Browser'}' is recognized & trusted by website owner. Suppressed redundant alert email.`,
        notificationChannel: 'TIMELINE_ONLY',
      };
    }

    // 2. Critical Risk Events
    const criticalEvents: Record<string, { score: number; why: string }> = {
      SECURITY_CONTROL_DISABLED: { score: 0.98, why: details || 'A critical Aegis AI security control or policy rule was disabled.' },
      MULTIPLE_UNUSUAL_EVENTS:   { score: 0.95, why: details || 'Multiple security anomalies occurred together in a short time frame.' },
      CRITICAL_VULNERABILITY_DETECTED: { score: 0.92, why: details || 'A critical zero-day or high-impact vulnerability was detected on the connected website.' },
      ACCOUNT_TAKEOVER_ATTEMPT: { score: 0.96, why: details || 'Account takeover pattern detected — rapid credential cycling observed.' },
    };
    if (criticalEvents[eventType]) {
      return { riskScore: criticalEvents[eventType].score, severity: RiskLevel.CRITICAL, whySuspicious: criticalEvents[eventType].why, notificationChannel: 'EMAIL' };
    }

    // 3. High Risk Events
    if (eventType === 'NEW_LOGIN_DETECTED' || eventType === 'SUSPICIOUS_LOGIN' || eventType === 'UNRECOGNIZED_DEVICE') {
      return {
        riskScore: 0.85,
        severity: RiskLevel.HIGH,
        whySuspicious: `A new active login was detected from an unrecognized device (${deviceInfo || 'Unknown Device'}) at IP ${ipAddress || '0.0.0.0'} (${location || 'Unknown Location'}).`,
        notificationChannel: 'EMAIL',
      };
    }
    if (eventType === 'AUTHENTICATION_ANOMALY') {
      return {
        riskScore: 0.88,
        severity: RiskLevel.HIGH,
        whySuspicious: details || `Significant authentication anomaly or biometrics baseline mismatch observed for ${deviceInfo || 'session'}.`,
        notificationChannel: 'EMAIL',
      };
    }
    if (eventType === 'UNEXPECTED_ADMIN_ACTIVITY') {
      return {
        riskScore: 0.82,
        severity: RiskLevel.HIGH,
        whySuspicious: details || 'Unexpected elevated administrative privilege escalation or action detected.',
        notificationChannel: 'EMAIL',
      };
    }
    if (eventType === 'BIOMETRIC_IDENTITY_MISMATCH') {
      return {
        riskScore: 0.87,
        severity: RiskLevel.HIGH,
        whySuspicious: details || 'Continuous behavioral biometrics identity check failed — mouse and keystroke patterns do not match owner baseline.',
        notificationChannel: 'EMAIL',
      };
    }

    // 4. Medium Risk Events
    if (eventType === 'WEBSITE_CONFIG_CHANGE' || eventType === 'WEBSITE_INTEGRITY_CHANGE') {
      return {
        riskScore: 0.55,
        severity: RiskLevel.MEDIUM,
        whySuspicious: details || 'A major website configuration or DOM integrity change was detected.',
        notificationChannel: 'IN_APP',
      };
    }
    if (eventType === 'FAILED_LOGIN_BURST') {
      return {
        riskScore: 0.62,
        severity: RiskLevel.MEDIUM,
        whySuspicious: details || 'Multiple consecutive failed login attempts detected — possible brute-force or credential stuffing attack.',
        notificationChannel: 'IN_APP',
      };
    }

    // 5. Default Low Risk (routine events, timeline only)
    return {
      riskScore: 0.15,
      severity: RiskLevel.LOW,
      whySuspicious: details || 'Routine security event logged.',
      notificationChannel: 'TIMELINE_ONLY',
    };
  }
}
