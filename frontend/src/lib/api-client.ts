const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://aegis-backend-rm7s.onrender.com/api';

export interface ApiResponseError {
  error: true;
  status: number;
  code: string;
  message: string;
  details?: Record<string, any>;
}

export type ApiFetchOptions = RequestInit & {
  timeout?: number;
};

export async function fetchApi<T = any>(endpoint: string, options: ApiFetchOptions = {}): Promise<T | ApiResponseError | null> {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('aegis_token') : null;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    let fullEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    if (fullEndpoint.startsWith('/api')) {
      fullEndpoint = fullEndpoint.replace('/api', '');
    }
    if (!fullEndpoint.startsWith('/v1') && !fullEndpoint.startsWith('/auth')) {
      fullEndpoint = `/v1${fullEndpoint}`;
    }

    const url = `${API_BASE_URL}${fullEndpoint}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), (options as any)?.timeout || 6000);

    let res: Response;
    try {
      res = await fetch(url, {
        ...options,
        headers,
        signal: options.signal || controller.signal,
      });
    } catch (fetchErr: any) {
      clearTimeout(timeoutId);
      const isTimeout = fetchErr.name === 'AbortError';
      console.warn(`[Network ${isTimeout ? 'Timeout' : 'Error'}] Failed to fetch ${url}: ${fetchErr.message}`);
      return {
        error: true,
        status: isTimeout ? 408 : 0,
        code: isTimeout ? 'REQUEST_TIMEOUT' : 'NETWORK_ERROR',
        message: isTimeout ? 'Server response timed out. Waking up instance...' : 'Backend server unreachable',
      } as any;
    } finally {
      clearTimeout(timeoutId);
    }

    if (!res.ok) {
      let errorBody: any = null;
      try {
        errorBody = await res.json();
      } catch (_) {}

      const statusCode = res.status;
      const code = errorBody?.error?.code || (statusCode === 429 ? 'TOO_MANY_REQUESTS' : statusCode === 403 ? 'FORBIDDEN' : 'API_ERROR');
      const defaultMessage =
        statusCode === 429
          ? 'Rate limit exceeded (429). Please wait before retrying.'
          : statusCode === 403
          ? 'Access denied (403). Security Officer or Admin role required.'
          : `API Request failed [${statusCode}]`;

      const message = errorBody?.error?.message || defaultMessage;

      console.warn(`[API ${statusCode}] ${fullEndpoint}: ${message}`);

      return {
        error: true,
        status: statusCode,
        code,
        message,
        details: errorBody?.error?.details,
      };
    }

    const text = await res.text();
    if (!text || !text.trim()) {
      return {} as T;
    }
    try {
      return JSON.parse(text) as T;
    } catch {
      return { message: text } as T;
    }
  } catch (err: any) {
    console.error(`API error [${endpoint}]:`, err);
    return {
      error: true,
      status: 0,
      code: 'NETWORK_ERROR',
      message: err?.message || 'Network error communicating with Aegis AI backend',
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
//  Typed API Services Matching Backend Endpoints
// ═══════════════════════════════════════════════════════════════════════════

export const biometricsApi = {
  ingest: (payload: {
    sessionId: string;
    userId: string;
    keystrokes?: any[];
    mousePoints?: any[];
    deviceFingerprint?: any;
    is_baseline?: boolean;
    isSimulated?: boolean;
    simulationType?: string;
  }) => fetchApi('/v1/biometrics/ingest', { method: 'POST', body: JSON.stringify(payload) }),

  finalizeCalibration: (userId: string, sessionId: string) =>
    fetchApi('/v1/biometrics/calibrate/complete', { method: 'POST', body: JSON.stringify({ userId, sessionId }) }),

  getSessionStatus: (sessionId: string) =>
    fetchApi(`/v1/biometrics/session/${encodeURIComponent(sessionId)}`, { method: 'GET' }),

  getSessionMousePath: (sessionId: string) =>
    fetchApi(`/v1/biometrics/session/${encodeURIComponent(sessionId)}/mouse-path`, { method: 'GET' }),

  getAllSessions: () =>
    fetchApi('/v1/biometrics/sessions', { method: 'GET' }),

  getBaseline: (userId: string) =>
    fetchApi(`/v1/biometrics/baseline/${encodeURIComponent(userId)}`, { method: 'GET' }),

  // Compatibility helpers
  calibrate: (userId: string, sampleData: any) =>
    fetchApi('/v1/biometrics/calibrate', { method: 'POST', body: JSON.stringify({ userId, sampleData }) }),

  resetBaseline: (userId: string) =>
    fetchApi(`/v1/biometrics/baseline/${encodeURIComponent(userId)}`, { method: 'DELETE' }),

  getSessionTelemetry: (sessionId: string) =>
    fetchApi(`/v1/biometrics/session/${encodeURIComponent(sessionId)}/telemetry`, { method: 'GET' }),
};

export const riskApi = {
  getDashboardMetrics: () =>
    fetchApi('/v1/risk/dashboard-metrics', { method: 'GET' }),

  getActiveSessions: () =>
    fetchApi('/v1/risk/active-sessions', { method: 'GET' }),

  getThreatMap: () =>
    fetchApi('/v1/risk/threat-map', { method: 'GET' }),

  evaluate: (payload: {
    sessionId: string;
    userId: string;
    currentFeatures: Record<string, number>;
    baselineFeatures?: Record<string, number>;
    deviceTrusted?: boolean;
    isSimulated?: boolean;
    simulationType?: string;
  }) => fetchApi('/v1/risk/evaluate', { method: 'POST', body: JSON.stringify(payload) }),

  getHistory: (userId: string) =>
    fetchApi(`/v1/risk/history/${encodeURIComponent(userId)}`, { method: 'GET' }),

  getAssessment: (assessmentId: string) =>
    fetchApi(`/v1/risk/assessment/${encodeURIComponent(assessmentId)}`, { method: 'GET' }),
};

export const sentinelApi = {
  scanAndRegisterUrl: (url: string, userEmail?: string) =>
    fetchApi('/v1/sentinel/scan-url', { method: 'POST', body: JSON.stringify({ url, userEmail }) }),

  getPostureReport: (params?: { domain?: string; url?: string }) => {
    const q = new URLSearchParams();
    if (params?.domain) q.set('domain', params.domain);
    if (params?.url) q.set('url', params.url);
    const qs = q.toString() ? `?${q.toString()}` : '';
    return fetchApi(`/v1/sentinel/posture-report${qs}`, { method: 'GET' });
  },

  detectAndProcessEvent: (eventData: {
    domain: string;
    eventType: string;
    targetUrl?: string;
    userEmail?: string;
    deviceInfo?: string;
    browser?: string;
    os?: string;
    ipAddress?: string;
    location?: string;
    details?: string;
    rawMetadata?: Record<string, any>;
  }) => fetchApi('/v1/sentinel/detect-event', { method: 'POST', body: JSON.stringify(eventData) }),

  verifyLogin: (incidentId: string, action: 'VERIFIED' | 'COMPROMISED') =>
    fetchApi('/v1/sentinel/verify-login', { method: 'POST', body: JSON.stringify({ incidentId, action }) }),

  getIncidents: (domain?: string) => {
    const qs = domain ? `?domain=${encodeURIComponent(domain)}` : '';
    return fetchApi(`/v1/sentinel/incidents${qs}`, { method: 'GET' });
  },

  getIncidentById: (id: string) =>
    fetchApi(`/v1/sentinel/incidents/${encodeURIComponent(id)}`, { method: 'GET' }),

  handleIncidentAction: (id: string, action: 'VERIFIED' | 'COMPROMISED') =>
    fetchApi(`/v1/sentinel/incidents/${encodeURIComponent(id)}/action`, {
      method: 'POST',
      body: JSON.stringify({ action }),
    }),

  getTrustedContexts: (domain?: string) => {
    const qs = domain ? `?domain=${encodeURIComponent(domain)}` : '';
    return fetchApi(`/v1/sentinel/trusted-contexts${qs}`, { method: 'GET' });
  },

  revokeTrustedContext: (id: string) =>
    fetchApi(`/v1/sentinel/trusted-contexts/${encodeURIComponent(id)}`, { method: 'DELETE' }),

  disconnectDomain: (domain: string) =>
    fetchApi('/v1/sentinel/disconnect', { method: 'POST', body: JSON.stringify({ domain }) }),

  getAllMonitoredUrls: () =>
    fetchApi('/v1/sentinel/monitored-urls', { method: 'GET' }),

  toggleUrlStatus: (id: string) =>
    fetchApi(`/v1/sentinel/${encodeURIComponent(id)}/toggle`, { method: 'PATCH' }),

  pingUrlNow: (id: string) =>
    fetchApi(`/v1/sentinel/${encodeURIComponent(id)}/ping`, { method: 'POST' }),

  executeAction: (data: {
    sessionId: string;
    action: 'TERMINATE_SESSION' | 'LOCK_ACCOUNT' | 'STEP_UP_MFA' | 'DECOY_CONTAINMENT';
    reason?: string;
  }) => fetchApi('/v1/sentinel/action', { method: 'POST', body: JSON.stringify(data) }),

  getActions: (sessionId: string) =>
    fetchApi(`/v1/sentinel/actions/${encodeURIComponent(sessionId)}`, { method: 'GET' }),
};

export const intruderApi = {
  simulate: (sessionId: string, userId: string, scenario: string) =>
    fetchApi('/v1/intruder/simulate', {
      method: 'POST',
      body: JSON.stringify({ sessionId, userId, scenario }),
    }),

  getHistory: () => fetchApi('/v1/intruder/history', { method: 'GET' }),

  getScenarios: () => fetchApi('/v1/intruder/scenarios', { method: 'GET' }),
};

export const sessionReplayApi = {
  getReplay: (sessionId: string) =>
    fetchApi(`/v1/session-replay/${encodeURIComponent(sessionId)}`, { method: 'GET' }),

  exportReplay: (sessionId: string) =>
    fetchApi(`/v1/session-replay/${encodeURIComponent(sessionId)}/export`, { method: 'POST' }),
};

export const alertsApi = {
  getAlerts: (limit: number = 50) =>
    fetchApi(`/v1/alerts?limit=${limit}`, { method: 'GET' }),

  updateStatus: (alertId: string, status: string) =>
    fetchApi(`/v1/alerts/${encodeURIComponent(alertId)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  getThreatMapPoints: () =>
    fetchApi('/v1/alerts/threat-map', { method: 'GET' }),

  resolve: (alertId: string, notes?: string) =>
    fetchApi(`/v1/alerts/${encodeURIComponent(alertId)}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ resolutionNotes: notes }),
    }),

  getStats: () => fetchApi('/v1/alerts/stats', { method: 'GET' }),
};

export const authApi = {
  sendOtp: (email: string) =>
    fetchApi('/auth/send-otp', { method: 'POST', body: JSON.stringify({ email }) }),

  verifyOtp: (email: string, code: string) =>
    fetchApi('/auth/verify-otp', { method: 'POST', body: JSON.stringify({ email, code }) }),

  resetPassword: (dto: { email: string; otpCode: string; newPassword: string }) =>
    fetchApi('/auth/reset-password', { method: 'POST', body: JSON.stringify(dto) }),

  register: (userData: { email: string; name?: string; password?: string; organizationName?: string; otpCode?: string }) =>
    fetchApi('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),

  login: (credentials: { email: string; password?: string; otpCode?: string }) =>
    fetchApi('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),

  refresh: (refreshToken: string) =>
    fetchApi('/auth/refresh', { method: 'POST', body: JSON.stringify({ refreshToken }) }),

  logout: () =>
    fetchApi('/auth/logout', { method: 'POST' }),

  getMe: () =>
    fetchApi('/auth/me', { method: 'GET' }),

  challengeMfa: (sessionId: string) =>
    fetchApi('/auth/mfa/challenge', { method: 'POST', body: JSON.stringify({ sessionId }) }),

  verifyMfa: (sessionId: string, code: string) =>
    fetchApi('/auth/mfa/verify', { method: 'POST', body: JSON.stringify({ sessionId, code }) }),
};

export const billingApi = {
  claimTrial: (dto: { email: string; name?: string; organization?: string }) =>
    fetchApi('/api/billing/claim-trial', { method: 'POST', body: JSON.stringify(dto) }),

  checkout: (dto: { planId: string; email: string }) =>
    fetchApi('/api/billing/checkout', { method: 'POST', body: JSON.stringify(dto) }),

  verifyPayment: (dto: { paymentIntentId: string; sessionId?: string }) =>
    fetchApi('/api/billing/verify-payment', { method: 'POST', body: JSON.stringify(dto) }),

  getStatus: () =>
    fetchApi('/api/billing/status', { method: 'GET' }),
};
