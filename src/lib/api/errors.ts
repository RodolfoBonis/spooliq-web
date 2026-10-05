import { isAxiosError } from 'axios'

/**
 * Known backend error messages (English) mapped to user-facing pt-BR text.
 * Keys must match the exact `error` string returned by the API.
 */
// Some API errors are already in pt-BR (e.g. "este preset está em uso por um perfil de
// impressão..." and default-conflict 409s) and are shown as-is.
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
