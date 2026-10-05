import { io, Socket } from 'socket.io-client';
import { ComputedBiometricFeatures } from '../shared';

export interface TelemetryMousePoint {
  x: number;
  y: number;
  t: number;
  speed?: number;
  type?: 'move' | 'click' | 'scroll';
}

export interface TelemetryKeystroke {
  key: string;
  dwellTime: number; // ms
  flightTime: number; // ms
  timestamp: number;
}

export interface DeviceFingerprintInfo {
  fingerprintHash: string;
  userAgent: string;
  screenResolution: string;
  hardwareConcurrency: number;
  timezoneOffset: number;
}

export interface TelemetryBatchPayload {
  sessionId: string;
  userId: string;
  is_baseline: boolean;
  keystrokes: TelemetryKeystroke[];
  mousePoints: TelemetryMousePoint[];
  deviceFingerprint: DeviceFingerprintInfo;
  timestamp: number;
}

export class TelemetryTracker {
  private socket: Socket | null = null;
  private isTracking = false;
  private isBaseline = false;
  private sessionId = '';
  private userId = '';
  
  private mouseBuffer: TelemetryMousePoint[] = [];
  private keystrokeBuffer: TelemetryKeystroke[] = [];
  private activeKeyDownMap: Map<string, number> = new Map();
  private lastKeyUpTimestamp: number | null = null;
  private lastMouseTimestamp = 0;
  private batchIntervalId: any = null;

  constructor() {}

