import { isAxiosError } from 'axios'

/**
 * Standardized API error body (backend v2.9.0+):
 * `{ error, message, code, fields? }`, all messages already in pt-BR.
 */
interface ApiErrorData {
  error?: string
  message?: string
  /** snake_case string on the new API; legacy HTTPError sent a numeric status here. */
  code?: string | number
  fields?: Record<string, string>
}

/** Overrides keyed by machine-readable `code` (new) or HTTP status (fallback). */
export interface ApiErrorOptions {
  byCode?: Partial<Record<string, string>>
  byStatus?: Partial<Record<number, string>>
}

function getErrorData(error: unknown): { data?: ApiErrorData; status?: number } {
  if (!isAxiosError<ApiErrorData>(error)) return {}
  return { data: error.response?.data, status: error.response?.status }
}

/**
 * Extracts a user-facing message from an API error.
 *
 * Resolution order:
 * 1. `opts.byCode[code]` — caller override for the backend's machine-readable code;
 * 2. `opts.byStatus[status]` — caller override for the HTTP status;
 * 3. `data.message` — pt-BR message from the standardized API;
 * 4. `data.error` — legacy/raw message;
 * 5. `fallback`.
 */
export function getApiErrorMessage(
  error: unknown,
  fallback: string,
  opts: ApiErrorOptions = {}
): string {
  const { data, status } = getErrorData(error)
  if (!data && status === undefined) return fallback

  const code = data?.code !== undefined ? String(data.code) : undefined
  if (code && opts.byCode?.[code]) return opts.byCode[code] as string

  if (status !== undefined && opts.byStatus?.[status]) return opts.byStatus[status] as string

  const message = typeof data?.message === 'string' ? data.message : undefined
  if (message) return message

  const raw = typeof data?.error === 'string' ? data.error : undefined
  if (raw) return raw

  return fallback
}

/**
 * Returns the field-level validation errors (`fields`) from a standardized API error,
 * or `undefined` when none are present. Use with react-hook-form's `setError`.
 */
export function getApiFieldErrors(error: unknown): Record<string, string> | undefined {
  const { data } = getErrorData(error)
  const fields = data?.fields
  if (fields && typeof fields === 'object' && Object.keys(fields).length > 0) {
    return fields
  }
  return undefined
}
