import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  publicBudgetService,
  toBudgetView,
  type PublicApproveDTO,
  type PublicRejectDTO,
  type CreatePublicPaymentDTO,
  type ConfirmPublicPaymentDTO,
} from '@/services/public-budget-service'
import { isAxiosError } from 'axios'
import type { PublicBudget } from '@/types/models'
import { getApiErrorMessage } from '@/lib/api/errors'
import {
  PUBLIC_BUDGET_ERROR_CODES,
  PUBLIC_PAYMENT_ERROR_CODES,
} from '@/lib/budgets/error-codes'
import { isInfinitePayUrl, urlHostForLog } from '@/lib/budgets/infinitepay'

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

/**
 * Codes whose error means the cached payment view (kind/amount) is stale. We invalidate
 * the budget query so the page refetches the current charge instead of showing the old one.
 */
const STALE_VIEW_PAYMENT_CODES = new Set([
  'payment_kind_mismatch',
  'payment_not_available',
  'budget_already_paid',
  'payments_disabled',
])

function apiErrorCode(error: unknown): string | undefined {
  if (!isAxiosError(error)) return undefined
  const code = (error.response?.data as { code?: unknown } | undefined)?.code
  return typeof code === 'string' ? code : undefined
}

/**
 * Create an InfinitePay checkout link for the budget's next charge and redirect the
 * browser to it. For safety the redirect only happens when the returned `checkout_url`
 * is an https URL on `infinitepay.io` (see `isInfinitePayUrl`); otherwise the mutation
 * fails loudly (logging only the host, never the full URL) so a stale/malicious URL never
 * navigates the customer away. On errors that mean the view is stale, the budget query is
 * invalidated so the page stops showing the old kind and amount.
 */
export function useCreatePublicPayment(token: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: CreatePublicPaymentDTO) => publicBudgetService.createPayment(token, body),
    onSuccess: ({ checkout_url }) => {
      if (isInfinitePayUrl(checkout_url)) {
        window.location.assign(checkout_url)
        return
      }
      console.error('Rejected non-InfinitePay checkout URL', { host: urlHostForLog(checkout_url) })
      toast.error('Não foi possível abrir o pagamento. Tente novamente em instantes.')
    },
    onError: (error: unknown) => {
      const code = apiErrorCode(error)
      if (code && STALE_VIEW_PAYMENT_CODES.has(code)) {
        void queryClient.invalidateQueries({ queryKey: publicBudgetKey(token) })
      }
      toast.error(getPublicPaymentErrorMessage(error, 'Não foi possível iniciar o pagamento'))
    },
  })
}

/**
 * Confirm a payment on return from the InfinitePay checkout. The refreshed public view
 * is written straight into the cache (same `setQueryData` pattern as approve/reject) so
 * the page reflects the new payment status immediately. The `confirmation` field is kept
 * only on the mutation result for the return screen to drive its paid/processing state.
 */
export function useConfirmPublicPayment(token: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: ConfirmPublicPaymentDTO) => publicBudgetService.confirmPayment(token, body),
    onSuccess: (data) => {
      // Persist only the budget view; `confirmation` is transient state the return screen
      // reads from the mutation result, not from the cached budget.
      queryClient.setQueryData(publicBudgetKey(token), toBudgetView(data))
    },
  })
}

/** Maps a public-budget mutation/query error to a pt-BR message. */
export function getPublicBudgetErrorMessage(error: unknown, fallback: string): string {
  return getApiErrorMessage(error, fallback, { byCode: PUBLIC_BUDGET_ERROR_CODES })
}

/** Maps a public-payment mutation error to a pt-BR message. */
export function getPublicPaymentErrorMessage(error: unknown, fallback: string): string {
  return getApiErrorMessage(error, fallback, { byCode: PUBLIC_PAYMENT_ERROR_CODES })
}
