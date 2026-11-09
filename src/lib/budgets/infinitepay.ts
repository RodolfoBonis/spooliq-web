/**
 * Security guard for InfinitePay redirect URLs.
 *
 * The public payment flow sends the customer to a `checkout_url` returned by the API.
 * We only ever redirect the browser to it when it is an https URL whose host is
 * `infinitepay.io` or a subdomain of it. The suffix check is anchored on a dot
 * boundary so look-alike hosts such as `evil-infinitepay.io` are rejected.
 */
export function isInfinitePayCheckoutUrl(raw: string | null | undefined): boolean {
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
