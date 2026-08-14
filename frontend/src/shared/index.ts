// ═══════════════════════════════════════════════════════════
// Aegis Shared Module — Standalone Frontend Export
// ═══════════════════════════════════════════════════════════

export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum AlertSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum AlertStatus {
  NEW = 'NEW',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  RESOLVED = 'RESOLVED',
  DISMISSED = 'DISMISSED',
}

export enum AdaptiveMfaState {
  NONE = 'NONE',
  CHALLENGED = 'CHALLENGED',
  VERIFIED = 'VERIFIED',
  SESSION_LOCKED = 'SESSION_LOCKED',
}

export enum SimulatorScenario {
  BOT_ATTACK = 'BOT_ATTACK',
  SESSION_HIJACK = 'SESSION_HIJACK',
  CREDENTIAL_STUFFING = 'CREDENTIAL_STUFFING',
  KEYSTROKE_ANOMALY = 'KEYSTROKE_ANOMALY',
  NORMAL_USER = 'NORMAL_USER',
}

export interface KeystrokeMetric {
  key: string;
  dwellTime: number;
  flightTime: number;
  timestamp: number;
}

export interface MouseTrajectoryPoint {
  x: number;
  y: number;
  timestamp: number;
  type: 'move' | 'click' | 'scroll';
}

export interface ComputedBiometricFeatures {
  keystrokeDwellMean: number;
  keystrokeDwellStd: number;
  keystrokeFlightMean: number;
  keystrokeFlightStd: number;
  mouseVelocityMean: number;
  mouseVelocityStd: number;
  mouseJerkMean: number;
  mouseCurvatureMean: number;
  mouseStraightnessIndex: number;
  sampleCount: number;
}

export interface DeviceFingerprintPayload {
  fingerprintHash: string;
  canvasHash?: string;
  webglRenderer?: string;
  screenResolution?: string;
  userAgent: string;
  timezoneOffset: number;
  hardwareConcurrency: number;
}

export interface BiometricTelemetryPayload {
  sessionId: string;
  userId: string;
  keystrokes: KeystrokeMetric[];
  mousePoints: MouseTrajectoryPoint[];
  deviceFingerprint: DeviceFingerprintPayload;
  timestamp: number;
}

export interface ExplainableFactor {
  feature: string;
  impact: 'NORMAL' | 'LOW_ANOMALY' | 'HIGH_ANOMALY' | 'CRITICAL_ANOMALY' | 'MATCH' | 'UNRECOGNIZED';
  score: number;
  description: string;
}

export interface RiskAssessmentResult {
  sessionId: string;
  userId: string;
  overallRiskScore: number;
  riskLevel: RiskLevel;
  anomalyScore: number;
  explainableFactors: ExplainableFactor[];
  adaptiveMfaRequired: boolean;
  mfaState: AdaptiveMfaState;
  evaluatedAt: string;
}

export interface ThreatMapPoint {
  id: string;
  country: string;
  countryCode: string;
  city?: string;
  lat: number;
  lng: number;
  attackType: string;
  severity: RiskLevel;
  ipAddress: string;
  timestamp: string;
}

export interface SessionReplayFrame {
  sequence: number;
  timestamp: number;
  x: number;
  y: number;
  type: 'move' | 'click' | 'scroll' | 'keydown';
  velocity?: number;
  dwellTime?: number;
  isAnomaly: boolean;
}

export interface SimulationResult {
  simulationId?: string;
  scenario?: string;
  scenarioExecuted?: string;
  riskScore: number;
  riskLevel: string;
  anomalyDetected: boolean;
  mfaChallenged: boolean;
  honeypotRedirected?: boolean;
  featuresFlagged?: string[];
  explanation?: string;
  explainableFactors?: Array<{
    feature: string;
    impact: string;
    score: number;
    description: string;
  }>;
  evaluatedAt?: string;
}

export interface TechStackItem {
  name: string;
  category: 'Framework' | 'Server' | 'CDN' | 'CMS' | 'Library' | 'Hosting';
  version?: string;
  confidence: number;
  evidence: string;
}

export interface SecurityHeaderCheck {
  header: string;
  present: boolean;
  value?: string;
  status: 'OPTIMAL' | 'WARNING' | 'CRITICAL_MISSING';
  recommendation: string;
}

export interface SslCertStatus {
  valid: boolean;
  issuer: string;
  protocol: string;
  validFrom: string;
  validTo: string;
  daysRemaining: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'F';
  issues: string[];
}

export interface DnsSecurityStatus {
  hasSpf: boolean;
  hasDmarc: boolean;
  spfRecord?: string;
  dmarcRecord?: string;
  recordsCount: number;
  records: { type: string; value: string }[];
  issues: string[];
}

export interface CookieAuditItem {
  name: string;
  secure: boolean;
  httpOnly: boolean;
  sameSite: 'Strict' | 'Lax' | 'None' | 'Missing';
  issues: string[];
}

export interface AttackSurfaceFinding {
  id: string;
  targetDomain: string;
  findingType: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFORMATIONAL';
  title: string;
  evidence: string;
  detectionTimestamp: string;
  lastSeenTimestamp: string;
  status: 'ACTIVE' | 'RESOLVED' | 'MUTED';
  recommendedRemediation: string;
  sourceModule: string;
}

