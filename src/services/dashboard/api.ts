import api from '@/lib/api/client';
import type {
  DashboardOverview,
  RevenueTrendData,
  ConversionFunnelData,
  RecentActivityData,
  TopCustomersData,
  OperationalInsights,
  TopFilamentsData,
  TopMaterialsData,
  GoalsAlertsData,
  PeriodFilter,
} from '@/types/dashboard';

export const dashboardApi = {
  async getOverview(period: PeriodFilter): Promise<DashboardOverview> {
    const { data } = await api.get<DashboardOverview>('/dashboard/overview', {
      params: { period },
    });
    return data;
  },

  async getRevenueTrend(period: PeriodFilter): Promise<RevenueTrendData> {
    const { data } = await api.get<RevenueTrendData>('/dashboard/revenue-trend', {
      params: { period },
    });
    return data;
  },

  async getConversionFunnel(period: PeriodFilter): Promise<ConversionFunnelData> {
    const { data } = await api.get<ConversionFunnelData>('/dashboard/conversion-funnel', {
      params: { period },
    });
    return data;
  },

  async getRecentActivity(limit: number = 20): Promise<RecentActivityData> {
    const { data } = await api.get<RecentActivityData>('/dashboard/recent-activity', {
      params: { limit },
    });
    return data;
  },

  async getTopCustomers(period: PeriodFilter, limit: number = 5): Promise<TopCustomersData> {
    const { data } = await api.get<TopCustomersData>('/dashboard/top-customers', {
      params: { period, limit },
    });
    return data;
  },

  async getOperationalInsights(period: PeriodFilter): Promise<OperationalInsights> {
    const { data } = await api.get<OperationalInsights>('/dashboard/operational-insights', {
      params: { period },
    });
    return data;
  },

  async getTopFilaments(period: PeriodFilter, limit: number = 5): Promise<TopFilamentsData> {
    const { data } = await api.get<TopFilamentsData>('/dashboard/top-filaments', {
      params: { period, limit },
    });
    return data;
  },

  async getTopMaterials(period: PeriodFilter, limit: number = 5): Promise<TopMaterialsData> {
    const { data } = await api.get<TopMaterialsData>('/dashboard/top-materials', {
      params: { period, limit },
    });
    return data;
  },

  async getGoalsAlerts(): Promise<GoalsAlertsData> {
    const { data } = await api.get<GoalsAlertsData>('/dashboard/goals-alerts');
    return data;
  },
};
