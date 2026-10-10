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

export class AuthApiService {
  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await apiFetch<{ success: boolean; user?: AuthUser; message?: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (res.ok && res.data?.success && res.data.user) {
      return {
        success: true,
        user: res.data.user,
      };
    }

    return {
      success: false,
      error: res.data?.message || res.error || 'Invalid credentials or request error.',
    };
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    const res = await apiFetch<{ user?: AuthUser }>('/api/auth/me', {
      method: 'GET',
      requireCsrf: false,
    });

    if (res.ok && res.data?.user) {
      return res.data.user;
    }

    return null;
  }

  async logout(): Promise<AuthResponse> {
    const res = await apiFetch<AuthResponse>('/api/auth/logout', {
      method: 'POST',
    });

    if (res.ok) {
      return { success: true };
    }

    // 401 means session is already expired/unauthenticated -> effectively logged out
    if (res.status === 401) {
      return { success: true };
    }

    return {
      success: false,
      error: 'Sign out failed due to network or server error. Please try again.',
    };
  }
}

export const authApiService = new AuthApiService();
