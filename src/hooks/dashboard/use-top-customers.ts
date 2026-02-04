import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/services/dashboard/api';
import { useDashboardStore } from '@/stores/dashboard-store';
import type { TopCustomersData } from '@/types/dashboard';

export function useTopCustomers(limit: number = 5) {
  const period = useDashboardStore((state) => state.period);

  return useQuery<TopCustomersData>({
    queryKey: ['dashboard', 'top-customers', period, limit],
    queryFn: () => dashboardApi.getTopCustomers(period, limit),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
