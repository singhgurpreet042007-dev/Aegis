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

    const dwellTimes = ks.map((k) => k.dwellTime);
    const flightTimes = ks.map((k) => k.flightTime).filter((f) => f > 0);

    const calcMean = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
    const calcStd = (arr: number[], mean: number) =>
      arr.length ? Math.sqrt(arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / arr.length) : 0;

    const dwellMean = calcMean(dwellTimes) || 110;
    const dwellStd = calcStd(dwellTimes, dwellMean) || 25;
    const flightMean = calcMean(flightTimes) || 140;
    const flightStd = calcStd(flightTimes, flightMean) || 35;

    // Calculate mouse velocities & curvature
    const velocities: number[] = [];
    const jerks: number[] = [];

    for (let i = 1; i < ms.length; i++) {
      const p1 = ms[i - 1];
      const p2 = ms[i];
      const dt = Math.max(1, p2.timestamp - p1.timestamp);
      const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
      const vel = (dist / dt) * 1000;
      velocities.push(vel);

      if (i > 1) {
        const p0 = ms[i - 2];
        const dtPrev = Math.max(1, p1.timestamp - p0.timestamp);
        const distPrev = Math.hypot(p1.x - p0.x, p1.y - p0.y);
        const velPrev = (distPrev / dtPrev) * 1000;
        const accel = (vel - velPrev) / (dt / 1000);
        jerks.push(Math.abs(accel));
      }
    }

    const mouseVelMean = calcMean(velocities) || 850;
    const mouseVelStd = calcStd(velocities, mouseVelMean) || 200;
    const mouseJerkMean = calcMean(jerks) || 45;

    // Straightness index (direct distance / path length)
    let totalPath = 0;
    for (let i = 1; i < ms.length; i++) {
      totalPath += Math.hypot(ms[i].x - ms[i - 1].x, ms[i].y - ms[i - 1].y);
    }
    const directDist =
      ms.length >= 2 ? Math.hypot(ms[ms.length - 1].x - ms[0].x, ms[ms.length - 1].y - ms[0].y) : 0;
    const straightness = totalPath > 0 ? directDist / totalPath : 0.4;

    return {
      keystrokeDwellMean: Math.round(dwellMean * 10) / 10,
      keystrokeDwellStd: Math.round(dwellStd * 10) / 10,
      keystrokeFlightMean: Math.round(flightMean * 10) / 10,
      keystrokeFlightStd: Math.round(flightStd * 10) / 10,
      mouseVelocityMean: Math.round(mouseVelMean * 10) / 10,
      mouseVelocityStd: Math.round(mouseVelStd * 10) / 10,
      mouseJerkMean: Math.round(mouseJerkMean * 10) / 10,
      mouseCurvatureMean: Math.round((1 - straightness) * 100) / 100,
      mouseStraightnessIndex: Math.round(straightness * 100) / 100,
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
