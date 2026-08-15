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
