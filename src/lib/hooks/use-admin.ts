import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { adminService, type UpdateCompanyStatusRequest } from '@/services/admin-service'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api/errors'

export interface AdminCompaniesParams {
  page?: number
  pageSize?: number
  status?: string
  search?: string
}

export function useAdminCompanies(params: AdminCompaniesParams = {}) {
  const { page = 1, pageSize = 20, status, search } = params
  return useQuery({
    queryKey: ['admin-companies', { page, pageSize, status, search }],
    queryFn: () => adminService.listCompanies(page, pageSize, status, search),
    placeholderData: keepPreviousData,
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
    mutationFn: ({
      organizationId,
      request,
    }: {
      organizationId: string
      request: UpdateCompanyStatusRequest
    }) => adminService.updateCompanyStatus(organizationId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-companies'] })
      toast.success('Status da empresa atualizado com sucesso!')
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'Erro ao atualizar status'))
    },
  })
}

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminService.getStats(),
  })
}