export interface SecurityTimelineEvent {
  id: string;
  timestamp: string;
  type: 'TECH_CHANGED' | 'HEADER_CHANGED' | 'SSL_EXPIRING' | 'ENDPOINT_DISCOVERED' | 'VULNERABILITY_DETECTED' | 'DEFACEMENT_CHECK' | 'UPTIME_ALERT';
  title: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFORMATIONAL';
}

export interface SecurityPostureReport {
  targetUrl: string;
  domain: string;
  scanTimestamp: string;
  securityScore: number;
  securityGrade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  techStack: TechStackItem[];
  securityHeaders: SecurityHeaderCheck[];
  sslCertificate: SslCertStatus;
  dnsSecurity: DnsSecurityStatus;
  subdomains: string[];
  publicEndpoints: { path: string; status: number; type: string }[];
  exposedFiles: { path: string; status: number; risk: string }[];
  vulnerabilityIntel: { component: string; cveId: string; severity: string; summary: string }[];
  cookieAudit: CookieAuditItem[];
  authSurfaces: { path: string; hasMfaIndicator: boolean; isSecureHttps: boolean }[];
  integrityHash: string;
  uptimeMetrics: { status: 'ONLINE' | 'DEGRADED' | 'OFFLINE'; latencyMs: number; uptimePercentage: number };
  findings: AttackSurfaceFinding[];
  timeline: SecurityTimelineEvent[];
}

export type SecurityEventType =
  | 'SUSPICIOUS_LOGIN'
  | 'NEW_LOGIN_DETECTED'
  | 'UNRECOGNIZED_DEVICE'
  | 'AUTHENTICATION_ANOMALY'
  | 'UNEXPECTED_ADMIN_ACTIVITY'
  | 'WEBSITE_CONFIG_CHANGE'
  | 'CRITICAL_VULNERABILITY_DETECTED'
  | 'WEBSITE_INTEGRITY_CHANGE'
  | 'SECURITY_CONTROL_DISABLED'
  | 'MULTIPLE_UNUSUAL_EVENTS';

export type IncidentVerificationState =
  | 'PENDING'
  | 'VERIFIED_BY_OWNER'
  | 'MARKED_COMPROMISED'
  | 'RESOLVED';

export type UserVerificationAction = 'YES_ITS_ME' | 'NO_ITS_NOT_ME' | null;

export interface SecurityIncidentAuditEntry {
  id?: string;
  incidentId?: string;
  timestamp: string;
  action: string;
  actor: string;
  note: string;
}

export interface SecurityIncident {
  id: string;
  domain: string;
  targetUrl: string;
  eventType: SecurityEventType;
  severity: RiskLevel;
  riskScore: number;
  whySuspicious?: string;
  verificationState: IncidentVerificationState;
  userResponse?: UserVerificationAction;
  userRespondedAt?: string | null;
  deviceInfo: string;
  browser?: string;
  os?: string;
  ipAddress: string;
  location: string;
  timestamp: string;
  notificationSent: boolean;
  notificationType?: 'EMAIL' | 'IN_APP' | 'TIMELINE_ONLY';
  notifiedAt?: string | null;
  remediationSteps: string[];
  metadata?: Record<string, any>;
  auditTrail: SecurityIncidentAuditEntry[];
  createdAt?: string;
  updatedAt?: string;
}

// ── AegisTracker SDK Class ───────────────────────────────────

export class AegisTracker {
  private sessionId: string;
  private userId: string;
  private backendUrl: string;
  private isTracking = false;
  private keyDownMap: Map<string, number> = new Map();
  private lastKeyUpTime: number | null = null;
  private keystrokesBuffer: KeystrokeMetric[] = [];
  private mouseBuffer: MouseTrajectoryPoint[] = [];
  private flushIntervalTimer: any = null;
  private onRiskUpdateCallback?: (riskData: any) => void;

  constructor(config: {
    sessionId: string;
    userId: string;
    backendUrl?: string;
    onRiskUpdate?: (riskData: any) => void;
  }) {
    this.sessionId = config.sessionId;
    this.userId = config.userId;
    this.backendUrl = (config.backendUrl || 'https://aegis-backend-rm7s.onrender.com').replace(/\/+$/, '');
    this.onRiskUpdateCallback = config.onRiskUpdate;
  }

  public start(): void {
    if (this.isTracking || typeof window === 'undefined') return;
    this.isTracking = true;
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('click', this.handleClick);
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
    return {
      fingerprintHash: `fp_aegis_${Math.abs(cores * 31 + tz).toString(16)}`,
      screenResolution: screenRes,
      userAgent: ua,
      timezoneOffset: tz,
      hardwareConcurrency: cores,
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
    this.keystrokesBuffer = [];
    this.mouseBuffer = [];
    try {
      const baseUrl = this.backendUrl.endsWith('/api') ? this.backendUrl : `${this.backendUrl}/api`;
      const res = await fetch(`${baseUrl}/v1/biometrics/ingest`, {
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
    } catch (_) {}
  }
}
