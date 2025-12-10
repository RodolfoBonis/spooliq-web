import { useQuery } from '@tanstack/react-query';
import { mockDashboardApi } from '@/services/dashboard/mock-data';
import type { ConversionFunnelData } from '@/types/dashboard';

export function useConversionFunnel() {
  return useQuery<ConversionFunnelData>({
    queryKey: ['dashboard', 'conversion-funnel'],
    queryFn: () => mockDashboardApi.getConversionFunnel(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
