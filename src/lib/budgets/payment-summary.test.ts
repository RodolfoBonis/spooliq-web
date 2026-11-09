import { describe, expect, it } from 'vitest'
import { buildPaymentSummaryLines } from './payment-summary'
import type { PublicBudgetPaymentNext } from '@/types/models'

function makeNext(overrides: Partial<PublicBudgetPaymentNext> = {}): PublicBudgetPaymentNext {
  return {
    kind: 'full',
    amount: 10000,
    pix_amount: 9500,
    pix_discount_percent: 5,
    interest_free_installments: 3,
    installment_amount: 3334,
    max_installments: 12,
    ...overrides,
  }
}

describe('buildPaymentSummaryLines', () => {
  it('renders the Pix line with the discount percentage', () => {
    const [pixLine] = buildPaymentSummaryLines(makeNext())
    expect(pixLine).toContain('no Pix')
    expect(pixLine).toContain('(5% de desconto)')
    expect(pixLine).toMatch(/95,00/)
  })

  it('drops the "(N% de desconto)" suffix when there is no Pix discount', () => {
    const [pixLine] = buildPaymentSummaryLines(makeNext({ pix_discount_percent: 0 }))
    expect(pixLine).toContain('no Pix')
    expect(pixLine).not.toContain('desconto')
  })

  it('renders all three lines when there is a discount, interest-free plan and a higher card max', () => {
    const lines = buildPaymentSummaryLines(makeNext())
    expect(lines).toHaveLength(3)
    expect(lines[1]).toContain('3x')
    expect(lines[1]).toContain('sem juros')
    expect(lines[1]).toMatch(/33,34/)
    expect(lines[2]).toBe('até 12x no cartão')
  })

  it('omits the interest-free line when there are fewer than 2 interest-free installments', () => {
    const lines = buildPaymentSummaryLines(makeNext({ interest_free_installments: 1 }))
    expect(lines.some((l) => l.includes('sem juros'))).toBe(false)
    // Pix + "até 12x no cartão"
    expect(lines).toHaveLength(2)
    expect(lines[1]).toBe('até 12x no cartão')
  })

  it('omits the "até Nx no cartão" line when the interest-free plan already reaches the max', () => {
    const lines = buildPaymentSummaryLines(
      makeNext({ interest_free_installments: 12, max_installments: 12 })
    )
    expect(lines.some((l) => l.includes('no cartão'))).toBe(false)
    expect(lines).toHaveLength(2)
    expect(lines[1]).toContain('12x')
    expect(lines[1]).toContain('sem juros')
  })

  it('shows only the Pix line for a single-installment card with no interest-free plan', () => {
    const lines = buildPaymentSummaryLines(
      makeNext({ interest_free_installments: 1, max_installments: 1 })
    )
    expect(lines).toHaveLength(1)
    expect(lines[0]).toContain('no Pix')
  })
})
