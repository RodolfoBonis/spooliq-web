import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/services/dashboard/api';
import { useDashboardStore } from '@/stores/dashboard-store';
import type { ConversionFunnelData } from '@/types/dashboard';

export function useConversionFunnel() {
  const period = useDashboardStore((state) => state.period);

  return useQuery<ConversionFunnelData>({
    queryKey: ['dashboard', 'conversion-funnel', period],
    queryFn: () => dashboardApi.getConversionFunnel(period),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
