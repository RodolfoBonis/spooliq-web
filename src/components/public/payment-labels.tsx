import { formatCurrency } from '@/lib/utils/format'
import { buildPaymentSummaryLines } from '@/lib/budgets/payment-summary'
import type { PublicBudgetPaymentKind, PublicBudgetPaymentNext } from '@/types/models'

/** Button copy for each charge kind, shared by the card and the approval dialog. */
export const PAY_BUTTON_LABEL: Record<PublicBudgetPaymentKind, string> = {
  deposit: 'Pagar sinal',
  full: 'Pagar agora',
  balance: 'Pagar restante',
}

/**
 * Full button label, appending the amount for partial charges (deposit/balance) so the
 * customer sees exactly what will be charged. "Pagar agora" (full) stays unqualified.
 */
export function payButtonLabel(next: PublicBudgetPaymentNext): string {
  const base = PAY_BUTTON_LABEL[next.kind]
  return next.kind === 'full' ? base : `${base} · ${formatCurrency(next.amount)}`
}

/** The Pix/installments summary list, shared by the card and the approval dialog. */
export function PaymentSummaryList({ next }: { next: PublicBudgetPaymentNext }) {
  const lines = buildPaymentSummaryLines(next)
  if (lines.length === 0) return null
  return (
    <ul className="space-y-1 text-sm text-neutral-700">
      {lines.map((line, i) => (
        <li key={line} className={i === 0 ? 'font-medium text-neutral-900' : undefined}>
          {line}
        </li>
      ))}
    </ul>
  )
}
