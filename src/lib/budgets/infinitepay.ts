/**
 * Security guard for InfinitePay URLs (checkout redirects and receipt links).
 *
 * A URL is trusted only when it is an https URL whose host is `infinitepay.io` or a
 * subdomain of it. `new URL` is used for parsing so userinfo tricks like
 * `https://infinitepay.io@evil.com` resolve to their real host (`evil.com`) and are
 * rejected. The suffix check is anchored on a dot boundary, so look-alikes such as
 * `evil-infinitepay.io` or a trailing-dot FQDN (`infinitepay.io.`) are rejected too.
 * Matching is case-insensitive and port-agnostic.
 */
export function isInfinitePayUrl(raw: string | null | undefined): boolean {
  if (!raw) return false
  let url: URL
  try {
    url = new URL(raw)
  } catch {
    return false
  }
  if (url.protocol !== 'https:') return false
  const host = url.hostname.toLowerCase()
  return host === 'infinitepay.io' || host.endsWith('.infinitepay.io')
}

/** The host of a URL, lowercased, or `'desconhecido'` when it cannot be parsed. */
export function urlHostForLog(raw: string | null | undefined): string {
  if (!raw) return 'desconhecido'
  try {
    return new URL(raw).host.toLowerCase()
  } catch {
    return 'desconhecido'
  }
}
