const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://aegis-backend-rm7s.onrender.com/api';

export interface ApiResponseError {
  error: true;
  status: number;
  code: string;
  message: string;
  details?: Record<string, any>;
}

export async function fetchApi<T = any>(endpoint: string, options: RequestInit = {}): Promise<T | ApiResponseError | null> {
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

    let res: Response;
    try {
      res = await fetch(url, {
        ...options,
        headers,
      });
    } catch (fetchErr: any) {
      console.warn(`[Network Error] Failed to fetch ${url}: ${fetchErr.message}`);
      return {
        error: true,
        status: 0,
        code: 'NETWORK_ERROR',
        message: 'Backend server unreachable',
      } as any;
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
