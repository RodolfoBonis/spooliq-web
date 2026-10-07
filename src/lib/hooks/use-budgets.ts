import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { budgetService } from '@/services/budget-service'
import type { BudgetFilters, BudgetPreview, CreateBudgetDTO, PreviewBudgetDTO, ShareBudgetResponse, UpdateBudgetDTO, UpdateBudgetStatusDTO } from '@/services/budget-service'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api/errors'
import { LOW_STOCK_QUERY_KEY } from '@/hooks/dashboard/use-low-stock'
import { SHARE_ERROR_CODES } from '@/lib/budgets/error-codes'

/**
 * User-facing overrides for budget error `code`s. The API already returns pt-BR `message`s,
 * but mapping the machine-readable code keeps the copy stable regardless of backend wording.
 */
const BUDGET_ERROR_CODES = {
  invalid_model3d_reference:
    'O modelo 3D selecionado é inválido ou não existe. Selecione outro modelo.',
} as const

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
      toast.error(getApiErrorMessage(error, 'Erro ao criar orçamento', { byCode: BUDGET_ERROR_CODES }))
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
      toast.error(getApiErrorMessage(error, 'Erro ao atualizar orçamento', { byCode: BUDGET_ERROR_CODES }))
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
      if (variables.data.status === 'completed') {
        // Completing a budget consumes stock.
        queryClient.invalidateQueries({ queryKey: ['filaments'] })
        queryClient.invalidateQueries({ queryKey: ['stock-movements'] })
        queryClient.invalidateQueries({ queryKey: LOW_STOCK_QUERY_KEY })
      }
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

/**
 * Create (or fetch) the public approval link for a budget. Sharing a draft promotes
 * it to `sent`, so both the list and the detail queries are invalidated.
 */
export function useShareBudget() {
  const queryClient = useQueryClient()

  return useMutation<ShareBudgetResponse, unknown, string>({
    mutationFn: (id: string) => budgetService.share(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      queryClient.invalidateQueries({ queryKey: ['budgets', id] })
    },
    onError: (error: unknown) => {
      toast.error(
        getApiErrorMessage(error, 'Erro ao compartilhar orçamento', { byCode: SHARE_ERROR_CODES })
      )
    },
  })
}

/** Revoke the public approval link for a budget. */
export function useRevokeBudgetShare() {
  const queryClient = useQueryClient()

  return useMutation<void, unknown, string>({
    mutationFn: (id: string) => budgetService.revokeShare(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      queryClient.invalidateQueries({ queryKey: ['budgets', id] })
      toast.success('Link do orçamento revogado.')
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'Erro ao revogar o link do orçamento'))
    },
  })
}
