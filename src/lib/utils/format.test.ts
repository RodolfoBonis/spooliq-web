import { describe, it, expect } from 'vitest'
import {
  formatCurrency,
  formatGrams,
  formatGramsSigned,
  formatQuoteNumberPadded,
} from '@/lib/utils/format'

/** Normalize the non-breaking spaces Intl inserts so assertions stay readable. */
const norm = (s: string) => s.replace(/\s/g, ' ')

describe('formatCurrency', () => {
  it('formats cents as BRL', () => {
    expect(norm(formatCurrency(10000))).toBe('R$ 100,00')
  })

  it('keeps two decimals for 19,99', () => {
    expect(norm(formatCurrency(1999))).toBe('R$ 19,99')
  })

  it('formats zero', () => {
    expect(norm(formatCurrency(0))).toBe('R$ 0,00')
  })

  it('formats thousands with a group separator', () => {
    expect(norm(formatCurrency(123456))).toBe('R$ 1.234,56')
  })
})

describe('formatGrams', () => {
  it('shows grams below 1kg', () => {
    expect(norm(formatGrams(999))).toBe('999 g')
  })

  it('switches to kg at or above 1000g', () => {
    expect(norm(formatGrams(1500))).toBe('1,5 kg')
    expect(norm(formatGrams(1234))).toBe('1,234 kg')
  })

  it('handles negative grams', () => {
    expect(norm(formatGrams(-150))).toBe('-150 g')
  })
})

describe('formatGramsSigned', () => {
  it('prefixes positive values with +', () => {
    expect(norm(formatGramsSigned(1500))).toBe('+1,5 kg')
    expect(norm(formatGramsSigned(250))).toBe('+250 g')
  })

  it('keeps the minus sign for negatives', () => {
    expect(norm(formatGramsSigned(-150))).toBe('-150 g')
  })

  it('does not sign zero', () => {
    expect(norm(formatGramsSigned(0))).toBe('0 g')
  })
})

describe('formatQuoteNumberPadded', () => {
  it('pads to four digits', () => {
    expect(formatQuoteNumberPadded(1)).toBe('0001')
    expect(formatQuoteNumberPadded(42)).toBe('0042')
  })

  it('does not truncate longer numbers', () => {
    expect(formatQuoteNumberPadded(12345)).toBe('12345')
  })

  it('returns an empty string when missing', () => {
    expect(formatQuoteNumberPadded(null)).toBe('')
    expect(formatQuoteNumberPadded(undefined)).toBe('')
  })
})
