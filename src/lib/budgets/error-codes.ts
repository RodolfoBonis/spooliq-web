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
  rate_limited: 'Muitas tentativas. Aguarde alguns instantes e tente novamente.',
} as const
