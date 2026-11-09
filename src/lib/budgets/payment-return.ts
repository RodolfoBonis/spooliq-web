import { isAxiosError } from 'axios'

/**
 * Phases of the InfinitePay checkout return screen.
 * - `confirming`: the one-shot confirm request is in flight;
 * - `paid`: the payment is confirmed;
 * - `processing`: confirmation is still settling — the screen polls the budget;
 * - `failed`: we could not confirm (a definitive 4xx) — ask the customer to contact the company;
 * - `invalid`: the return link is missing required params;
 * - `timeout`: polling ran out — a friendly "we're still processing" fallback.
 */
export type ReturnPhase = 'confirming' | 'paid' | 'processing' | 'failed' | 'invalid' | 'timeout'

/** Phase to show after a successful confirm response. */
export function phaseFromConfirmResponse(confirmation: 'paid' | 'processing'): ReturnPhase {
  return confirmation === 'paid' ? 'paid' : 'processing'
}

/**
 * Phase to show after a failed confirm request.
 *
 * Only transient failures lead to polling: network errors (no response), 429 and 5xx.
 * A definitive client error (other 4xx) means we cannot confirm this payment from here,
 * so we surface the "fale com a empresa" state instead of polling forever.
 */
export function phaseFromConfirmError(error: unknown): ReturnPhase {
  const status = isAxiosError(error) ? error.response?.status : undefined
  if (status === undefined) return 'processing' // network / unknown → transient
  if (status === 429) return 'processing' // rate limited → transient
  if (status >= 400 && status < 500) return 'failed' // definitive client error
  return 'processing' // 5xx → transient
}
