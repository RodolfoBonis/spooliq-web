import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/services/dashboard/api';
import { useDashboardStore } from '@/stores/dashboard-store';
import type { OperationalInsights } from '@/types/dashboard';

export function useOperationalInsights() {
  const period = useDashboardStore((state) => state.period);

  return useQuery<OperationalInsights>({
    queryKey: ['dashboard', 'operational-insights', period],
    queryFn: () => dashboardApi.getOperationalInsights(period),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
