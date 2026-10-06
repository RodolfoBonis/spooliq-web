import { isAxiosError } from 'axios'

/**
 * Standardized API error body (backend v2.9.0+):
 * `{ error, message, code, fields? }`, all messages already in pt-BR.
 * Older responses only carry `error`/`message` in English.
 */
interface ApiErrorData {
  error?: string
  message?: string
  /** snake_case string on the new API; legacy HTTPError sent a numeric status here. */
  code?: string | number
  fields?: Record<string, string>
}

/**
 * Known backend error messages (English) mapped to user-facing pt-BR text.
 * Keys must match the exact `error`/`message` string returned by the API, lowercased.
 *
 * TODO(api-v2.9.0): remove this map once the API ships pt-BR `message` + `code` everywhere.
 */
const KNOWN_API_ERRORS: Record<string, string> = {
  'preset not found': 'Preset não encontrado ou inválido. Selecione outro preset.',
  'default presets cannot be deleted':
    'Não é possível excluir o preset padrão. Defina outro preset como padrão antes de excluir.',
  'preset template not found': 'Modelo de preset não encontrado. Atualize a página e tente novamente.',
  'invalid preset type': 'Tipo de preset inválido.',
  'profile not found': 'Perfil de impressão não encontrado.',
  'default profiles cannot be deleted':
    'Não é possível excluir o perfil padrão. Defina outro perfil como padrão antes de excluir.',
  'machine_preset_id must reference a machine preset in your organization':
    'Selecione um preset de máquina válido.',
  'energy_preset_id must reference an energy preset in your organization':
    'Selecione um preset de energia válido.',
  'cost_preset_id must reference a cost preset in your organization':
    'Selecione um preset de custo válido.',
  'filament not found': 'Um dos filamentos selecionados não foi encontrado. Revise os filamentos do orçamento.',
  'customer not found': 'Cliente não encontrado.',
  'only draft budgets can be edited': 'Apenas orçamentos em rascunho podem ser editados.',
  'cannot delete printing or completed budgets':
    'Não é possível excluir orçamentos em impressão ou concluídos.',
  'invalid status transition': 'Essa mudança de status não é permitida.',
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
 * 4. `data.error` — legacy/raw message (translated via {@link KNOWN_API_ERRORS} when known);
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
  if (message) return KNOWN_API_ERRORS[message.toLowerCase()] ?? message

  const raw = typeof data?.error === 'string' ? data.error : undefined
  if (raw) return KNOWN_API_ERRORS[raw.toLowerCase()] ?? raw

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
