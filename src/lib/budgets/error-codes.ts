/**
 * pt-BR overrides for the budget sharing / public approval error `code`s
 * (API contract v2.13.0). Pass these to `getApiErrorMessage(..., { byCode })`.
 *
 * The API already returns localized `message`s; mapping the machine-readable
 * `code` keeps the copy stable regardless of backend wording.
 */

/** Errors returned by the authenticated share endpoints (POST/DELETE /budgets/:id/share). */
export const SHARE_ERROR_CODES = {
  budget_not_shareable:
    'Este orçamento não pode ser compartilhado no status atual (cancelado, imprimindo ou concluído).',
} as const

/** Errors returned by the public endpoints (/public/budgets/:token ...). */
export const PUBLIC_BUDGET_ERROR_CODES = {
  public_budget_not_found: 'Orçamento não encontrado. Verifique o link recebido.',
  budget_already_responded: 'Este orçamento já foi respondido.',
  budget_expired: 'Este orçamento expirou e não pode mais ser respondido.',
  budget_not_available: 'Este orçamento não está mais disponível.',
  budget_under_review:
    'Este orçamento está sendo revisado. Você receberá a nova versão neste mesmo link em breve.',
  rate_limited: 'Muitas tentativas. Aguarde alguns instantes e tente novamente.',
} as const

/**
 * Errors returned by the public InfinitePay payment endpoints
 * (POST /public/budgets/:token/payments and .../payments/confirm). These surface
 * inline near the payment action, not as a full-page error screen.
 */
export const PUBLIC_PAYMENT_ERROR_CODES = {
  payment_not_available:
    'O pagamento não está disponível para este orçamento no momento.',
  payment_kind_mismatch:
    'O valor a pagar foi atualizado. Recarregue a página e tente novamente.',
  budget_already_paid: 'Este orçamento já está totalmente pago.',
  payments_disabled: 'Pagamento online não está disponível para este orçamento.',
  payment_amount_below_minimum:
    'O valor é menor que o mínimo aceito para pagamento online (R$ 1,00).',
  payment_provider_unavailable:
    'O meio de pagamento está indisponível no momento. Tente novamente em instantes.',
  payments_not_configured:
    'O pagamento online ainda não está configurado para esta empresa.',
  rate_limited: 'Muitas tentativas. Aguarde alguns instantes e tente novamente.',
} as const
