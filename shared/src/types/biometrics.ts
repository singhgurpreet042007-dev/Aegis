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
  dwellTime: number; // ms key down to key up
  flightTime: number; // ms previous key up to current key down
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

export interface IntruderSimulationRequest {
  sessionId: string;
  userId: string;
  scenario: SimulatorScenario;
  durationMs?: number;
}

// ═══════════════════════════════════════════════════════════
// Attack Surface Intelligence & Security Posture Types
// ═══════════════════════════════════════════════════════════

export interface TechStackItem {
  name: string;
  category: 'Framework' | 'Server' | 'CDN' | 'CMS' | 'Library' | 'Hosting';
  version?: string;
  confidence: number; // 0 - 100
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
  securityScore: number; // 0 - 100
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

export interface SecurityIncidentAuditEntry {
  id?: string;
  incidentId?: string;
  timestamp: string;
  action: string;
  actor: string;
  note: string;
}

export interface TrustedContext {
  id: string;
  domain: string;
  userId?: string;
  fingerprintHash: string;
  browser?: string;
  os?: string;
  ipAddress?: string;
  location?: string;
  isTrusted: boolean;
  verifiedAt: string;
  lastSeenAt: string;
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

export interface EventIngestionPayload {
  domain: string;
  targetUrl?: string;
  eventType: SecurityEventType;
  userEmail?: string;
  deviceInfo?: string;
  browser?: string;
  os?: string;
  ipAddress?: string;
  location?: string;
  details?: string;
  rawMetadata?: Record<string, any>;
}

export interface SecurityIncident {
  id: string;
  domain: string;
  targetUrl: string;
  eventType: SecurityEventType;
  severity: RiskLevel;
  riskScore: number; // 0 - 1
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

