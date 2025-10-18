import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminService } from '@/services/admin-service'
import { toast } from 'sonner'

export function useAdminCompanies() {
  return useQuery({
    queryKey: ['admin-companies'],
    queryFn: () => adminService.listCompanies(),
  })
}

export function useAdminCompany(organizationId: string) {
  return useQuery({
    queryKey: ['admin-company', organizationId],
    queryFn: () => adminService.getCompany(organizationId),
    enabled: !!organizationId,
  })
}

export function useUpdateCompanyStatus() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ organizationId, status }: { organizationId: string; status: 'active' | 'suspended' | 'cancelled' }) =>
      adminService.updateCompanyStatus(organizationId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-companies'] })
      toast.success('Status da empresa atualizado com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao atualizar status')
    },
  })
}

export function useAdminSubscriptions() {
  return useQuery({
    queryKey: ['admin-subscriptions'],
    queryFn: () => adminService.listSubscriptions(),
  })
}

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminService.getStats(),
  })
}

