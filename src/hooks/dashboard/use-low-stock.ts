import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/services/dashboard/api';
import type { LowStockData } from '@/types/dashboard';

/** Query key shared with the catalog mutations so they can invalidate this card. */
export const LOW_STOCK_QUERY_KEY = ['dashboard', 'low-stock'] as const;

export function useLowStock() {
  return useQuery<LowStockData>({
    queryKey: LOW_STOCK_QUERY_KEY,
    queryFn: () => dashboardApi.getLowStock(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
