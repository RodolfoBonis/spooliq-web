import { useQuery } from '@tanstack/react-query';
import { mockDashboardApi } from '@/services/dashboard/mock-data';
import type { TopMaterialsData } from '@/types/dashboard';

export function useTopMaterials() {
  return useQuery<TopMaterialsData>({
    queryKey: ['dashboard', 'top-materials'],
    queryFn: () => mockDashboardApi.getTopMaterials(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