  public getFingerprint(): DeviceFingerprintInfo {
    if (typeof window === 'undefined') {
      return {
        fingerprintHash: 'fp_ssr_unknown',
        userAgent: 'SSR',
        screenResolution: '1920x1080',
        hardwareConcurrency: 8,
        timezoneOffset: 0,
      };
    }

    const nav = window.navigator;
    const scr = window.screen;
    const str = `${nav.userAgent}-${scr.width}x${scr.height}-${nav.hardwareConcurrency}-${new Date().getTimezoneOffset()}`;
    
    // Simple fast DJB2 hash for browser fingerprint string
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 33) ^ str.charCodeAt(i);
    }
    const fpHash = `fp_${Math.abs(hash).toString(16)}`;

    return {
      fingerprintHash: fpHash,
      userAgent: nav.userAgent,
      screenResolution: `${scr.width}x${scr.height}`,
      hardwareConcurrency: nav.hardwareConcurrency || 4,
      timezoneOffset: new Date().getTimezoneOffset(),
    };
  }

  public computeFeatures(): ComputedBiometricFeatures {
    const ks = this.keystrokeBuffer;
    const ms = this.mouseBuffer;

    const calcMean = (arr: number[], fallback: number) =>
      arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : fallback;
    const calcStd = (arr: number[], mean: number, fallback: number) =>
      arr.length ? Math.sqrt(arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / arr.length) : fallback;

    // 1-4. Keystroke Dwell and Flight times
    const dwellTimes = ks.map((k) => k.dwellTime).filter((d) => d > 0);
    const flightTimes = ks.map((k) => k.flightTime).filter((f) => f > 0);

    const dwellMean = calcMean(dwellTimes, 110.0);
    const dwellStd = calcStd(dwellTimes, dwellMean, 25.0);
    const flightMean = calcMean(flightTimes, 140.0);
    const flightStd = calcStd(flightTimes, flightMean, 35.0);

    // 5. Keystroke Flight CV
    const flightCV = flightMean > 0 ? flightStd / flightMean : 0.25;

    // 6. Inter-keystroke Jitter (timing variance beyond flight CV)
    const flightJitters: number[] = [];
    if (flightTimes.length >= 2) {
      for (let i = 1; i < flightTimes.length; i++) {
        flightJitters.push(Math.abs(flightTimes[i] - flightTimes[i - 1]));
      }
    }
    const interKeystrokeJitter = calcMean(flightJitters, 30.0);

    // 7. Backspace / Correction Rate
    const correctionCount = ks.filter((k) => {
      const key = (k.key || '').toLowerCase();
      return key === 'backspace' || key === 'delete';
    }).length;
    const backspaceRate = ks.length > 0 ? correctionCount / ks.length : 0.05;

    // 8. Pause Before First Keystroke
    let pauseBeforeFirstKeystroke = 350.0;
    if (ks.length > 0) {
      const firstKeyTime = ks[0].timestamp || 0;
      if (ms.length > 0 && ms[0].t) {
        pauseBeforeFirstKeystroke = Math.min(Math.max(Math.abs(firstKeyTime - ms[0].t), 10.0), 3000.0);
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
      if (ms[i].type === 'click') clicks.push(ms[i].t);
    }

    if (ms.length >= 2) {
      const angles: number[] = [];
      for (let i = 1; i < ms.length; i++) {
        const p1 = ms[i - 1];
        const p2 = ms[i];
        const dt = Math.max(1, p2.t - p1.t) / 1000;
        totalDurationS += dt;
        const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        totalPath += dist;

        const vel = dist / dt;
        velocities.push(vel);
        if (vel < 50.0) pauseSamples++;

        angles.push(Math.atan2(p2.y - p1.y, p2.x - p1.x));
      }

      if (velocities.length >= 2) {
        for (let i = 1; i < velocities.length; i++) {
          const dt = Math.max(1, ms[i].t - ms[i - 1].t) / 1000;
          accelerations.push(Math.abs(velocities[i] - velocities[i - 1]) / dt);
        }
      }

      if (accelerations.length >= 2) {
        for (let i = 1; i < accelerations.length; i++) {
          const dt = Math.max(1, ms[i].t - ms[i - 1].t) / 1000;
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

    // 23. Mouse Path efficiency
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

  public startTracking(options: {
    sessionId: string;
    userId: string;
    isBaseline?: boolean;
    serverUrl?: string;
  }) {
    if (this.isTracking) return;

    this.sessionId = options.sessionId;
    this.userId = options.userId;
    this.isBaseline = options.isBaseline ?? false;
    this.isTracking = true;

    const wsUrl = options.serverUrl || process.env.NEXT_PUBLIC_WS_URL || 'https://aegis-backend-rm7s.onrender.com';
    
    try {
      this.socket = io(`${wsUrl}/biometrics`, {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
      });

      this.socket.on('connect', () => {
        console.log(`[TelemetryTracker] Connected to biometrics WebSocket: ${this.socket?.id}`);
        this.socket?.emit('subscribe_session', { sessionId: this.sessionId });
      });

      this.socket.on('connect_error', (err) => {
        console.warn(`[TelemetryTracker] WebSocket connection error:`, err.message);
      });
    } catch (err) {
      console.warn('[TelemetryTracker] Could not connect socket:', err);
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('mousemove', this.handleMouseMove);
      window.addEventListener('mousedown', this.handleMouseDown);
      window.addEventListener('keydown', this.handleKeyDown);
      window.addEventListener('keyup', this.handleKeyUp);
    }

    // Flush batch every 750ms
    this.batchIntervalId = setInterval(() => {
      this.flushBatch();
    }, 750);
  }

  public stopTracking() {
    if (!this.isTracking) return;

    this.isTracking = false;
    if (this.batchIntervalId) {
      clearInterval(this.batchIntervalId);
      this.batchIntervalId = null;
    }

    if (typeof window !== 'undefined') {
      window.removeEventListener('mousemove', this.handleMouseMove);
      window.removeEventListener('mousedown', this.handleMouseDown);
      window.removeEventListener('keydown', this.handleKeyDown);
      window.removeEventListener('keyup', this.handleKeyUp);
    }

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  public setIsBaseline(isBaseline: boolean) {
    this.isBaseline = isBaseline;
  }

  private handleMouseDown = (e: MouseEvent) => {
    this.mouseBuffer.push({
      x: Math.round(e.clientX),
      y: Math.round(e.clientY),
      t: Math.round(Date.now()),
      speed: 0,
      type: 'click',
    });
    if (this.mouseBuffer.length > 200) {
      this.mouseBuffer.shift();
    }
  };

  private handleMouseMove = (e: MouseEvent) => {
    const now = performance.now();
    // Throttle to 50ms - 100ms intervals
    if (now - this.lastMouseTimestamp < 60) return;

    let speed = 0;
    if (this.mouseBuffer.length > 0) {
      const prev = this.mouseBuffer[this.mouseBuffer.length - 1];
      const dt = (now - prev.t) / 1000;
      const dist = Math.hypot(e.clientX - prev.x, e.clientY - prev.y);
      speed = dt > 0 ? dist / dt : 0;
    }

    this.mouseBuffer.push({
      x: Math.round(e.clientX),
      y: Math.round(e.clientY),
      t: Math.round(Date.now()),
      speed: Math.round(speed),
      type: 'move',
    });

    this.lastMouseTimestamp = now;

    // Limit buffer length
    if (this.mouseBuffer.length > 200) {
      this.mouseBuffer.shift();
    }
  };

  private handleKeyDown = (e: KeyboardEvent) => {
    if (e.repeat) return; // ignore auto-repeat
    const now = Date.now();
    this.activeKeyDownMap.set(e.code || e.key, now);
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    const now = Date.now();
    const key = e.code || e.key;
    const keyDownTime = this.activeKeyDownMap.get(key);

    if (keyDownTime) {
      const dwellTime = Math.max(5, now - keyDownTime);
      let flightTime = 0;

      if (this.lastKeyUpTimestamp) {
        flightTime = Math.max(0, keyDownTime - this.lastKeyUpTimestamp);
      }
      this.lastKeyUpTimestamp = now;

      this.keystrokeBuffer.push({
        key,
        dwellTime,
        flightTime,
        timestamp: now,
      });

      this.activeKeyDownMap.delete(key);

      if (this.keystrokeBuffer.length > 100) {
        this.keystrokeBuffer.shift();
      }
    }
  };

  public flushBatch() {
    if (this.mouseBuffer.length === 0 && this.keystrokeBuffer.length === 0) {
      return;
    }

    const payload: TelemetryBatchPayload = {
      sessionId: this.sessionId,
      userId: this.userId,
      is_baseline: this.isBaseline,
      keystrokes: [...this.keystrokeBuffer],
      mousePoints: [...this.mouseBuffer],
      deviceFingerprint: this.getFingerprint(),
      timestamp: Date.now(),
    };

    // Send over WebSocket if connected
    if (this.socket && this.socket.connected) {
      this.socket.emit('telemetry_batch', payload);
    } else {
      // HTTP fallback
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://aegis-backend-rm7s.onrender.com/api';
      fetch(`${backendUrl}/v1/biometrics/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: payload.sessionId,
          userId: payload.userId,
          is_baseline: payload.is_baseline,
          keystrokes: payload.keystrokes,
          mousePoints: payload.mousePoints,
          deviceFingerprint: payload.deviceFingerprint,
        }),
      }).catch(() => {});
    }

    // Keep last 20 mouse points for path continuity, clear the rest
    this.mouseBuffer = this.mouseBuffer.slice(-20);
    this.keystrokeBuffer = [];
  }

  /**
   * Static feature extraction matching the backend's extractFeatures() logic.
   * Can be called on arbitrary telemetry arrays without a tracker instance.
   */
  public static extractFeatures(
    keystrokes: any[] = [],
    mousePoints: any[] = []
  ): ComputedBiometricFeatures {
    const calcMean = (arr: number[], fallback: number) =>
      arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : fallback;

    const calcStd = (arr: number[], mean: number, fallback: number) =>
      arr.length
        ? Math.sqrt(arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / arr.length)
        : fallback;

    // 1-2. Keystroke Dwell Times
    const dwells = keystrokes.map((k) => k.dwellTime || 110).filter((d) => d > 0);
    const dwellMean = calcMean(dwells, 110.0);
    const dwellStd = calcStd(dwells, dwellMean, 25.0);

    // 3-4. Keystroke Flight Times
    const flights = keystrokes.map((k) => k.flightTime || 140).filter((f) => f > 0);
    const flightMean = calcMean(flights, 140.0);
    const flightStd = calcStd(flights, flightMean, 35.0);

    // 5. Flight CV
    const flightCV = flightMean > 0 ? flightStd / flightMean : 0.25;

    // 6. Timing Jitter
    const flightJitters: number[] = [];
    if (flights.length >= 2) {
      for (let i = 1; i < flights.length; i++) {
        flightJitters.push(Math.abs(flights[i] - flights[i - 1]));
      }
    }
    const interKeystrokeJitter = calcMean(flightJitters, 30.0);

    // 7. Backspace Rate
    const correctionCount = keystrokes.filter((k) => {
      const key = (k.key || '').toLowerCase();
      return key === 'backspace' || key === 'delete';
    }).length;
    const backspaceRate = keystrokes.length > 0 ? correctionCount / keystrokes.length : 0.05;

    // 8. Pause Before First Keystroke
    let pauseBeforeFirstKeystroke = 350.0;
    if (keystrokes.length > 0) {
      const firstKeyTime = keystrokes[0].timestamp || 0;
      if (mousePoints.length > 0) {
        const firstMouseTime = mousePoints[0].t ?? mousePoints[0].timestamp ?? 0;
        if (firstMouseTime > 0) {
          pauseBeforeFirstKeystroke = Math.min(Math.max(Math.abs(firstKeyTime - firstMouseTime), 10.0), 3000.0);
        }
      } else if (keystrokes[0].flightTime) {
        pauseBeforeFirstKeystroke = Math.min(Math.max(keystrokes[0].flightTime, 50.0), 2000.0);
      }
    }

    // 9. Typing Cadence (CPM)
    let typingSpeedCPM = 240.0;
    if (keystrokes.length >= 2) {
      const tStart = keystrokes[0].timestamp || 0;
      const tEnd = keystrokes[keystrokes.length - 1].timestamp || 0;
      const durMin = (tEnd - tStart) / 60000;
      if (durMin > 0.001) {
        typingSpeedCPM = Math.min(Math.max(keystrokes.length / durMin, 30.0), 1200.0);
      }
    }

    // 10. Dwell to Flight Ratio
    const dwellToFlightRatio = flightMean > 0 ? dwellMean / flightMean : 0.78;

    // 11-20. Mouse Kinematics
    const velocities: number[] = [];
    const accelerations: number[] = [];
    const jerks: number[] = [];
    const angleChanges: number[] = [];
    let pauseSamples = 0;
    let totalPath = 0;
    let totalDurationS = 0;

    const clicks: number[] = [];
    for (let i = 0; i < mousePoints.length; i++) {
      if (mousePoints[i].type === 'click') {
        clicks.push(mousePoints[i].t ?? mousePoints[i].timestamp ?? 0);
      }
    }

    if (mousePoints.length >= 2) {
      const angles: number[] = [];
      for (let i = 1; i < mousePoints.length; i++) {
        const p1 = mousePoints[i - 1];
        const p2 = mousePoints[i];
        const t1 = p1.t ?? p1.timestamp ?? 0;
        const t2 = p2.t ?? p2.timestamp ?? 0;
        const dt = Math.max(1, t2 - t1) / 1000;
        totalDurationS += dt;
        const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        totalPath += dist;

        const vel = dist / dt;
        velocities.push(vel);
        if (vel < 50.0) pauseSamples++;

        angles.push(Math.atan2(p2.y - p1.y, p2.x - p1.x));
      }

      if (velocities.length >= 2) {
        for (let i = 1; i < velocities.length; i++) {
          const t1 = mousePoints[i - 1].t ?? mousePoints[i - 1].timestamp ?? 0;
          const t2 = mousePoints[i].t ?? mousePoints[i].timestamp ?? 0;
          const dt = Math.max(1, t2 - t1) / 1000;
          accelerations.push(Math.abs(velocities[i] - velocities[i - 1]) / dt);
        }
      }

      if (accelerations.length >= 2) {
        for (let i = 1; i < accelerations.length; i++) {
          const t1 = mousePoints[i - 1].t ?? mousePoints[i - 1].timestamp ?? 0;
          const t2 = mousePoints[i].t ?? mousePoints[i].timestamp ?? 0;
          const dt = Math.max(1, t2 - t1) / 1000;
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

    const directDist =
      mousePoints.length >= 2
        ? Math.hypot(
            mousePoints[mousePoints.length - 1].x - mousePoints[0].x,
            mousePoints[mousePoints.length - 1].y - mousePoints[0].y
          )
        : 0;
    const straightness = totalPath > 0 ? Math.min(1.0, directDist / totalPath) : 0.40;
    const totalAngleChange = angleChanges.reduce((a, b) => a + b, 0);
    const mouseAngleChangeRate = totalDurationS > 0 ? totalAngleChange / totalDurationS : 2.8;
    const mousePauseRatio = velocities.length > 0 ? pauseSamples / velocities.length : 0.18;

    // 21-22. Click Intervals
    const clickIntervals: number[] = [];
    if (clicks.length >= 2) {
      for (let i = 1; i < clicks.length; i++) {
        clickIntervals.push(Math.abs(clicks[i] - clicks[i - 1]));
      }
    }
    const clickToClickDurationMean = calcMean(clickIntervals, 650.0);
    const clickToClickDurationStd = calcStd(clickIntervals, clickToClickDurationMean, 180.0);

    // 23. Path Efficiency
    const mousePathEfficiency =
      totalPath > 0 ? Math.min(1.0, directDist / (totalPath + totalAngleChange * 10)) : 0.65;

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
      sampleCount: keystrokes.length + mousePoints.length,
    };
  }

  /**
   * Local multi-factor weighted risk calculator (matches backend fallbackEvaluateRisk).
   * Enables immediate zero-latency local risk evaluation directly in the client.
   */
  public static evaluateLocalRisk(
    currentFeatures: Partial<ComputedBiometricFeatures> | Record<string, number>,
    baselineFeatures?: Partial<ComputedBiometricFeatures> | Record<string, number>,
    deviceTrusted: boolean = true
  ): {
    overallRiskScore: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    anomalyScore: number;
    adaptiveMfaRequired: boolean;
    explainableFactors: any[];
  } {
    const feat = (currentFeatures || {}) as Record<string, number>;
    const base = (baselineFeatures || {}) as Record<string, number>;

    // 1. Keystroke Dwell Z-Score (w = 0.30)
    const dwellMean = feat.keystrokeDwellMean ?? 110;
    const baseDwell = base.keystrokeDwellMean ?? 110;
    const baseStd = base.keystrokeDwellStd ?? 25;
    const dwellZ = baseStd > 0 ? Math.abs(dwellMean - baseDwell) / baseStd : 0;
    const keystrokeComponent = Math.min(dwellZ / 5.0, 1.0);

    // 2. Mouse Straightness Delta (w = 0.30)
    const straightness = feat.mouseStraightnessIndex ?? 0.40;
    const straightnessDelta = Math.max(0, straightness - 0.40);
    const mouseComponent = Math.min(straightnessDelta / 0.55, 1.0);

    // 3. Velocity Anomaly (w = 0.20)
    const velocityMean = feat.mouseVelocityMean ?? 850;
    const baseVelocity = base.mouseVelocityMean ?? 850;
    const velocityStd = base.mouseVelocityStd ?? 200;
    const velocityZ = velocityStd > 0 ? Math.abs(velocityMean - baseVelocity) / velocityStd : 0;
    const velocityComponent = Math.min(velocityZ / 4.0, 1.0);

    // 4. Inter-Key Consistency (w = 0.10)
    const flightMean = feat.keystrokeFlightMean ?? 140;
    const flightStd = feat.keystrokeFlightStd ?? 35;
    const flightCV = flightMean > 0 ? flightStd / flightMean : 0;
    const consistencyAnomaly = flightCV < 0.05 || flightCV > 0.80;
    const consistencyComponent = consistencyAnomaly ? 0.80 : Math.min(Math.abs(flightCV - 0.25) * 2.0, 0.40);

    // 5. Device Trust Penalty (w = 0.10)
    const deviceComponent = deviceTrusted === false ? 0.90 : 0.0;

    const overall =
      0.30 * keystrokeComponent +
      0.30 * mouseComponent +
      0.20 * velocityComponent +
      0.10 * consistencyComponent +
      0.10 * deviceComponent;

    const overallScore = Math.round(Math.min(Math.max(overall, 0.04), 0.99) * 100) / 100;
    const riskLevel =
      overallScore >= 0.90 ? 'CRITICAL' : overallScore >= 0.75 ? 'HIGH' : overallScore >= 0.40 ? 'MEDIUM' : 'LOW';
    const adaptiveMfaRequired = overallScore >= 0.70;

    const factors = [
      {
        feature: 'Mouse Path Straightness',
        impact: mouseComponent > 0.6 ? 'CRITICAL_ANOMALY' : mouseComponent > 0.3 ? 'HIGH_ANOMALY' : 'NORMAL',
        score: Math.round(mouseComponent * 0.30 * 100) / 100,
        rawValue: straightness,
        baselineValue: 0.40,
        description:
          straightness > 0.85
            ? `Mouse straightness ${straightness.toFixed(2)} indicates robotic trajectory.`
            : `Mouse curvature ${straightness.toFixed(2)} matches natural human movement.`,
      },
      {
        feature: 'Keystroke Dwell Time',
        impact: keystrokeComponent > 0.6 ? 'CRITICAL_ANOMALY' : keystrokeComponent > 0.3 ? 'HIGH_ANOMALY' : 'NORMAL',
        score: Math.round(keystrokeComponent * 0.30 * 100) / 100,
        rawValue: Math.round(dwellMean),
        baselineValue: Math.round(baseDwell),
        description:
          dwellZ > 3
            ? `Dwell time ${dwellMean.toFixed(0)}ms deviates ${dwellZ.toFixed(1)}σ from baseline.`
            : `Dwell time ${dwellMean.toFixed(0)}ms within normal human tolerance.`,
      },
      {
        feature: 'Inter-Key Flight Consistency',
        impact: consistencyAnomaly ? 'CRITICAL_ANOMALY' : 'NORMAL',
        score: Math.round(consistencyComponent * 0.10 * 100) / 100,
        rawValue: Math.round(flightCV * 100) / 100,
        description:
          flightCV < 0.05
            ? `Flight CV ${flightCV.toFixed(3)} indicates scripted key timing.`
            : `Flight CV ${flightCV.toFixed(3)} within human variation.`,
      },
      {
        feature: 'Mouse Velocity Profile',
        impact: velocityComponent > 0.5 ? 'HIGH_ANOMALY' : 'NORMAL',
        score: Math.round(velocityComponent * 0.20 * 100) / 100,
        rawValue: Math.round(velocityMean),
        baselineValue: Math.round(baseVelocity),
        description: `Pointer velocity ${velocityMean.toFixed(0)}px/s (baseline: ${baseVelocity.toFixed(0)}px/s).`,
      },
    ];

    return {
      overallRiskScore: overallScore,
      riskLevel,
      anomalyScore: overallScore,
      adaptiveMfaRequired,
      explainableFactors: factors,
    };
  }

  /**
   * Programmatically dispatches synthetic attack telemetry across any
   * Red Team scenario through the live WebSocket & HTTP pipelines.
   */
  public simulateAttack(
    scenario: 'BOT_ATTACK' | 'CREDENTIAL_STUFFING' | 'ACCOUNT_TAKEOVER' | 'KEYSTROKE_ANOMALY' | 'NORMAL_USER' | string,
    options?: {
      pointCount?: number;
      startX?: number;
      startY?: number;
    }
  ): TelemetryBatchPayload {
    const count = options?.pointCount || 40;
    let currX = options?.startX || 100;
    let currY = options?.startY || 100;
    const now = Date.now();

    const syntheticMousePoints: TelemetryMousePoint[] = [];
    const syntheticKeystrokes: TelemetryKeystroke[] = [];

    const sc = scenario.toUpperCase();

    if (sc === 'BOT_ATTACK') {
      // Perfectly straight diagonal trajectory, constant 1326 px/s speed
      for (let i = 0; i < count; i++) {
        currX += 15;
        currY += 15;
        syntheticMousePoints.push({
          x: Math.round(currX),
          y: Math.round(currY),
          t: now + i * 16,
          speed: 1326,
          type: 'move',
        });
      }
      syntheticMousePoints.push({ x: Math.round(currX), y: Math.round(currY), t: now + count * 16 + 50, speed: 0, type: 'click' });
      syntheticMousePoints.push({ x: Math.round(currX), y: Math.round(currY), t: now + count * 16 + 100, speed: 0, type: 'click' });

      ['KeyA', 'KeyD', 'KeyM', 'KeyI', 'KeyN', 'Enter'].forEach((k, i) => {
        syntheticKeystrokes.push({ key: k, dwellTime: 10.0, flightTime: 20.0, timestamp: now + i * 30 });
      });
    } else if (sc === 'CREDENTIAL_STUFFING') {
      // Rapid automated keystroke bursts, 5ms flight, 0 mouse movement
      ['KeyU', 'KeyS', 'KeyE', 'KeyR', 'Tab', 'KeyP', 'KeyA', 'KeyS', 'KeyS', 'Enter'].forEach((k, i) => {
        syntheticKeystrokes.push({ key: k, dwellTime: 12.0, flightTime: 5.0, timestamp: now + i * 17 });
      });
      syntheticMousePoints.push({ x: 200, y: 300, t: now, speed: 0, type: 'click' });
    } else if (sc === 'ACCOUNT_TAKEOVER') {
      // Highly erratic flight times (CV > 0.8), jerky fast mouse
      for (let i = 0; i < count; i++) {
        currX += (i % 2 === 0 ? 35 : -15);
        currY += 25;
        syntheticMousePoints.push({
          x: Math.round(currX),
          y: Math.round(currY),
          t: now + i * 12,
          speed: 1950,
          type: 'move',
        });
      }
      ['KeyS', 'KeyE', 'KeyC', 'KeyR', 'KeyE', 'KeyT'].forEach((k, i) => {
        const erraticFlight = i % 2 === 0 ? 30.0 : 480.0;
        syntheticKeystrokes.push({ key: k, dwellTime: 260.0, flightTime: erraticFlight, timestamp: now + i * 350 });
      });
    } else if (sc === 'KEYSTROKE_ANOMALY') {
      // Macro rapid replay keystrokes with normal mouse motion
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI;
        currX += Math.cos(angle) * 8;
        currY += Math.sin(angle) * 8;
        syntheticMousePoints.push({ x: Math.round(currX), y: Math.round(currY), t: now + i * 32, speed: 450, type: 'move' });
      }
      ['KeyT', 'KeyE', 'KeyS', 'KeyT'].forEach((k, i) => {
        syntheticKeystrokes.push({ key: k, dwellTime: 8.0, flightTime: 12.0, timestamp: now + i * 20 });
      });
    } else {
      // NORMAL_USER: Smooth curved trajectory, 110ms dwell, 140ms flight
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 0.8;
        currX += Math.cos(angle) * 12;
        currY += Math.sin(angle) * 10;
        syntheticMousePoints.push({ x: Math.round(currX), y: Math.round(currY), t: now + i * 20, speed: 750, type: 'move' });
      }
      ['KeyH', 'KeyE', 'KeyL', 'KeyL', 'KeyO'].forEach((k, i) => {
        syntheticKeystrokes.push({ key: k, dwellTime: 110.0 + (i % 3) * 5, flightTime: 140.0 + (i % 2) * 10, timestamp: now + i * 250 });
      });
    }

    const payload: TelemetryBatchPayload = {
      sessionId: this.sessionId || `sess_sim_${sc.toLowerCase()}`,
      userId: this.userId || 'usr_sim_redteam',
      is_baseline: false,
      keystrokes: syntheticKeystrokes,
      mousePoints: syntheticMousePoints,
      deviceFingerprint: {
        fingerprintHash: sc === 'NORMAL_USER' ? 'fp_genuine_browser' : 'fp_headless_chrome_bot',
        userAgent: sc === 'NORMAL_USER' ? 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' : 'Mozilla/5.0 (HeadlessChrome)',
        screenResolution: sc === 'NORMAL_USER' ? '1920x1080' : '800x600',
        hardwareConcurrency: sc === 'NORMAL_USER' ? 8 : 1,
        timezoneOffset: 0,
      },
      timestamp: Date.now(),
    };

    if (this.socket && this.socket.connected) {
      this.socket.emit('telemetry_batch', payload);
    } else {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://aegis-backend-rm7s.onrender.com/api';
      fetch(`${backendUrl}/v1/biometrics/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: payload.sessionId,
          userId: payload.userId,
          is_baseline: false,
          keystrokes: payload.keystrokes,
          mousePoints: payload.mousePoints,
          deviceFingerprint: payload.deviceFingerprint,
          isSimulated: true,
          simulationType: sc,
        }),
      }).catch(() => {});
    }

    return payload;
  }

  /**
   * Convenience alias for simulateAttack('BOT_ATTACK').
   */
  public simulateBotAttackBatch(options?: {
    pointCount?: number;
    startX?: number;
    startY?: number;
  }) {
    return this.simulateAttack('BOT_ATTACK', options);
  }
}

export const globalTelemetryTracker = new TelemetryTracker();

