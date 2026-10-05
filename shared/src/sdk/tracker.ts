import {
  BiometricTelemetryPayload,
  ComputedBiometricFeatures,
  DeviceFingerprintPayload,
  KeystrokeMetric,
  MouseTrajectoryPoint,
} from '../types/biometrics';

export class AegisTracker {
  private sessionId: string;
  private userId: string;
  private backendUrl: string;
  private isTracking = false;

  private keyDownMap: Map<string, number> = new Map();
  private lastKeyUpTime: number | null = null;
  private keystrokesBuffer: KeystrokeMetric[] = [];

  private mouseBuffer: MouseTrajectoryPoint[] = [];
  private lastMousePoint: { x: number; y: number; time: number } | null = null;

  private flushIntervalTimer: ReturnType<typeof setInterval> | null = null;
  private onRiskUpdateCallback?: (riskData: any) => void;

  constructor(config: {
    sessionId: string;
    userId: string;
    backendUrl?: string;
    onRiskUpdate?: (riskData: any) => void;
  }) {
    this.sessionId = config.sessionId;
    this.userId = config.userId;
    this.backendUrl = (config.backendUrl || 'http://localhost:4000').replace(/\/+$/, '');
    this.onRiskUpdateCallback = config.onRiskUpdate;
  }

  public start(): void {
    if (this.isTracking || typeof window === 'undefined') return;
    this.isTracking = true;

    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('click', this.handleClick);

    // Flush telemetry every 3 seconds
    this.flushIntervalTimer = setInterval(() => this.flush(), 3000);
  }

  public stop(): void {
    if (!this.isTracking || typeof window === 'undefined') return;
    this.isTracking = false;

    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('click', this.handleClick);

    if (this.flushIntervalTimer) {
      clearInterval(this.flushIntervalTimer);
      this.flushIntervalTimer = null;
    }
  }

  private handleKeyDown = (e: KeyboardEvent): void => {
    const now = performance.now();
    if (!this.keyDownMap.has(e.code)) {
      this.keyDownMap.set(e.code, now);
    }
  };

  private handleKeyUp = (e: KeyboardEvent): void => {
    const now = performance.now();
    const keyDownTime = this.keyDownMap.get(e.code);

    if (keyDownTime !== undefined) {
      const dwellTime = Math.round(now - keyDownTime);
      const flightTime = this.lastKeyUpTime !== null ? Math.round(keyDownTime - this.lastKeyUpTime) : 0;
      this.lastKeyUpTime = now;

      this.keystrokesBuffer.push({
        key: e.code,
        dwellTime,
        flightTime: Math.max(0, flightTime),
        timestamp: Date.now(),
      });

      this.keyDownMap.delete(e.code);
    }
  };

  private handleMouseMove = (e: MouseEvent): void => {
    const now = performance.now();
    this.mouseBuffer.push({
      x: e.clientX,
      y: e.clientY,
      timestamp: Date.now(),
      type: 'move',
    });
  };

  private handleClick = (e: MouseEvent): void => {
    this.mouseBuffer.push({
      x: e.clientX,
      y: e.clientY,
      timestamp: Date.now(),
      type: 'click',
    });
  };

