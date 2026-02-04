import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/services/dashboard/api';
import { useDashboardStore } from '@/stores/dashboard-store';
import type { TopMaterialsData } from '@/types/dashboard';

export function useTopMaterials(limit: number = 5) {
  const period = useDashboardStore((state) => state.period);

  return useQuery<TopMaterialsData>({
    queryKey: ['dashboard', 'top-materials', period, limit],
    queryFn: () => dashboardApi.getTopMaterials(period, limit),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
