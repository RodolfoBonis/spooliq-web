/**
 * Normalize a Brazilian phone number into the digits-only form wa.me expects.
 * Strips non-digits and prefixes the country code `55` when it is missing.
 * Returns null when there is no usable number.
 */
export function normalizeWhatsappNumber(raw?: string | null): string | null {
  if (!raw) return null
  const digits = raw.replace(/\D/g, '')
  if (!digits) return null
  // Brazilian numbers have 10-11 digits (DDD + number); DDD 55 (RS) must not be mistaken for the country code.
  if (digits.length <= 11) return `55${digits}`
  return digits
}

/**
 * Build a wa.me link. When a number is provided the chat opens directly with that
 * contact; otherwise wa.me shows the contact chooser. `text` is optional.
 */
export function buildWhatsappLink(number: string | null, text?: string): string {
  const query = text ? `?text=${encodeURIComponent(text)}` : ''
  return number ? `https://wa.me/${number}${query}` : `https://wa.me/${query}`
}

/**
 * Return a safe absolute http(s) URL, prefixing https:// when the scheme is missing.
 * Any other scheme (javascript:, data:, ...) or unparsable input yields null.
 */
export function sanitizeHttpUrl(raw?: string | null): string | null {
  const value = raw?.trim()
  if (!value) return null
  const hasScheme = /^[a-z][a-z0-9+.-]*:/i.test(value) && !/^[^/]+:\d+(\/|$)/.test(value)
  try {
    const url = new URL(hasScheme || value.startsWith('//') ? value : `https://${value}`)
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : null
  } catch {
    return null
  }
}

/**
 * Build a normalized Instagram profile URL from a handle or URL.
 * Accepts "@empresa", "empresa", or a full instagram.com URL.
 */
export function buildInstagramLink(raw?: string | null): string | null {
  const value = raw?.trim()
  if (!value) return null
  if (/^[a-z][a-z0-9+.-]*:/i.test(value) || value.startsWith('//')) return sanitizeHttpUrl(value)
  const handle = value.replace(/^@/, '')
  if (!handle || !/^[A-Za-z0-9._]+$/.test(handle)) return null
  return `https://instagram.com/${handle}`
}

/** Ensure a website string is a safe absolute http(s) URL (prefixing https:// when missing). */
export function buildWebsiteLink(raw?: string | null): string | null {
  return sanitizeHttpUrl(raw)
}
