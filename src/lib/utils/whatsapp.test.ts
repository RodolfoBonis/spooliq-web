import { describe, it, expect } from 'vitest'
import { normalizeWhatsappNumber, sanitizeHttpUrl } from '@/lib/utils/whatsapp'

describe('normalizeWhatsappNumber', () => {
  it('returns null for empty input', () => {
    expect(normalizeWhatsappNumber(undefined)).toBeNull()
    expect(normalizeWhatsappNumber(null)).toBeNull()
    expect(normalizeWhatsappNumber('')).toBeNull()
    expect(normalizeWhatsappNumber('abc')).toBeNull()
  })

  it('strips formatting and prefixes the 55 country code', () => {
    expect(normalizeWhatsappNumber('(11) 99999-9999')).toBe('5511999999999')
    expect(normalizeWhatsappNumber('11999999999')).toBe('5511999999999')
  })

  it('does not double-prefix a number that already has the country code', () => {
    expect(normalizeWhatsappNumber('5511999999999')).toBe('5511999999999')
    expect(normalizeWhatsappNumber('+55 11 99999-9999')).toBe('5511999999999')
  })

  it('treats DDD 55 as an area code, not the country code', () => {
    // (55) 9999-9999 → 10 local digits → still gets the 55 country prefix.
    expect(normalizeWhatsappNumber('(55) 9999-9999')).toBe('555599999999')
  })
})

describe('sanitizeHttpUrl', () => {
  it('rejects empty input', () => {
    expect(sanitizeHttpUrl(undefined)).toBeNull()
    expect(sanitizeHttpUrl(null)).toBeNull()
    expect(sanitizeHttpUrl('   ')).toBeNull()
  })

  it('rejects non-http(s) schemes', () => {
    expect(sanitizeHttpUrl('javascript:alert(1)')).toBeNull()
    expect(sanitizeHttpUrl('data:text/html,<script>')).toBeNull()
    expect(sanitizeHttpUrl('ftp://example.com')).toBeNull()
  })

  it('prefixes https:// when the scheme is missing', () => {
    expect(sanitizeHttpUrl('example.com')).toBe('https://example.com/')
  })

  it('keeps valid http(s) URLs', () => {
    expect(sanitizeHttpUrl('http://example.com')).toBe('http://example.com/')
    expect(sanitizeHttpUrl('https://example.com/path')).toBe('https://example.com/path')
  })
})
