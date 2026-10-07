import type { StockMovementType } from '@/types/models'

/** pt-BR labels for each stock movement type. */
export const STOCK_MOVEMENT_LABELS: Record<StockMovementType, string> = {
  purchase: 'Compra',
  adjustment: 'Ajuste',
  waste: 'Perda',
  consumption: 'Consumo',
}

/**
 * pt-BR overrides for the machine-readable error codes returned by the
 * stock-movement endpoint. Pass as `getApiErrorMessage(err, fallback, { byCode })`.
 */
export const STOCK_ERROR_BY_CODE: Record<string, string> = {
  filament_not_found: 'Filamento não encontrado.',
  invalid_movement_type: 'Tipo de movimentação inválido.',
  invalid_low_stock_threshold: 'Limite de estoque baixo inválido.',
  invalid_movement_grams: 'Quantidade em gramas inválida para este tipo de movimentação.',
}
