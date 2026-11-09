import { describe, expect, it } from 'vitest'
import { isInfinitePayCheckoutUrl } from './infinitepay'

describe('isInfinitePayCheckoutUrl', () => {
  it('accepts https infinitepay.io and its subdomains', () => {
    expect(isInfinitePayCheckoutUrl('https://infinitepay.io/checkout/abc')).toBe(true)
    expect(isInfinitePayCheckoutUrl('https://checkout.infinitepay.io/pay/123')).toBe(true)
    expect(isInfinitePayCheckoutUrl('https://api.checkout.infinitepay.io/x')).toBe(true)
  })

  it('rejects non-https schemes', () => {
    expect(isInfinitePayCheckoutUrl('http://checkout.infinitepay.io/pay')).toBe(false)
    expect(isInfinitePayCheckoutUrl('javascript:alert(1)')).toBe(false)
  })

  it('rejects look-alike and unrelated hosts', () => {
    expect(isInfinitePayCheckoutUrl('https://evil-infinitepay.io/pay')).toBe(false)
    expect(isInfinitePayCheckoutUrl('https://infinitepay.io.evil.com/pay')).toBe(false)
    expect(isInfinitePayCheckoutUrl('https://example.com/pay')).toBe(false)
  })

  it('rejects empty and malformed input', () => {
    expect(isInfinitePayCheckoutUrl(null)).toBe(false)
    expect(isInfinitePayCheckoutUrl(undefined)).toBe(false)
    expect(isInfinitePayCheckoutUrl('')).toBe(false)
    expect(isInfinitePayCheckoutUrl('not a url')).toBe(false)
  })
})
