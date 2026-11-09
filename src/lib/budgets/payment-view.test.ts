import { describe, expect, it } from 'vitest'
import { shouldRenderPaymentCard } from './payment-view'
import type { PublicBudgetPayment, PublicBudgetPaymentNext } from '@/types/models'

const next: PublicBudgetPaymentNext = {
  kind: 'deposit',
  amount: 5000,
  pix_amount: 4750,
  pix_discount_percent: 5,
  interest_free_installments: 3,
  installment_amount: 1667,
  max_installments: 12,
}

function payment(overrides: Partial<PublicBudgetPayment> = {}): PublicBudgetPayment {
  return {
    enabled: true,
    status: 'unpaid',
    total: 10000,
    paid: 0,
    balance: 10000,
    can_pay: false,
    has_pending_link: false,
    payments: [],
    ...overrides,
  }
}

describe('shouldRenderPaymentCard', () => {
  it('hides when there is nothing to show (undefined / null)', () => {
    expect(shouldRenderPaymentCard(undefined)).toBe(false)
    expect(shouldRenderPaymentCard(null)).toBe(false)
  })

  it('hides for an unpaid, non-payable budget with no history (e.g. disabled integration)', () => {
    expect(shouldRenderPaymentCard(payment({ enabled: false }))).toBe(false)
    expect(
      shouldRenderPaymentCard(payment({ unavailable_reason: 'payments_disabled' }))
    ).toBe(false)
  })

  it('shows when the budget can be paid now', () => {
    expect(shouldRenderPaymentCard(payment({ can_pay: true, next }))).toBe(true)
  })

  it('shows the preview for a sent budget pending approval', () => {
    expect(
      shouldRenderPaymentCard(payment({ next, unavailable_reason: 'not_approved' }))
    ).toBe(true)
  })

  it('shows when there is any payment progress or history', () => {
    expect(shouldRenderPaymentCard(payment({ status: 'partial', paid: 5000, balance: 5000 }))).toBe(
      true
    )
    expect(shouldRenderPaymentCard(payment({ status: 'paid', paid: 10000, balance: 0 }))).toBe(true)
    expect(
      shouldRenderPaymentCard(
        payment({
          enabled: false,
          payments: [{ kind: 'full', amount: 10000, paid_amount: 10000, paid_at: '2026-11-09' }],
        })
      )
    ).toBe(true)
  })
})
