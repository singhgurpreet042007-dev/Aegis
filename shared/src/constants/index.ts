// ═══════════════════════════════════════════════════════════
// Shared Constants — System-wide values
// ═══════════════════════════════════════════════════════════

// ── API Routes ──────────────────────────────────────────────

export const API_ROUTES = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    REFRESH: '/api/auth/refresh',
    LOGOUT: '/api/auth/logout',
    ME: '/api/auth/me',
    GOOGLE: '/api/auth/google',
    GITHUB: '/api/auth/github',
    MFA_SETUP: '/api/auth/mfa/setup',
    MFA_VERIFY: '/api/auth/mfa/verify',
  },
  USERS: {
    PROFILE: '/api/users/profile',
    UPDATE: '/api/users/update',
    AVATAR: '/api/users/avatar',
  },
  WORKSPACES: {
    LIST: '/api/workspaces',
    CREATE: '/api/workspaces',
    GET: (id: string) => `/api/workspaces/${id}`,
    UPDATE: (id: string) => `/api/workspaces/${id}`,
    MEMBERS: (id: string) => `/api/workspaces/${id}/members`,
    INVITE: (id: string) => `/api/workspaces/${id}/invite`,
  },
  CONVERSATIONS: {
    LIST: '/api/conversations',
    CREATE: '/api/conversations',
    GET: (id: string) => `/api/conversations/${id}`,
    DELETE: (id: string) => `/api/conversations/${id}`,
    MESSAGES: (id: string) => `/api/conversations/${id}/messages`,
  },
  CHAT: {
    SEND: '/api/chat/send',
    STREAM: '/api/chat/stream',
  },
  DOCUMENTS: {
    UPLOAD: '/api/documents/upload',
    LIST: '/api/documents',
    DELETE: (id: string) => `/api/documents/${id}`,
    SEARCH: '/api/documents/search',
  },
  BILLING: {
    PLANS: '/api/billing/plans',
    SUBSCRIBE: '/api/billing/subscribe',
    PORTAL: '/api/billing/portal',
    USAGE: '/api/billing/usage',
    CREDITS: '/api/billing/credits',
  },
  ADMIN: {
    USERS: '/api/admin/users',
    ORGANIZATIONS: '/api/admin/organizations',
    METRICS: '/api/admin/metrics',
    FEATURE_FLAGS: '/api/admin/feature-flags',
  },
} as const;

// ── AI Model Definitions ────────────────────────────────────

export const AI_MODELS = {
  OPENAI: {
    'gpt-4o': { maxTokens: 128_000, costPer1kInput: 0.0025, costPer1kOutput: 0.01 },
    'gpt-4o-mini': { maxTokens: 128_000, costPer1kInput: 0.00015, costPer1kOutput: 0.0006 },
    'o1': { maxTokens: 200_000, costPer1kInput: 0.015, costPer1kOutput: 0.06 },
  },
  ANTHROPIC: {
    'claude-sonnet-4-20250514': { maxTokens: 200_000, costPer1kInput: 0.003, costPer1kOutput: 0.015 },
    'claude-3-5-haiku-20241022': { maxTokens: 200_000, costPer1kInput: 0.0008, costPer1kOutput: 0.004 },
  },
  GEMINI: {
    'gemini-2.5-pro': { maxTokens: 1_000_000, costPer1kInput: 0.00125, costPer1kOutput: 0.01 },
    'gemini-2.5-flash': { maxTokens: 1_000_000, costPer1kInput: 0.00015, costPer1kOutput: 0.0006 },
  },
  DEEPSEEK: {
    'deepseek-chat': { maxTokens: 64_000, costPer1kInput: 0.00014, costPer1kOutput: 0.00028 },
    'deepseek-reasoner': { maxTokens: 64_000, costPer1kInput: 0.00055, costPer1kOutput: 0.00219 },
  },
} as const;

// ── Tier Limits ─────────────────────────────────────────────

export const TIER_LIMITS = {
  STARTER: {
    monthlyCredits: 1_000,
    maxWorkspaces: 1,
    maxMembers: 1,
    maxDocuments: 10,
    maxDocumentSizeMb: 10,
    rateLimit: 20, // requests per minute
  },
  PRO: {
    monthlyCredits: 10_000,
    maxWorkspaces: 5,
    maxMembers: 1,
    maxDocuments: 100,
    maxDocumentSizeMb: 50,
    rateLimit: 60,
  },
  TEAM: {
    monthlyCredits: 50_000,
    maxWorkspaces: 20,
    maxMembers: 25,
    maxDocuments: 500,
    maxDocumentSizeMb: 100,
    rateLimit: 200,
  },
  ENTERPRISE: {
    monthlyCredits: -1, // unlimited
    maxWorkspaces: -1,
    maxMembers: -1,
    maxDocuments: -1,
    maxDocumentSizeMb: 500,
    rateLimit: 1000,
  },
} as const;

// ── Misc Constants ──────────────────────────────────────────

export const MAX_CONVERSATION_TITLE_LENGTH = 500;
export const DEFAULT_PAGINATION_LIMIT = 20;
export const MAX_PAGINATION_LIMIT = 100;
export const CHUNK_SIZE_TOKENS = 512;
export const CHUNK_OVERLAP_TOKENS = 50;
export const EMBEDDING_DIMENSIONS = 1536;
export const JWT_ACCESS_EXPIRATION = '15m';
export const JWT_REFRESH_EXPIRATION = '7d';
