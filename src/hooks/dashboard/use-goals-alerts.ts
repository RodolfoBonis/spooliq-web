import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/services/dashboard/api';
import type { GoalsAlertsData } from '@/types/dashboard';

export function useGoalsAlerts() {
  return useQuery<GoalsAlertsData>({
    queryKey: ['dashboard', 'goals-alerts'],
    queryFn: () => dashboardApi.getGoalsAlerts(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
