import { useQuery } from '@tanstack/react-query';
import { mockDashboardApi } from '@/services/dashboard/mock-data';
import type { TopCustomersData } from '@/types/dashboard';

export function useTopCustomers() {
  return useQuery<TopCustomersData>({
    queryKey: ['dashboard', 'top-customers'],
    queryFn: () => mockDashboardApi.getTopCustomers(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
