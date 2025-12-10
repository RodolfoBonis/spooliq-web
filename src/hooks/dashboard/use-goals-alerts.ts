import { useQuery } from '@tanstack/react-query';
import { mockDashboardApi } from '@/services/dashboard/mock-data';
import type { GoalsAlertsData } from '@/types/dashboard';

export function useGoalsAlerts() {
  return useQuery<GoalsAlertsData>({
    queryKey: ['dashboard', 'goals-alerts'],
    queryFn: () => mockDashboardApi.getGoalsAlerts(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
