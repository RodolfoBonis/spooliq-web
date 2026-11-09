import { describe, it, expect } from 'vitest'
import {
  reaisToCents,
  buildBudgetPricingPayload,
  buildBudgetUpdatePayload,
} from '@/lib/utils/budget-preview'
import type { CreateBudgetFormData } from '@/lib/validations/budget'

/** Minimal form-values factory; only the fields under test are overridden. */
function values(overrides: Partial<CreateBudgetFormData> = {}): Partial<CreateBudgetFormData> {
  return overrides
}

describe('reaisToCents', () => {
  it('rounds reais to integer cents', () => {
    expect(reaisToCents(15)).toBe(1500)
    expect(reaisToCents(19.99)).toBe(1999)
  })

  it('avoids binary float drift (0.1 + 0.2)', () => {
    expect(reaisToCents(0.1 + 0.2)).toBe(30)
  })
})

describe('buildBudgetPricingPayload', () => {
  it('maps "no discount" to null and omits the value', () => {
    const out = buildBudgetPricingPayload(values())
    expect(out.discount_type).toBeNull()
    expect(out.discount_value).toBeUndefined()
  })

  it('treats discount_type "none" as no discount', () => {
    const out = buildBudgetPricingPayload(values({ discount_type: 'none', discount_value: 10 }))
    expect(out.discount_type).toBeNull()
    expect(out.discount_value).toBeUndefined()
  })

  it('defaults include_machine_cost to true and tax_rate to null', () => {
    const out = buildBudgetPricingPayload(values())
    expect(out.include_machine_cost).toBe(true)
    expect(out.tax_rate).toBeNull()
    expect(out.include_shipping).toBe(false)
    expect(out.shipping_override).toBeNull()
  })

  it('keeps a valid tax rate and clears an out-of-range one', () => {
    expect(buildBudgetPricingPayload(values({ tax_rate: 6 })).tax_rate).toBe(6)
    expect(buildBudgetPricingPayload(values({ tax_rate: 150 })).tax_rate).toBeNull()
  })

  it('converts the shipping override from reais to cents only when shipping is on', () => {
    expect(
      buildBudgetPricingPayload(values({ include_shipping: true, shipping_override: 15 })).shipping_override
    ).toBe(1500)
    // Shipping off → override ignored.
    expect(
      buildBudgetPricingPayload(values({ include_shipping: false, shipping_override: 15 })).shipping_override
    ).toBeNull()
    // Shipping on but blank → auto (null).
    expect(
      buildBudgetPricingPayload(values({ include_shipping: true, shipping_override: 0 })).shipping_override
    ).toBeNull()
  })

  it('switches discount type while keeping the reais value for fixed', () => {
    const fixed = buildBudgetPricingPayload(values({ discount_type: 'fixed', discount_value: 10 }))
    expect(fixed).toMatchObject({ discount_type: 'fixed', discount_value: 10 })

    const percent = buildBudgetPricingPayload(values({ discount_type: 'percent', discount_value: 10 }))
    expect(percent).toMatchObject({ discount_type: 'percent', discount_value: 10 })
  })

  it('omits an invalid percent discount value', () => {
    const out = buildBudgetPricingPayload(values({ discount_type: 'percent', discount_value: 150 }))
    expect(out.discount_type).toBe('percent')
    expect(out.discount_value).toBeUndefined()
  })
})

describe('buildBudgetUpdatePayload', () => {
  it('clears discount, tax, shipping and validity when none are set', () => {
    const out = buildBudgetUpdatePayload(values())
    expect(out.discount_type).toBeNull()
    expect(out.discount_value).toBeNull()
    expect(out.tax_rate).toBeNull()
    expect(out.shipping_override).toBeNull()
    expect(out.valid_until).toBeNull()
  })

  it('sends both discount fields as null when the user picks "sem desconto"', () => {
    const out = buildBudgetUpdatePayload(values({ discount_type: 'none', discount_value: 25 }))
    expect(out.discount_type).toBeNull()
    expect(out.discount_value).toBeNull()
  })

  it('sends the discount type and value when set', () => {
    const out = buildBudgetUpdatePayload(values({ discount_type: 'fixed', discount_value: 30 }))
    expect(out).toMatchObject({ discount_type: 'fixed', discount_value: 30 })
  })

  it('keeps null tax_rate (usar padrão da empresa) and a set rate', () => {
    expect(buildBudgetUpdatePayload(values()).tax_rate).toBeNull()
    expect(buildBudgetUpdatePayload(values({ tax_rate: 8.5 })).tax_rate).toBe(8.5)
  })

  it('converts the shipping override to cents', () => {
    const out = buildBudgetUpdatePayload(values({ include_shipping: true, shipping_override: 12.5 }))
    expect(out.shipping_override).toBe(1250)
  })

  it('maps a validity date to an end-of-day ISO string and empty to null', () => {
    expect(buildBudgetUpdatePayload(values({ valid_until: undefined })).valid_until).toBeNull()
    const out = buildBudgetUpdatePayload(values({ valid_until: '2026-01-15' }))
    expect(out.valid_until).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })
})
