import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { budgetService } from '@/services/budget-service'
import type { BudgetFilters, CreateBudgetDTO, UpdateBudgetDTO, UpdateBudgetStatusDTO } from '@/services/budget-service'
import { toast } from 'sonner'

export function useBudgets(filters?: BudgetFilters) {
  return useQuery({
    queryKey: ['budgets', filters],
    queryFn: () => budgetService.list(filters),
  })
}

export function useBudget(id: string) {
  return useQuery({
    queryKey: ['budgets', id],
    queryFn: () => budgetService.getById(id),
    enabled: !!id,
  })
}

export function useCreateBudget() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateBudgetDTO) => budgetService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      toast.success('Orçamento criado com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao criar orçamento')
    },
  })
}

export function useUpdateBudget() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBudgetDTO }) =>
      budgetService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      queryClient.invalidateQueries({ queryKey: ['budgets', variables.id] })
      toast.success('Orçamento atualizado com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao atualizar orçamento')
    },
  })
}

export function useUpdateBudgetStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBudgetStatusDTO }) =>
      budgetService.updateStatus(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      queryClient.invalidateQueries({ queryKey: ['budgets', variables.id] })
      toast.success('Status do orçamento atualizado!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao atualizar status')
    },
  })
}

export function useDeleteBudget() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => budgetService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      toast.success('Orçamento deletado com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao deletar orçamento')
    },
  })
}

export function useGeneratePDF() {
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      budgetService.downloadPDF(id, name),
    onSuccess: () => {
      toast.success('PDF gerado e baixado com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao gerar PDF')
    },
  })
}

