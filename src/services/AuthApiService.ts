import { apiFetch } from './apiClient';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
}

export interface AuthResponse {
  success: boolean;
  user?: AuthUser;
  error?: string;
}

const DEMO_USER: AuthUser = {
  id: 1,
  name: 'Wajid Mughal (Demo)',
  email: 'demo@example.com',
};

const DEMO_STORAGE_KEY = 'oi_demo_auth_user';

export class AuthApiService {
  async login(email: string, password: string): Promise<AuthResponse> {
    // If demo credentials or preview mode requested
    if (email.trim().toLowerCase() === 'demo@example.com' || email.trim().toLowerCase() === 'demo') {
      return this.loginAsDemo();
    }

    try {
      const res = await apiFetch<{ success: boolean; user?: AuthUser; message?: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        timeoutMs: 3000,
      });

      if (res.ok && res.data?.success && res.data.user) {
        if (typeof window !== 'undefined') {
          try {
            sessionStorage.removeItem(DEMO_STORAGE_KEY);
          } catch {}
        }
        return {
          success: true,
          user: res.data.user,
        };
      }

      // If backend is unreachable in preview environment
      if (res.status === 0 || res.status === 404) {
        return {
          success: false,
          error: 'Laravel backend is offline. Click "Sign in with Demo Account" to preview.',
        };
      }

      return {
        success: false,
        error: res.data?.message || res.error || 'Invalid credentials or request error.',
      };
    } catch {
      return {
        success: false,
        error: 'Unable to connect to auth server. Try Demo mode.',
      };
    }
  }

  async loginAsDemo(): Promise<AuthResponse> {
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(DEMO_USER));
      } catch {}
    }
    return {
      success: true,
      user: DEMO_USER,
    };
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    // 1. Instantly check sessionStorage for active demo session
    if (typeof window !== 'undefined') {
      try {
        const stored = sessionStorage.getItem(DEMO_STORAGE_KEY);
        if (stored) {
          return JSON.parse(stored);
        }
      } catch {}
    }

    // 2. Otherwise check backend session with short 1500ms timeout
    try {
      const res = await apiFetch<{ user?: AuthUser }>('/api/auth/me', {
        method: 'GET',
        requireCsrf: false,
        timeoutMs: 1500,
      });

      if (res.ok && res.data?.user) {
        return res.data.user;
      }
    } catch {
      // Backend not running or unreachable
    }

    return null;
  }

  async logout(): Promise<AuthResponse> {
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem(DEMO_STORAGE_KEY);
      } catch {}
    }

    try {
      const res = await apiFetch<AuthResponse>('/api/auth/logout', {
        method: 'POST',
        timeoutMs: 2000,
      });

      if (res.ok || res.status === 401 || res.status === 0 || res.status === 404) {
        return { success: true };
      }
    } catch {}

    return { success: true };
  }
}

export const authApiService = new AuthApiService();
