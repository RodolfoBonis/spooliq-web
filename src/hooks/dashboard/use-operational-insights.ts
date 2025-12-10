import { useQuery } from '@tanstack/react-query';
import { mockDashboardApi } from '@/services/dashboard/mock-data';
import type { OperationalInsights } from '@/types/dashboard';

export function useOperationalInsights() {
  return useQuery<OperationalInsights>({
    queryKey: ['dashboard', 'operational-insights'],
    queryFn: () => mockDashboardApi.getOperationalInsights(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
