import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/services/dashboard/api';
import { useDashboardStore } from '@/stores/dashboard-store';
import type { DashboardOverview } from '@/types/dashboard';

export function useDashboardOverview() {
  const period = useDashboardStore((state) => state.period);

  return useQuery<DashboardOverview>({
    queryKey: ['dashboard', 'overview', period],
    queryFn: () => dashboardApi.getOverview(period),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 10, // Refetch every 10 minutes
  });
}
