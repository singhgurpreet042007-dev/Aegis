// ═══════════════════════════════════════════════════════════
// Shared TypeScript Interfaces & Types
// ═══════════════════════════════════════════════════════════

import {
  AiProvider,
  MemberRole,
  MessageRole,
  MfaType,
  OrgTier,
  StreamEventType,
  UserStatus,
} from '../enums';

// ── User & Auth ─────────────────────────────────────────────

export interface IUser {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  status: UserStatus;
  mfaType: MfaType;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface ILoginRequest {
  email: string;
  password: string;
  mfaCode?: string;
}

export interface IRegisterRequest {
  email: string;
  password: string;
  fullName: string;
}

// ── Organization & Workspace ────────────────────────────────

export interface IOrganization {
  id: string;
  name: string;
  slug: string;
  tier: OrgTier;
  stripeCustomerId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IWorkspace {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  creditBalance: number;
  createdAt: string;
  updatedAt: string;
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

export * from './biometrics';
