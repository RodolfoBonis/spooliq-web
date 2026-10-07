/**
 * Normalize a Brazilian phone number into the digits-only form wa.me expects.
 * Strips non-digits and prefixes the country code `55` when it is missing.
 * Returns null when there is no usable number.
 */
export function normalizeWhatsappNumber(raw?: string | null): string | null {
  if (!raw) return null
  let digits = raw.replace(/\D/g, '')
  if (!digits) return null
  if (!digits.startsWith('55')) digits = `55${digits}`
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
 * Build a normalized Instagram profile URL from a handle or URL.
 * Accepts "@empresa", "empresa", or a full instagram.com URL.
 */
export function buildInstagramLink(raw?: string | null): string | null {
  if (!raw) return null
  const value = raw.trim()
  if (!value) return null
  if (/^https?:\/\//i.test(value)) return value
  const handle = value.replace(/^@/, '')
  if (!handle) return null
  return `https://instagram.com/${handle}`
}

/** Ensure a website string is an absolute URL (prefixing https:// when missing). */
export function buildWebsiteLink(raw?: string | null): string | null {
  if (!raw) return null
  const value = raw.trim()
  if (!value) return null
  return /^https?:\/\//i.test(value) ? value : `https://${value}`
}
