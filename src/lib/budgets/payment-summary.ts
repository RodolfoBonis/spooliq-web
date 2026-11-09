import { formatCurrency } from '@/lib/utils/format'
import type { PublicBudgetPaymentNext } from '@/types/models'

/**
 * Builds the human-readable payment summary lines shown on the public budget page,
 * e.g.:
 *   "R$ 95,00 no Pix (5% off)"
 *   "ou até 3x de R$ 33,33 sem juros"
 *   "até 12x no cartão"
 *
 * Rules (from the product spec):
 * - The Pix line always shows; the "(N% off)" suffix is dropped when the discount is 0.
 * - The interest-free line is dropped when there are fewer than 2 interest-free
 *   installments (there is nothing to split).
 * - The "até Nx no cartão" line is dropped when the interest-free plan already reaches
 *   the card maximum (N = max), since it would add no information.
 *
 * All monetary inputs are in cents, matching the API contract.
 */
export function buildPaymentSummaryLines(next: PublicBudgetPaymentNext): string[] {
  const lines: string[] = []

  const pixDiscount = next.pix_discount_percent
  const pixLine =
    pixDiscount > 0
      ? `${formatCurrency(next.pix_amount)} no Pix (${formatPercent(pixDiscount)}% off)`
      : `${formatCurrency(next.pix_amount)} no Pix`
  lines.push(pixLine)

  if (next.interest_free_installments >= 2) {
    lines.push(
      `ou até ${next.interest_free_installments}x de ${formatCurrency(
        next.installment_amount
      )} sem juros`
    )
  }

  if (next.max_installments > next.interest_free_installments && next.max_installments >= 2) {
    lines.push(`até ${next.max_installments}x no cartão`)
  }

  return lines
}

/** Formats a percentage dropping a trailing ",00" (e.g. 5 -> "5", 2.5 -> "2,5"). */
function formatPercent(value: number): string {
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(value)
}
