import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/services/dashboard/api';
import type { RecentActivityData } from '@/types/dashboard';

export function useRecentActivity(limit: number = 20) {
  return useQuery<RecentActivityData>({
    queryKey: ['dashboard', 'recent-activity', limit],
    queryFn: () => dashboardApi.getRecentActivity(limit),
    staleTime: 1000 * 60 * 2, // 2 minutes - more frequent for activity feed
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });
}
