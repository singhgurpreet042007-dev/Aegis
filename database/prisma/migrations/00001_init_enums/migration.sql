-- ═══════════════════════════════════════════════════════════
-- Aegis AI — Initial Migration: Create Enums
-- Run against PostgreSQL 16+ with Supabase
-- ═══════════════════════════════════════════════════════════

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Identity & Access Enums
CREATE TYPE user_status_enum AS ENUM ('PENDING_VERIFICATION', 'ACTIVE', 'SUSPENDED', 'DELETED');
CREATE TYPE mfa_type_enum AS ENUM ('NONE', 'TOTP', 'WEBAUTHN');
CREATE TYPE org_tier_enum AS ENUM ('STARTER', 'PRO', 'TEAM', 'ENTERPRISE');
CREATE TYPE member_role_enum AS ENUM ('OWNER', 'ADMIN', 'MEMBER', 'BILLING_MANAGER', 'GUEST');

-- AI System Enums
CREATE TYPE ai_provider_enum AS ENUM ('OPENAI', 'ANTHROPIC', 'GEMINI', 'GROK', 'DEEPSEEK', 'MISTRAL', 'OPENROUTER');
CREATE TYPE message_role_enum AS ENUM ('SYSTEM', 'USER', 'ASSISTANT', 'TOOL');

-- Financial & Billing Enums
CREATE TYPE subscription_status_enum AS ENUM ('INCOMPLETE', 'ACTIVE', 'PAST_DUE', 'CANCELED', 'UNCOLLECTIBLE');
CREATE TYPE transaction_type_enum AS ENUM ('SUBSCRIPTION_GRANT', 'TOPUP_PURCHASE', 'USAGE_DEDUCTION', 'ADMIN_REFUND');
