import type { PublicBudgetPayment } from '@/types/models'

/**
 * Whether the payment card has anything worth rendering. When payments are disabled and
 * nothing was ever paid we hide the card entirely to avoid noise on the public page.
 *
 * Shows when: the budget has any payment progress (partial/paid), has recorded payments,
 * can be paid now, or is a `sent` budget whose "ao aprovar você poderá pagar…" preview
 * should appear.
 */
export function shouldRenderPaymentCard(
  payment?: PublicBudgetPayment | null
): payment is PublicBudgetPayment {
  if (!payment) return false
  if (payment.status !== 'unpaid') return true
  if (payment.payments.length > 0) return true
  if (payment.can_pay) return true
  if (payment.next && payment.unavailable_reason === 'not_approved') return true
  return false
}
