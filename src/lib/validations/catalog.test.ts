import { describe, it, expect } from 'vitest'
import { stockMovementSchema } from '@/lib/validations/catalog'

describe('stockMovementSchema', () => {
  it('accepts a purchase with positive grams', () => {
    const r = stockMovementSchema.safeParse({ type: 'purchase', grams: 500 })
    expect(r.success).toBe(true)
  })

  it('accepts a purchase with a positive unit price', () => {
    const r = stockMovementSchema.safeParse({ type: 'purchase', grams: 500, unit_price_reais: 120.5 })
    expect(r.success).toBe(true)
  })

  it('rejects a purchase with zero or negative grams', () => {
    expect(stockMovementSchema.safeParse({ type: 'purchase', grams: 0 }).success).toBe(false)
    expect(stockMovementSchema.safeParse({ type: 'purchase', grams: -10 }).success).toBe(false)
  })

  it('rejects waste that is not greater than zero', () => {
    expect(stockMovementSchema.safeParse({ type: 'waste', grams: 50 }).success).toBe(true)
    expect(stockMovementSchema.safeParse({ type: 'waste', grams: 0 }).success).toBe(false)
  })

  it('allows a negative adjustment but not a zero one', () => {
    expect(stockMovementSchema.safeParse({ type: 'adjustment', grams: -20 }).success).toBe(true)
    expect(stockMovementSchema.safeParse({ type: 'adjustment', grams: 20 }).success).toBe(true)
    expect(stockMovementSchema.safeParse({ type: 'adjustment', grams: 0 }).success).toBe(false)
  })

  it('rejects NaN and non-integer grams', () => {
    expect(stockMovementSchema.safeParse({ type: 'purchase', grams: NaN }).success).toBe(false)
    expect(stockMovementSchema.safeParse({ type: 'purchase', grams: 10.5 }).success).toBe(false)
  })

  it('rejects a note longer than 500 characters', () => {
    expect(
      stockMovementSchema.safeParse({ type: 'adjustment', grams: 5, note: 'a'.repeat(501) }).success
    ).toBe(false)
    expect(
      stockMovementSchema.safeParse({ type: 'adjustment', grams: 5, note: 'a'.repeat(500) }).success
    ).toBe(true)
  })
})
