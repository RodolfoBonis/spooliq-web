import { describe, expect, it } from 'vitest'
import { isInfinitePayUrl, urlHostForLog } from './infinitepay'

describe('isInfinitePayUrl', () => {
  it('accepts https infinitepay.io and its subdomains', () => {
    expect(isInfinitePayUrl('https://infinitepay.io/checkout/abc')).toBe(true)
    expect(isInfinitePayUrl('https://checkout.infinitepay.io/pay/123')).toBe(true)
    expect(isInfinitePayUrl('https://api.checkout.infinitepay.io/x')).toBe(true)
  })

  it('is case-insensitive and port-agnostic for the real host', () => {
    expect(isInfinitePayUrl('https://INFINITEPAY.IO')).toBe(true)
    expect(isInfinitePayUrl('https://infinitepay.io:444')).toBe(true)
  })

  it('rejects userinfo tricks pointing at another host', () => {
    expect(isInfinitePayUrl('https://infinitepay.io@evil.com')).toBe(false)
  })

  it('rejects non-https schemes and protocol-relative URLs', () => {
    expect(isInfinitePayUrl('http://checkout.infinitepay.io/pay')).toBe(false)
    expect(isInfinitePayUrl('javascript:alert(1)')).toBe(false)
    expect(isInfinitePayUrl('//infinitepay.io')).toBe(false)
  })

  it('rejects look-alike, trailing-dot and unrelated hosts', () => {
    expect(isInfinitePayUrl('https://evil-infinitepay.io/pay')).toBe(false)
    expect(isInfinitePayUrl('https://infinitepay.io.evil.com/pay')).toBe(false)
    expect(isInfinitePayUrl('infinitepay.io.')).toBe(false)
    expect(isInfinitePayUrl('https://infinitepay.io./pay')).toBe(false)
    expect(isInfinitePayUrl('https://example.com/pay')).toBe(false)
  })

  it('rejects empty and malformed input', () => {
    expect(isInfinitePayUrl(null)).toBe(false)
    expect(isInfinitePayUrl(undefined)).toBe(false)
    expect(isInfinitePayUrl('')).toBe(false)
    expect(isInfinitePayUrl('not a url')).toBe(false)
  })
})

describe('urlHostForLog', () => {
  it('returns the lowercased host without leaking the full URL', () => {
    expect(urlHostForLog('https://Checkout.InfinitePay.io/pay/secret-token')).toBe(
      'checkout.infinitepay.io'
    )
    expect(urlHostForLog('https://evil.com:8443/x')).toBe('evil.com:8443')
  })

  it('falls back to "desconhecido" for unparseable input', () => {
    expect(urlHostForLog('not a url')).toBe('desconhecido')
    expect(urlHostForLog(null)).toBe('desconhecido')
  })
})
