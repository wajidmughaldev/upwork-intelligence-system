import { apiFetch } from './apiClient';

export interface UpworkConnectionStatus {
  connected: boolean;
  accountName: string | null;
  role: string | null;
  status: 'connected' | 'selection_required' | 'no_eligible_account' | 'pending' | 'reconnect_required' | 'disconnected';
  unauthenticated?: boolean;
}

export interface UpworkProfileData {
  title: string | null;
  overview: string | null;
  hourlyRate: string | null;
  skills: string[];
  portfolioHighlights: Array<{
    id: string;
    title: string;
    description: string;
    outcome?: string;
  }>;
  profileSignals: {
    jobSuccessScore: number | null;
    topRated: boolean | null;
    connectsBalance: number | null;
  };
}

export interface UpworkConnectsData {
  available: number | null;
  membershipType: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  code?: string;
  message?: string;
  unauthenticated?: boolean;
}

export class UpworkApiService {
  async getStatus(): Promise<UpworkConnectionStatus & { unauthenticated?: boolean }> {
    const res = await apiFetch<UpworkConnectionStatus>('/api/upwork/status', {
      method: 'GET',
      requireCsrf: false,
    });

    if (res.status === 401) {
      return {
        connected: false,
        accountName: null,
        role: null,
        status: 'disconnected',
        unauthenticated: true,
      };
    }

    if (res.ok && res.data) {
      return res.data;
    }

    return {
      connected: false,
      accountName: null,
      role: null,
      status: 'disconnected',
    };
  }

  async getProfile(): Promise<ApiResponse<UpworkProfileData>> {
    const res = await apiFetch<ApiResponse<UpworkProfileData>>('/api/upwork/profile', {
      method: 'GET',
      requireCsrf: false,
    });

    if (res.status === 401) {
      return {
        success: false,
        message: 'Unauthenticated session.',
        unauthenticated: true,
      };
    }

    if (res.ok && res.data?.success) {
      return res.data;
    }

    return {
      success: false,
      message: res.data?.message || res.error || 'Failed to fetch profile.',
    };
  }

  async getConnects(): Promise<ApiResponse<UpworkConnectsData>> {
    const res = await apiFetch<ApiResponse<UpworkConnectsData>>('/api/upwork/connects', {
      method: 'GET',
      requireCsrf: false,
    });

    if (res.status === 401) {
      return {
        success: false,
        message: 'Unauthenticated session.',
        unauthenticated: true,
      };
    }

    if (res.ok && res.data?.success) {
      return res.data;
    }

    return {
      success: false,
      message: res.data?.message || res.error || 'Failed to fetch connects.',
    };
  }

  async disconnect(): Promise<{ success: boolean; connected?: boolean; message?: string; unauthenticated?: boolean }> {
    const res = await apiFetch<{ success: boolean; connected: boolean; message?: string }>('/api/upwork/disconnect', {
      method: 'POST',
    });

    if (res.status === 401) {
      return {
        success: false,
        message: 'Unauthenticated session.',
        unauthenticated: true,
      };
    }

    if (res.ok && res.data?.success === true) {
      return {
        success: true,
        connected: false,
        message: res.data.message || 'Upwork account disconnected successfully.',
      };
    }

    return {
      success: false,
      message: res.data?.message || res.error || 'Failed to disconnect Upwork account.',
    };
  }

  getOAuthConnectUrl(): string {
    if (typeof window === 'undefined') return '/oauth/upwork/connect';
    const returnTo = encodeURIComponent(window.location.origin + window.location.pathname);
    return `/oauth/upwork/connect?return_to=${returnTo}`;
  }
}

export const upworkApiService = new UpworkApiService();
