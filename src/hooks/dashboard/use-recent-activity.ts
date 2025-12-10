import { useQuery } from '@tanstack/react-query';
import { mockDashboardApi } from '@/services/dashboard/mock-data';
import type { RecentActivityData } from '@/types/dashboard';

export function useRecentActivity() {
  return useQuery<RecentActivityData>({
    queryKey: ['dashboard', 'recent-activity'],
    queryFn: () => mockDashboardApi.getRecentActivity(),
    staleTime: 1000 * 60 * 2, // 2 minutes - more frequent for activity feed
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });
}