  public generateDeviceFingerprint(): DeviceFingerprintPayload {
    if (typeof window === 'undefined') {
      return {
        fingerprintHash: 'fp_ssr_default',
        userAgent: 'SSR',
        timezoneOffset: 0,
        hardwareConcurrency: 4,
      };
    }

    const ua = navigator.userAgent;
    const screenRes = `${window.screen.width}x${window.screen.height}`;
    const tz = new Date().getTimezoneOffset();
    const cores = navigator.hardwareConcurrency || 4;

    let canvasHash = 'canvas_hash_default';
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillStyle = '#f60';
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = '#069';
        ctx.fillText('AegisAI Biometrics', 2, 15);
        canvasHash = canvas.toDataURL().slice(-30);
      }
    } catch (_) {}

    const rawStr = `${ua}|${screenRes}|${tz}|${cores}|${canvasHash}`;
    let hash = 0;
    for (let i = 0; i < rawStr.length; i++) {
      const char = rawStr.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }

    return {
      fingerprintHash: `fp_aegis_${Math.abs(hash).toString(16)}`,
      canvasHash,
      webglRenderer: 'Standard WebGL Canvas Driver',
      screenResolution: screenRes,
      userAgent: ua,
      timezoneOffset: tz,
      hardwareConcurrency: cores,
    };
  }

  public computeFeatures(): ComputedBiometricFeatures {
    const ks = this.keystrokesBuffer;
    const ms = this.mouseBuffer;

    const calcMean = (arr: number[], fallback: number) =>
      arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : fallback;
    const calcStd = (arr: number[], mean: number, fallback: number) =>
      arr.length ? Math.sqrt(arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / arr.length) : fallback;

    // 1-4. Dwell and Flight times
    const dwellTimes = ks.map((k) => k.dwellTime).filter((d) => d > 0);
    const flightTimes = ks.map((k) => k.flightTime).filter((f) => f > 0);

    const dwellMean = calcMean(dwellTimes, 110.0);
    const dwellStd = calcStd(dwellTimes, dwellMean, 25.0);
    const flightMean = calcMean(flightTimes, 140.0);
    const flightStd = calcStd(flightTimes, flightMean, 35.0);

    // 5. Flight CV
    const flightCV = flightMean > 0 ? flightStd / flightMean : 0.25;

    // 6. Inter-keystroke Jitter
    const flightJitters: number[] = [];
    if (flightTimes.length >= 2) {
      for (let i = 1; i < flightTimes.length; i++) {
        flightJitters.push(Math.abs(flightTimes[i] - flightTimes[i - 1]));
      }
    }
    const interKeystrokeJitter = calcMean(flightJitters, 30.0);

    // 7. Backspace Rate
    const correctionCount = ks.filter((k) => {
      const key = (k.key || '').toLowerCase();
      return key === 'backspace' || key === 'delete';
    }).length;
    const backspaceRate = ks.length > 0 ? correctionCount / ks.length : 0.05;

    // 8. Pause Before First Keystroke
    let pauseBeforeFirstKeystroke = 350.0;
    if (ks.length > 0) {
      const firstKeyTime = ks[0].timestamp || 0;
      if (ms.length > 0 && ms[0].timestamp) {
        pauseBeforeFirstKeystroke = Math.min(Math.max(Math.abs(firstKeyTime - ms[0].timestamp), 10.0), 3000.0);
      } else if (ks[0].flightTime) {
        pauseBeforeFirstKeystroke = Math.min(Math.max(ks[0].flightTime, 50.0), 2000.0);
      }
    }

    // 9. Typing Speed (CPM)
    let typingSpeedCPM = 240.0;
    if (ks.length >= 2) {
      const tStart = ks[0].timestamp || 0;
      const tEnd = ks[ks.length - 1].timestamp || 0;
      const durMin = (tEnd - tStart) / 60000;
      if (durMin > 0.001) {
        typingSpeedCPM = Math.min(Math.max(ks.length / durMin, 30.0), 1200.0);
      }
    }

    // 10. Dwell to Flight Ratio
    const dwellToFlightRatio = flightMean > 0 ? dwellMean / flightMean : 0.78;

    // 11-20. Mouse kinematics and trajectory
    const velocities: number[] = [];
    const accelerations: number[] = [];
    const jerks: number[] = [];
    const angleChanges: number[] = [];
    let pauseSamples = 0;
    let totalPath = 0;
    let totalDurationS = 0;

    const clicks: number[] = [];
    for (let i = 0; i < ms.length; i++) {
      if (ms[i].type === 'click') clicks.push(ms[i].timestamp);
    }

    if (ms.length >= 2) {
      const angles: number[] = [];
      for (let i = 1; i < ms.length; i++) {
        const p1 = ms[i - 1];
        const p2 = ms[i];
        const dt = Math.max(1, p2.timestamp - p1.timestamp) / 1000;
        totalDurationS += dt;
        const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        totalPath += dist;

        const vel = (dist / dt);
        velocities.push(vel);
        if (vel < 50.0) pauseSamples++;

        angles.push(Math.atan2(p2.y - p1.y, p2.x - p1.x));
      }

      if (velocities.length >= 2) {
        for (let i = 1; i < velocities.length; i++) {
          const dt = Math.max(1, ms[i].timestamp - ms[i - 1].timestamp) / 1000;
          accelerations.push(Math.abs(velocities[i] - velocities[i - 1]) / dt);
        }
      }

      if (accelerations.length >= 2) {
        for (let i = 1; i < accelerations.length; i++) {
          const dt = Math.max(1, ms[i].timestamp - ms[i - 1].timestamp) / 1000;
          jerks.push(Math.abs(accelerations[i] - accelerations[i - 1]) / dt / 1000);
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

    const directDist = ms.length >= 2 ? Math.hypot(ms[ms.length - 1].x - ms[0].x, ms[ms.length - 1].y - ms[0].y) : 0;
    const straightness = totalPath > 0 ? Math.min(1.0, directDist / totalPath) : 0.40;
    const totalAngleChange = angleChanges.reduce((a, b) => a + b, 0);
    const mouseAngleChangeRate = totalDurationS > 0 ? totalAngleChange / totalDurationS : 2.8;
    const mousePauseRatio = velocities.length > 0 ? pauseSamples / velocities.length : 0.18;

    // 21-22. Click to click duration
    const clickIntervals: number[] = [];
    if (clicks.length >= 2) {
      for (let i = 1; i < clicks.length; i++) {
        clickIntervals.push(Math.abs(clicks[i] - clicks[i - 1]));
      }
    }
    const clickToClickDurationMean = calcMean(clickIntervals, 650.0);
    const clickToClickDurationStd = calcStd(clickIntervals, clickToClickDurationMean, 180.0);

    // 23. Path efficiency
    const mousePathEfficiency = totalPath > 0 ? Math.min(1.0, directDist / (totalPath + totalAngleChange * 10)) : 0.65;

    return {
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

      mouseVelocityMean: Math.round(mouseVelMean * 10) / 10,
      mouseVelocityStd: Math.round(mouseVelStd * 10) / 10,
      mouseAccelerationMean: Math.round(mouseAccelMean * 10) / 10,
      mouseAccelerationStd: Math.round(mouseAccelStd * 10) / 10,
      mouseJerkMean: Math.round(mouseJerkMean * 10) / 10,
      mouseJerkStd: Math.round(mouseJerkStd * 10) / 10,
      mouseCurvatureMean: Math.round((1 - straightness) * 100) / 100,
      mouseStraightnessIndex: Math.round(straightness * 100) / 100,
      mouseAngleChangeRate: Math.round(mouseAngleChangeRate * 100) / 100,
      mousePauseRatio: Math.round(mousePauseRatio * 1000) / 1000,
      clickToClickDurationMean: Math.round(clickToClickDurationMean * 10) / 10,
      clickToClickDurationStd: Math.round(clickToClickDurationStd * 10) / 10,
      mousePathEfficiency: Math.round(mousePathEfficiency * 100) / 100,

      sampleCount: ks.length + ms.length,
    };
  }

  public async flush(): Promise<void> {
    if (this.keystrokesBuffer.length === 0 && this.mouseBuffer.length === 0) return;

    const payload: BiometricTelemetryPayload = {
      sessionId: this.sessionId,
      userId: this.userId,
      keystrokes: [...this.keystrokesBuffer],
      mousePoints: [...this.mouseBuffer],
      deviceFingerprint: this.generateDeviceFingerprint(),
      timestamp: Date.now(),
    };

    // Clear buffers
    this.keystrokesBuffer = [];
    this.mouseBuffer = [];

    try {
      const baseUrl = this.backendUrl.endsWith('/api/v1')
        ? this.backendUrl
        : this.backendUrl.endsWith('/api')
        ? `${this.backendUrl}/v1`
        : `${this.backendUrl}/api/v1`;

      const res = await fetch(`${baseUrl}/biometrics/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        if (this.onRiskUpdateCallback) {
          this.onRiskUpdateCallback(data);
        }
      }
    } catch (_) {
      // Offline fallback
    }
  }
}
