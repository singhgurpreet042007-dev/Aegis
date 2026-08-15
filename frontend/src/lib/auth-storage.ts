'use client';

export interface LocalAccount {
  id: string;
  email: string;
  fullName: string;
  passwordHash?: string;
  plainPassword?: string;
  role?: string;
  createdAt: string;
}

const LOCAL_ACCOUNTS_KEY = 'aegis_registered_accounts';

/**
 * Retrieves all locally registered accounts from browser storage
 */
export function getLocalAccounts(): LocalAccount[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_ACCOUNTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Saves or updates a registered user account locally
 */
export function saveLocalAccount(account: {
  email: string;
  fullName: string;
  password?: string;
  role?: string;
}): LocalAccount {
  const accounts = getLocalAccounts();
  const emailKey = account.email.toLowerCase().trim();
  const existingIdx = accounts.findIndex((a) => a.email.toLowerCase().trim() === emailKey);

  const localAcc: LocalAccount = {
    id: existingIdx >= 0 ? accounts[existingIdx].id : `usr_local_${Date.now()}`,
    email: emailKey,
    fullName: account.fullName || 'Security Officer',
    plainPassword: account.password,
    role: account.role || 'SecOps Lead',
    createdAt: existingIdx >= 0 ? accounts[existingIdx].createdAt : new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    accounts[existingIdx] = { ...accounts[existingIdx], ...localAcc };
  } else {
    accounts.push(localAcc);
  }

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(accounts));
    } catch {}
  }

  return localAcc;
}

/**
 * Finds a locally registered account by email
 */
export function findLocalAccount(email: string): LocalAccount | null {
  const emailKey = email.toLowerCase().trim();
  const accounts = getLocalAccounts();
  return accounts.find((a) => a.email.toLowerCase().trim() === emailKey) || null;
}

/**
 * Validates credentials against locally registered accounts
 */
export function verifyLocalCredentials(email: string, password: string): { success: boolean; user?: LocalAccount; error?: string } {
  const emailKey = email.toLowerCase().trim();
  const user = findLocalAccount(emailKey);

  // If user registered in this browser
  if (user) {
    if (user.plainPassword && user.plainPassword !== password) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }
    return { success: true, user };
  }

  // Fallback demo/superuser check
  if (emailKey === 'officer@aegis.ai' || emailKey === 'admin@aegisai.io' || emailKey === 'demo@aegis.ai') {
    return {
      success: true,
      user: {
        id: 'usr_demo_officer',
        email: emailKey,
        fullName: 'Security Officer',
        role: 'SecOps Lead',
        createdAt: new Date().toISOString(),
      },
    };
  }

  return { success: false, error: 'Account not found. Please sign up first.' };
}
