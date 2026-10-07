import { describe, it, expect } from 'vitest'
import { buildStockSettingsPayload } from '@/services/filament-service'

describe('buildStockSettingsPayload', () => {
  it('passes through a set threshold and track flag', () => {
    expect(buildStockSettingsPayload({ track_stock: true, low_stock_threshold_grams: 100 })).toEqual({
      track_stock: true,
      low_stock_threshold_grams: 100,
    })
  })

  it('keeps a zero threshold as 0 (not cleared)', () => {
    expect(buildStockSettingsPayload({ track_stock: false, low_stock_threshold_grams: 0 })).toEqual({
      track_stock: false,
      low_stock_threshold_grams: 0,
    })
  })

  it('clears the threshold to null for empty/undefined/null', () => {
    expect(buildStockSettingsPayload({ low_stock_threshold_grams: '' }).low_stock_threshold_grams).toBeNull()
    expect(buildStockSettingsPayload({ low_stock_threshold_grams: undefined }).low_stock_threshold_grams).toBeNull()
    expect(buildStockSettingsPayload({ low_stock_threshold_grams: null }).low_stock_threshold_grams).toBeNull()
  })

  it('omits track_stock when it is not provided', () => {
    const out = buildStockSettingsPayload({ low_stock_threshold_grams: 50 })
    expect('track_stock' in out).toBe(false)
    expect(out.low_stock_threshold_grams).toBe(50)
  })
})
