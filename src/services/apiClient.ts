function getXsrfToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]*)/);
  if (!match) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

export async function ensureCsrfCookie(): Promise<boolean> {
  try {
    const res = await fetch('/sanctum/csrf-cookie', {
      method: 'GET',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
      },
    });
    return res.ok;
  } catch {
    return false;
  }
}

export interface ApiFetchOptions extends RequestInit {
  requireCsrf?: boolean;
}

export async function apiFetch<T = any>(
  url: string,
  options: ApiFetchOptions = {}
): Promise<{ ok: boolean; status: number; data: T | null; error?: string }> {
  const method = (options.method || 'GET').toUpperCase();
  const isStateChanging = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
  const requireCsrf = options.requireCsrf ?? isStateChanging;

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (options.body && typeof options.body === 'string') {
    headers['Content-Type'] = 'application/json';
  }

  if (requireCsrf) {
    let token = getXsrfToken();
    if (!token) {
      const csrfSuccess = await ensureCsrfCookie();
      if (!csrfSuccess) {
        return {
          ok: false,
          status: 0,
          data: null,
          error: 'CSRF initialization failed.',
        };
      }
      token = getXsrfToken();
    }

    if (!token) {
      return {
        ok: false,
        status: 0,
        data: null,
        error: 'XSRF-TOKEN cookie not found.',
      };
    }

    headers['X-XSRF-TOKEN'] = token;
  }

  try {
    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    let data: T | null = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    }

    return {
      ok: response.ok,
      status: response.status,
      data,
      error: response.ok ? undefined : (data as any)?.message || `HTTP ${response.status}`,
    };
  } catch (e: any) {
    return {
      ok: false,
      status: 0,
      data: null,
      error: e?.message || 'Network error occurred.',
    };
  }
}
