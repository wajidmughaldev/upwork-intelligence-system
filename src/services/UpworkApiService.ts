import { apiFetch } from './apiClient';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '');

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
    title: string | null;
    description: string | null;
    url: string | null;
    completionDate: string | null;
  }>;
  connectsBalance: number | null;
  profileSignals: {
    jobSuccessScore: number | null;
    topRated: boolean | null;
  };
}

export interface UpworkConnectsData {
  available: number | null;
  membershipType: string | null;
}

export interface UpworkJobSummary {
  reference: string | null;
  title: string | null;
  descriptionSnippet: string | null;
  jobType: 'fixed' | 'hourly' | null;
  budget: string | null;
  hourlyRate: string | null;
  skills: string[];
  experienceLevel: string | null;
  postedTime: string | null;
  connectsRequired: number | null;
  client: {
    paymentVerified: boolean | null;
    rating: number | null;
    totalSpent: string | null;
    location: string | null;
  };
}

export interface UpworkJobSearchData {
  jobs: UpworkJobSummary[];
  totalCount: number;
  hasMore: boolean;
}

export interface UpworkJobDetail {
  reference: string | null;
  title: string | null;
  description: string | null;
  jobType: 'fixed' | 'hourly' | null;
  budget: string | null;
  hourlyRate: string | null;
  skills: string[];
  experienceLevel: string | null;
  connectsRequired: number | null;
  client: {
    paymentVerified: boolean | null;
    rating: number | null;
    totalSpent: string | null;
    hireRate: string | null;
    location: string | null;
  };
  screeningQuestions: string[];
}

export interface UpworkSearchParams {
  query?: string;
  skills?: string[];
  category?: string;
  job_type?: 'fixed' | 'hourly';
  budget_min?: number;
  budget_max?: number;
  rate_min?: number;
  rate_max?: number;
  limit?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  code?: string;
  message?: string;
  unauthenticated?: boolean;
}

export class UpworkApiService {
  private jobError<T>(res: { status: number; data: ApiResponse<T> | null; error?: string }, fallback: string): ApiResponse<T> {
    if (res.data?.code) {
      return {
        success: false,
        code: res.data.code,
        message: res.data.message || fallback,
      };
    }

    if (res.status === 401) {
      return {
        success: false,
        message: 'Unauthenticated session.',
        unauthenticated: true,
      };
    }

    return {
      success: false,
      message: res.data?.message || res.error || fallback,
    };
  }

  async getStatus(): Promise<ApiResponse<UpworkConnectionStatus>> {
    const res = await apiFetch<UpworkConnectionStatus>('/api/upwork/status', {
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

    if (res.ok && res.data) {
      return {
        success: true,
        data: res.data,
      };
    }

    return {
      success: false,
      message: res.error || 'Failed to fetch Upwork connection status.',
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

  async getRecommendedJobs(limit = 10): Promise<ApiResponse<UpworkJobSearchData>> {
    const params = new URLSearchParams({ limit: String(Math.min(10, Math.max(1, limit))) });
    const res = await apiFetch<ApiResponse<UpworkJobSearchData>>(`/api/upwork/jobs/recommended?${params.toString()}`, {
      method: 'GET',
      requireCsrf: false,
    });

    if (res.ok && res.data?.success) return res.data;
    return this.jobError(res, 'Failed to fetch recommended Upwork jobs.');
  }

  async searchJobs(filters: UpworkSearchParams): Promise<ApiResponse<UpworkJobSearchData>> {
    const params = new URLSearchParams();
    if (filters.query) params.set('query', filters.query);
    if (filters.category) params.set('category', filters.category);
    if (filters.job_type) params.set('job_type', filters.job_type);
    if (filters.budget_min !== undefined) params.set('budget_min', String(filters.budget_min));
    if (filters.budget_max !== undefined) params.set('budget_max', String(filters.budget_max));
    if (filters.rate_min !== undefined) params.set('rate_min', String(filters.rate_min));
    if (filters.rate_max !== undefined) params.set('rate_max', String(filters.rate_max));
    if (filters.limit !== undefined) params.set('limit', String(Math.min(10, Math.max(1, filters.limit))));
    filters.skills?.slice(0, 5).forEach((skill) => params.append('skills[]', skill));

    const res = await apiFetch<ApiResponse<UpworkJobSearchData>>(`/api/upwork/jobs/search?${params.toString()}`, {
      method: 'GET',
      requireCsrf: false,
    });

    if (res.ok && res.data?.success) return res.data;
    return this.jobError(res, 'Failed to search Upwork jobs.');
  }

  async getJobDetail(reference: string): Promise<ApiResponse<UpworkJobDetail>> {
    const res = await apiFetch<ApiResponse<UpworkJobDetail>>(`/api/upwork/jobs/${encodeURIComponent(reference)}`, {
      method: 'GET',
      requireCsrf: false,
    });

    if (res.ok && res.data?.success) return res.data;
    return this.jobError(res, 'Failed to fetch Upwork job detail.');
  }

  getOAuthConnectUrl(): string {
    if (typeof window === 'undefined') return `${API_BASE_URL}/oauth/upwork/connect`;
    const returnTo = encodeURIComponent(window.location.origin + window.location.pathname);
    return `${API_BASE_URL}/oauth/upwork/connect?return_to=${returnTo}`;
  }
}

export const upworkApiService = new UpworkApiService();
