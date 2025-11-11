import apiClient from './apiClient';

export interface DashboardStats {
  customers: {
    total: number;
    totalPremium: number;
  };
  policies: Array<{
    policy_type: string;
    count: number;
    premium: number;
  }>;
  leads: Array<{
    status: string;
    count: number;
  }>;
  campaigns: {
    totalImpressions: number;
    totalClicks: number;
    totalConversions: number;
    totalSpend: number;
  };
}

export interface RevenueData {
  month: string;
  revenue: number;
}

export interface LeadFunnelData {
  total: number;
  new: number;
  contacted: number;
  qualified: number;
  converted: number;
  lost: number;
}

class AnalyticsService {
  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await apiClient.get('/analytics/dashboard');
    return response.data.data;
  }

  /**
   * Get revenue analytics
   */
  async getRevenueAnalytics(startDate?: string, endDate?: string): Promise<RevenueData[]> {
    const response = await apiClient.get('/analytics/revenue', {
      params: { startDate, endDate }
    });
    return response.data.data;
  }

  /**
   * Get lead funnel analytics
   */
  async getLeadFunnelAnalytics(): Promise<LeadFunnelData> {
    const response = await apiClient.get('/analytics/lead-funnel');
    return response.data.data;
  }
}

export const analyticsService = new AnalyticsService();
