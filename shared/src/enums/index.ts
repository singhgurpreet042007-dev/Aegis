// ═══════════════════════════════════════════════════════════
// Shared Enums — Used across Frontend, Backend, AI, Workers
// ═══════════════════════════════════════════════════════════

export enum UserStatus {
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  DELETED = 'DELETED',
}

export enum MfaType {
  NONE = 'NONE',
  TOTP = 'TOTP',
  WEBAUTHN = 'WEBAUTHN',
}

export enum OrgTier {
  STARTER = 'STARTER',
  PRO = 'PRO',
  TEAM = 'TEAM',
  ENTERPRISE = 'ENTERPRISE',
}

export enum MemberRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
  BILLING_MANAGER = 'BILLING_MANAGER',
  GUEST = 'GUEST',
}

export enum AiProvider {
  OPENAI = 'OPENAI',
  ANTHROPIC = 'ANTHROPIC',
  GEMINI = 'GEMINI',
  GROK = 'GROK',
  DEEPSEEK = 'DEEPSEEK',
  MISTRAL = 'MISTRAL',
  OPENROUTER = 'OPENROUTER',
}

export enum MessageRole {
  SYSTEM = 'SYSTEM',
  USER = 'USER',
  ASSISTANT = 'ASSISTANT',
  TOOL = 'TOOL',
}

export enum SubscriptionStatus {
  INCOMPLETE = 'INCOMPLETE',
  ACTIVE = 'ACTIVE',
  PAST_DUE = 'PAST_DUE',
  CANCELED = 'CANCELED',
  UNCOLLECTIBLE = 'UNCOLLECTIBLE',
}

export enum TransactionType {
  SUBSCRIPTION_GRANT = 'SUBSCRIPTION_GRANT',
  TOPUP_PURCHASE = 'TOPUP_PURCHASE',
  USAGE_DEDUCTION = 'USAGE_DEDUCTION',
  ADMIN_REFUND = 'ADMIN_REFUND',
}

export enum ChunkEmbeddingModel {
  TEXT_EMBEDDING_3_SMALL = 'TEXT_EMBEDDING_3_SMALL',
  TEXT_EMBEDDING_3_LARGE = 'TEXT_EMBEDDING_3_LARGE',
  COHERE_V3 = 'COHERE_V3',
}

export enum StreamEventType {
  TOKEN_DELTA = 'TOKEN_DELTA',
  TOOL_CALL_START = 'TOOL_CALL_START',
  TOOL_CALL_OUTPUT = 'TOOL_CALL_OUTPUT',
  CITATIONS = 'CITATIONS',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
}
