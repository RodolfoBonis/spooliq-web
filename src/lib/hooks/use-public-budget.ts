import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  publicBudgetService,
  type PublicApproveDTO,
  type PublicRejectDTO,
} from '@/services/public-budget-service'
import type { PublicBudget } from '@/types/models'
import { getApiErrorMessage } from '@/lib/api/errors'
import { PUBLIC_BUDGET_ERROR_CODES } from '@/lib/budgets/error-codes'

const publicBudgetKey = (token: string) => ['public-budget', token] as const

/**
 * Fetch the public view of a budget by its share token. No auth required.
 * Retries are disabled so friendly state screens (expired, not found, ...) show
 * immediately instead of after several retries.
 */
export function usePublicBudget(token: string) {
  return useQuery({
    queryKey: publicBudgetKey(token),
    queryFn: () => publicBudgetService.get(token),
    enabled: !!token,
    retry: false,
    refetchOnWindowFocus: false,
  })
}

/**
 * Approve the budget. On success the cache is updated with the returned view, which
 * flips `can_respond` to false and reveals the response state. Errors are surfaced
 * via `mutation.error` so the dialog can render the mapped pt-BR message inline.
 */
export function useApprovePublicBudget(token: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: PublicApproveDTO) => publicBudgetService.approve(token, body),
    onSuccess: (data: PublicBudget) => {
      queryClient.setQueryData(publicBudgetKey(token), data)
    },
  })
}

export function useRejectPublicBudget(token: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: PublicRejectDTO) => publicBudgetService.reject(token, body),
    onSuccess: (data: PublicBudget) => {
      queryClient.setQueryData(publicBudgetKey(token), data)
    },
  })
}

/** PDF download helper for the public page (mutation so we can show a pending state). */
export function useDownloadPublicPDF(token: string, quoteNumber?: number) {
  return useMutation({
    mutationFn: async () => {
      const blob = await publicBudgetService.getPDF(token)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      const suffix = quoteNumber ? String(quoteNumber).padStart(4, '0') : token
      link.download = `orcamento-${suffix}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    },
    onError: (error: unknown) => {
      toast.error(
        getApiErrorMessage(error, 'Erro ao baixar o PDF', {
          byCode: PUBLIC_BUDGET_ERROR_CODES,
        })
      )
    },
  })
}

/** Maps a public-budget mutation/query error to a pt-BR message. */
export function getPublicBudgetErrorMessage(error: unknown, fallback: string): string {
  return getApiErrorMessage(error, fallback, { byCode: PUBLIC_BUDGET_ERROR_CODES })
}
