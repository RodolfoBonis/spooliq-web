import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/services/dashboard/api';
import { useDashboardStore } from '@/stores/dashboard-store';
import type { TopFilamentsData } from '@/types/dashboard';

export function useTopFilaments(limit: number = 5) {
  const period = useDashboardStore((state) => state.period);

  return useQuery<TopFilamentsData>({
    queryKey: ['dashboard', 'top-filaments', period, limit],
    queryFn: () => dashboardApi.getTopFilaments(period, limit),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
