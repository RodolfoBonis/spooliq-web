import { useQuery } from '@tanstack/react-query';
import { mockDashboardApi } from '@/services/dashboard/mock-data';
import type { TopFilamentsData } from '@/types/dashboard';

export function useTopFilaments() {
  return useQuery<TopFilamentsData>({
    queryKey: ['dashboard', 'top-filaments'],
    queryFn: () => mockDashboardApi.getTopFilaments(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
