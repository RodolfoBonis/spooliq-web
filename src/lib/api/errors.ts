import { isAxiosError } from 'axios'

/**
 * Known backend error messages (English) mapped to user-facing pt-BR text.
 * Keys must match the exact `error` string returned by the API.
 */
const KNOWN_API_ERRORS: Record<string, string> = {
  'preset not found': 'Preset não encontrado ou inválido. Selecione outro preset.',
  'default presets cannot be deleted':
    'Não é possível excluir o preset padrão. Defina outro preset como padrão antes de excluir.',
  'filament not found': 'Um dos filamentos selecionados não foi encontrado. Revise os filamentos do orçamento.',
  'customer not found': 'Cliente não encontrado.',
  'only draft budgets can be edited': 'Apenas orçamentos em rascunho podem ser editados.',
  'cannot delete printing or completed budgets':
    'Não é possível excluir orçamentos em impressão ou concluídos.',
  'invalid status transition': 'Essa mudança de status não é permitida.',
}

/**
 * Extracts a user-facing message from an API error.
 * Order: per-status override → known backend message translation → raw backend message → fallback.
 */
export function getApiErrorMessage(
  error: unknown,
  fallback: string,
  byStatus: Partial<Record<number, string>> = {}
): string {
  if (!isAxiosError<{ error?: string; message?: string }>(error)) return fallback

  const status = error.response?.status
  if (status !== undefined && byStatus[status]) return byStatus[status]

  const raw = error.response?.data?.error || error.response?.data?.message
  if (!raw) return fallback

  return KNOWN_API_ERRORS[raw.toLowerCase()] ?? raw
}
