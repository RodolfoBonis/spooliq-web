import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { budgetService } from '@/services/budget-service'
import type { BudgetFilters, BudgetPreview, CreateBudgetDTO, PreviewBudgetDTO, UpdateBudgetDTO, UpdateBudgetStatusDTO } from '@/services/budget-service'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api/errors'

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

/**
 * Server-side cost preview (`POST /budgets/preview`), the single source of truth for
 * budget math. Pass `null` while the form isn't ready; debounce the payload upstream.
 */
export function useBudgetPreview(payload: PreviewBudgetDTO | null) {
  return useQuery({
    queryKey: ['budget-preview', payload],
    queryFn: ({ signal }) => {
      if (!payload) return Promise.reject<BudgetPreview>(new Error('Preview payload is not ready'))
      return budgetService.preview(payload, signal)
    },
    enabled: payload !== null,
    placeholderData: keepPreviousData,
    retry: false,
    staleTime: 30 * 1000,
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
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'Erro ao criar orçamento'))
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
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'Erro ao atualizar orçamento'))
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
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'Erro ao atualizar status'))
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
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'Erro ao deletar orçamento'))
    },
  })
}

export function useGeneratePDF() {
  return useMutation({
    mutationFn: async ({ id, name, force = false }: { id: string; name: string; force?: boolean }) => {
      const blob = await budgetService.generatePDF(id, force)
      return { blob, name }
    },
    onSuccess: ({ blob, name }) => {
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `orcamento-${name.toLowerCase().replace(/\s+/g, '-')}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success('PDF baixado com sucesso!')
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'Erro ao gerar PDF'))
    },
  })
}

