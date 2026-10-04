export interface AuthUser {
  id: number;
  name: string;
  email: string;
}

export interface AuthResponse {
  user: AuthUser;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class AuthApiService {
  private baseUrl = API_BASE_URL;

  private async getCsrfCookie(): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/sanctum/csrf-cookie`, {
        method: 'GET',
        credentials: 'include',
      });
    } catch {
      // Ignore network errors on csrf pre-fetch; actual login request will handle failure if needed
    }
  }

  async login(email: string, password: string): Promise<AuthUser> {
    await this.getCsrfCookie();

    const response = await fetch(`${this.baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      let errorMsg = 'Invalid email or password credentials.';
      try {
        const errorData = await response.json();
        if (errorData.errors?.email?.[0]) {
          errorMsg = errorData.errors.email[0];
        } else if (errorData.message) {
          errorMsg = errorData.message;
        }
      } catch {
        // Fallback error message
      }
      throw new Error(errorMsg);
    }

    const data: AuthResponse = await response.json();
    return data.user;
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        return null;
      }

      const data: AuthResponse = await response.json();
      return data.user;
    } catch {
      return null;
    }
  }

  async logout(): Promise<void> {
    await this.getCsrfCookie();

    try {
      await fetch(`${this.baseUrl}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        credentials: 'include',
      });
    } catch {
      // Session local clear proceeds regardless
    }
  }
}

export const authApiService = new AuthApiService();
