import type { PaginatedResponse } from '@/types/api'

/**
 * Transition-tolerant pagination helpers.
 *
 * The backend is being standardized so that EVERY collection endpoint returns
 * `{ data, total, page, page_size, total_pages }`. The web is deployed BEFORE the API,
 * so these helpers must accept BOTH the new shape and every legacy shape still in flight.
 */

/** Legacy wrapper keys that used to hold the collection payload. */
const LEGACY_DATA_KEYS = [
  'companies',
  'payments',
  'subscriptions',
  'plans',
  'entries',
  'activities',
  'logs',
  'payment_methods',
  'templates',
] as const

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function asFiniteNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

function extractData<T>(raw: Record<string, unknown>, fallbackKey?: string): T[] {
  if (Array.isArray(raw.data)) return raw.data as T[]
  if (fallbackKey && Array.isArray(raw[fallbackKey])) return raw[fallbackKey] as T[]
  for (const key of LEGACY_DATA_KEYS) {
    if (Array.isArray(raw[key])) return raw[key] as T[]
  }
  return []
}

/**
 * Normalizes any collection response into `{ data, total, page, pageSize, totalPages }`.
 *
 * Accepts:
 * - a raw array (`T[]`);
 * - the new envelope (`{ data, total, page, page_size, total_pages }`);
 * - legacy wrappers (`{ companies }`, `{ payments }`, `{ plans }`, `{ entries }`,
 *   `{ activities }`, `{ logs }`, `{ payment_methods }`, `{ templates }`, ...);
 * - `total` or `total_count`/`totalCount`.
 *
 * Missing values are computed from what is available.
 *
 * @param raw Raw response body from the API.
 * @param fallbackKey Optional wrapper key to look at before the known legacy keys.
 */
export function toPage<T>(raw: unknown, fallbackKey?: string): PaginatedResponse<T> {
  if (Array.isArray(raw)) {
    const data = raw as T[]
    return { data, total: data.length, page: 1, pageSize: data.length, totalPages: 1 }
  }

  if (!isRecord(raw)) {
    return { data: [], total: 0, page: 1, pageSize: 0, totalPages: 1 }
  }

  const data = extractData<T>(raw, fallbackKey)

  const total =
    asFiniteNumber(raw.total) ??
    asFiniteNumber(raw.total_count) ??
    asFiniteNumber(raw.totalCount) ??
    data.length

  const page = asFiniteNumber(raw.page) ?? 1

  const pageSizeRaw =
    asFiniteNumber(raw.page_size) ?? asFiniteNumber(raw.pageSize) ?? asFiniteNumber(raw.limit)
  const pageSize = pageSizeRaw && pageSizeRaw > 0 ? pageSizeRaw : data.length || total || 0

  const totalPages =
    asFiniteNumber(raw.total_pages) ??
    asFiniteNumber(raw.totalPages) ??
    (pageSize > 0 ? Math.max(1, Math.ceil(total / pageSize)) : 1)

  return { data, total, page, pageSize, totalPages }
}

/** Filters accepted by {@link buildListParams} beyond the common pagination/search keys. */
export type ListParamValue = string | number | boolean | undefined

export interface ListParams {
  page?: number
  pageSize?: number
  /** Free-text query. Sent as both `q` (new) and `search` (legacy). */
  q?: string
  [key: string]: ListParamValue
}

/**
 * Builds a transition-tolerant query-param object for a collection request.
 *
 * Sends the NEW contract (`page`, `page_size`, `q`) plus the aliases the current API still
 * expects (`pageSize`/`limit` for size, `search` for the query), so a single call works
 * against both the current and the standardized backend. Extra keys (e.g. `status`,
 * `customer_id`, `from`, `to`) are forwarded as-is when defined and non-empty.
 */
export function buildListParams(params: ListParams): Record<string, string> {
  const { page, pageSize, q, ...filters } = params
  const out: Record<string, string> = {}

  if (page !== undefined) out.page = String(page)

  if (pageSize !== undefined) {
    out.page_size = String(pageSize)
    out.pageSize = String(pageSize)
    out.limit = String(pageSize)
  }

  if (q !== undefined && q !== '') {
    out.q = q
    out.search = q
  }

  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== '') out[key] = String(value)
  }

  return out
}
