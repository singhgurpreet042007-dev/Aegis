import { io, Socket } from 'socket.io-client';

export interface TelemetryMousePoint {
  x: number;
  y: number;
  t: number;
  speed?: number;
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
   * Programmatically dispatches synthetic robotic mouse and key events
   * through the exact same WebSocket pipeline (Feature 3).
   */
  public simulateBotAttackBatch(options?: {
    pointCount?: number;
    startX?: number;
    startY?: number;
  }) {
    const count = options?.pointCount || 40;
    let currX = options?.startX || 100;
    let currY = options?.startY || 100;
    const now = Date.now();

    const syntheticMousePoints: TelemetryMousePoint[] = [];
    const syntheticKeystrokes: TelemetryKeystroke[] = [];

    // Synthetic mouse: perfectly straight diagonal line at exact 16ms intervals (62.5 fps bot)
    for (let i = 0; i < count; i++) {
      currX += 15; // fixed step
      currY += 15; // fixed step (slope = 1.0, straightness = 1.0)
      const t = now + i * 16;
      syntheticMousePoints.push({
        x: Math.round(currX),
        y: Math.round(currY),
        t,
        speed: 1326, // constant fixed speed
      });
    }

    // Synthetic keypresses: constant 10ms dwell time, constant 20ms flight time (zero jitter)
    const keys = ['KeyA', 'KeyD', 'KeyM', 'KeyI', 'KeyN', 'Enter'];
    keys.forEach((k, i) => {
      syntheticKeystrokes.push({
        key: k,
        dwellTime: 10.0, // exact 10ms (bot fill)
        flightTime: 20.0, // exact 20ms
        timestamp: now + i * 30,
      });
    });

    const payload: TelemetryBatchPayload = {
      sessionId: this.sessionId || 'sess_bot_sim',
      userId: this.userId || 'usr_bot_sim',
      is_baseline: false,
      keystrokes: syntheticKeystrokes,
      mousePoints: syntheticMousePoints,
      deviceFingerprint: {
        fingerprintHash: 'fp_headless_chrome_bot',
        userAgent: 'Mozilla/5.0 (HeadlessChrome; Linux x86_64)',
        screenResolution: '800x600',
        hardwareConcurrency: 1,
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
          simulationType: 'BOT_ATTACK',
        }),
      }).catch(() => {});
    }

    return payload;
  }
}

export const globalTelemetryTracker = new TelemetryTracker();
