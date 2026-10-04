export interface UpworkConnectionStatus {
  connected: boolean;
  accountName: string | null;
  role: string | null;
  status?: 'pending' | 'selection_required' | 'no_eligible_account' | 'reconnect_required' | string;
}

export interface UpworkConnectsData {
  available: number | null;
  membershipType: string | null;
}

export interface UpworkConnectsResponse {
  success: boolean;
  data?: UpworkConnectsData;
  code?: string;
  message?: string;
}

export interface UpworkPortfolioHighlight {
  title: string | null;
  description: string | null;
  url: string | null;
  completionDate: string | null;
}

export interface UpworkProfileSignals {
  jobSuccessScore: number | null;
  topRated: boolean | null;
}

export interface UpworkProfileData {
  title: string | null;
  overview: string | null;
  hourlyRate: string | null;
  skills: string[];
  portfolioHighlights: UpworkPortfolioHighlight[];
  connectsBalance: number | null;
  profileSignals: UpworkProfileSignals;
}

export interface UpworkProfileResponse {
  success: boolean;
  data?: UpworkProfileData;
  code?: string;
  message?: string;
}

export interface UpworkDisconnectResponse {
  success: boolean;
  message: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class UpworkApiService {
  private baseUrl = API_BASE_URL;

  private async getCsrfCookie(): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/sanctum/csrf-cookie`, {
        method: 'GET',
        credentials: 'include',
      });
    } catch {
      // Ignore network errors on csrf pre-fetch
    }
  }

  getOAuthConnectUrl(returnTo: string = typeof window !== 'undefined' ? window.location.origin : ''): string {
    const encodedReturn = encodeURIComponent(returnTo);
    return `${this.baseUrl}/oauth/upwork/connect?return_to=${encodedReturn}`;
  }

  async getStatus(): Promise<UpworkConnectionStatus> {
    try {
      const response = await fetch(`${this.baseUrl}/api/upwork/status`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        return {
          connected: false,
          accountName: null,
          role: null,
          status: response.status === 401 ? 'unauthenticated' : 'error',
        };
      }

      const data: UpworkConnectionStatus = await response.json();
      return data;
    } catch {
      return {
        connected: false,
        accountName: null,
        role: null,
        status: 'error',
      };
    }
  }

  async getConnects(): Promise<UpworkConnectsResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/upwork/connects`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          code: errorData.code || 'HTTP_ERROR',
          message: errorData.message || 'Failed to fetch Upwork connects balance.',
        };
      }

      const data: UpworkConnectsResponse = await response.json();
      return data;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Network error while fetching connects balance.';
      return {
        success: false,
        code: 'NETWORK_ERROR',
        message,
      };
    }
  }

  async getProfile(): Promise<UpworkProfileResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/upwork/profile`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          code: errorData.code || 'HTTP_ERROR',
          message: errorData.message || 'Failed to fetch Upwork profile data.',
        };
      }

      const data: UpworkProfileResponse = await response.json();
      return data;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Network error while fetching profile data.';
      return {
        success: false,
        code: 'NETWORK_ERROR',
        message,
      };
    }
  }

  async disconnect(): Promise<UpworkDisconnectResponse> {
    await this.getCsrfCookie();

    try {
      const response = await fetch(`${this.baseUrl}/api/upwork/disconnect`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          message: errorData.message || 'Failed to disconnect Upwork account.',
        };
      }

      const data: UpworkDisconnectResponse = await response.json();
      return data;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Network error during disconnect.';
      return {
        success: false,
        message,
      };
    }
  }
}

export const upworkApiService = new UpworkApiService();
