import type { DeepPartialSkipArrayKey } from 'react-hook-form'
import type { CreateBudgetFormData } from '@/lib/validations/budget'
import type { PreviewBudgetDTO } from '@/services/budget-service'

type WatchedBudgetForm = DeepPartialSkipArrayKey<CreateBudgetFormData>

/** Non-negative integer from a possibly empty/NaN input value. */
function toWholeNumber(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? Math.floor(value) : 0
}

function toPositiveNumber(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : 0
}

/**
 * Builds the `POST /budgets/preview` body from the (partial, in-progress) form values.
 *
 * Only items that already have at least one filament with a positive quantity are sent;
 * returns `null` when no item is ready, so no request is made. Each item's `order` is its
 * index in the form, which the API echoes back so results can be matched to form items.
 */
export function buildBudgetPreviewPayload(values: WatchedBudgetForm): PreviewBudgetDTO | null {
  const items: PreviewBudgetDTO['items'] = []

  ;(values.items ?? []).forEach((item, index) => {
    if (!item) return
    const filaments = (item.filaments ?? [])
      .filter((f): f is { filament_id: string; quantity: number } =>
        !!f?.filament_id && toPositiveNumber(f.quantity) > 0
      )
      .map((f, i) => ({ filament_id: f.filament_id, quantity: f.quantity, order: i + 1 }))

    if (filaments.length === 0) return

    items.push({
      product_name: item.product_name?.trim() || `Item #${index + 1}`,
      product_quantity: Math.max(1, toWholeNumber(item.product_quantity)),
      print_time_hours: toWholeNumber(item.print_time_hours),
      print_time_minutes: Math.min(59, toWholeNumber(item.print_time_minutes)),
      setup_time_minutes: toWholeNumber(item.setup_time_minutes),
      manual_labor_minutes_total: toWholeNumber(item.manual_labor_minutes_total),
      filaments,
      order: index,
    })
  })

  if (items.length === 0) return null

  return {
    profile_id: values.profile_id || undefined,
    machine_preset_id: values.machine_preset_id || undefined,
    energy_preset_id: values.energy_preset_id || undefined,
    cost_preset_id: values.cost_preset_id || undefined,
    customer_id: values.customer_id || undefined,
    include_energy_cost: values.include_energy_cost ?? true,
    include_waste_cost: values.include_waste_cost ?? true,
    items,
  }
}
