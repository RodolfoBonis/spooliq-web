import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/services/dashboard/api';
import type { RevenueTrendData, PeriodFilter } from '@/types/dashboard';

export function useRevenueTrend(period: PeriodFilter) {
  return useQuery<RevenueTrendData>({
    queryKey: ['dashboard', 'revenue-trend', period],
    queryFn: () => dashboardApi.getRevenueTrend(period),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
