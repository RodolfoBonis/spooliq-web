import { isoToDateInput } from '@/lib/utils/format'
import type { CreateBudgetFormData } from '@/lib/validations/budget'
import type { CreateBudgetItemDTO } from '@/services/budget-service'
import type { BudgetWithDetails, Filament } from '@/types/models'

/** Shipping override is stored in CENTS by the API but edited in REAIS in the form. */
export function centsToReais(cents: number): number {
  return cents / 100
}

/** Trim a string and collapse empties to undefined (so optional API fields are omitted). */
function trimmedOrUndefined(value?: string): string | undefined {
  return value && value.trim() ? value : undefined
}

/**
 * Map the detail response into the edit form's default values. Pure inverse of
 * {@link formItemsToPayload} + `buildBudgetUpdatePayload` for the fields the form owns.
 */
export function budgetToFormValues(budget: BudgetWithDetails): CreateBudgetFormData {
  return {
    name: budget.name,
    description: budget.description ?? '',
    customer_id: budget.customer_id,
    // Prefer the explicit id, falling back to the embedded preset refs.
    profile_id: budget.profile_id ?? budget.profile?.id ?? undefined,
    machine_preset_id: budget.machine_preset_id ?? budget.machine_preset?.id ?? undefined,
    energy_preset_id: budget.energy_preset_id ?? budget.energy_preset?.id ?? undefined,
    cost_preset_id: budget.cost_preset_id ?? budget.cost_preset?.id ?? undefined,
    include_energy_cost: budget.include_energy_cost,
    include_waste_cost: budget.include_waste_cost,
    include_machine_cost: budget.include_machine_cost ?? true,
    // `none` is the form-only placeholder for "no discount".
    discount_type: budget.discount_type ?? 'none',
    // Already REAIS for fixed / percent for percent (see Budget.discount_value).
    discount_value: budget.discount_value ?? undefined,
    include_shipping: budget.include_shipping ?? false,
    // Cents → reais for the input; the submit converts back.
    shipping_override:
      budget.shipping_override != null ? centsToReais(budget.shipping_override) : undefined,
    // null → undefined means "usar padrão da empresa".
    tax_rate: budget.tax_rate ?? undefined,
    delivery_days: budget.delivery_days ?? undefined,
    payment_terms: budget.payment_terms ?? '',
    notes: budget.notes ?? '',
    // ISO datetime → local YYYY-MM-DD for the date input.
    valid_until: isoToDateInput(budget.valid_until) || undefined,
    items: budget.items.map((item, index) => ({
      model_3d_id: item.model_3d_id ?? undefined,
      product_name: item.product_name,
      product_description: item.product_description ?? '',
      product_quantity: item.product_quantity,
      product_dimensions: item.product_dimensions ?? '',
      print_time_hours: item.print_time_hours,
      print_time_minutes: item.print_time_minutes,
      setup_time_minutes: item.setup_time_minutes ?? 0,
      manual_labor_minutes_total: item.manual_labor_minutes_total ?? 0,
      post_processing_minutes: item.post_processing_minutes ?? 0,
      support_removal_minutes: item.support_removal_minutes ?? 0,
      additional_notes: item.additional_notes ?? '',
      // Hidden passthrough so editing never silently changes an item's own pricing.
      cost_preset_id: item.cost_preset_id ?? item.cost_preset?.id ?? undefined,
      filaments: item.filaments.map((f, i) => ({
        filament_id: f.filament_id,
        quantity: f.quantity,
        order: i + 1,
      })),
      order: index,
    })),
  }
}

/**
 * Map a single form item to the API item DTO. Used by the edit submit (items are
 * replaced as a whole); filament `order` is renumbered from 1 as the API requires.
 */
export function toItemPayload(
  item: CreateBudgetFormData['items'][number],
  index: number
): CreateBudgetItemDTO {
  return {
    model_3d_id: item.model_3d_id || undefined,
    product_name: item.product_name,
    product_description: trimmedOrUndefined(item.product_description),
    product_quantity: item.product_quantity,
    product_dimensions: trimmedOrUndefined(item.product_dimensions),
    print_time_hours: item.print_time_hours,
    print_time_minutes: item.print_time_minutes,
    setup_time_minutes: item.setup_time_minutes,
    manual_labor_minutes_total: item.manual_labor_minutes_total,
    post_processing_minutes: item.post_processing_minutes ?? 0,
    support_removal_minutes: item.support_removal_minutes ?? 0,
    additional_notes: trimmedOrUndefined(item.additional_notes),
    // Preserve the item's own cost preset (or omit so the budget-level preset applies).
    cost_preset_id: item.cost_preset_id || undefined,
    filaments: item.filaments.map((f, i) => ({
      filament_id: f.filament_id,
      quantity: f.quantity,
      order: i + 1,
    })),
    order: index,
  }
}

/** Map all form items to API item DTOs (index-ordered). */
export function formItemsToPayload(items: CreateBudgetFormData['items']): CreateBudgetItemDTO[] {
  return items.map(toItemPayload)
}

/**
 * Seed the filament lookup so the form renders names/colors for the budget's
 * pre-selected filaments without re-fetching each one. The detail response already
 * embeds the display fields the form reads. Only those display fields are populated.
 */
export function budgetToSelectedFilaments(budget: BudgetWithDetails): Record<string, Filament> {
  const map: Record<string, Filament> = {}
  for (const item of budget.items) {
    for (const f of item.filaments) {
      let colorData = f.color_data
      if (typeof colorData === 'string') {
        try {
          colorData = JSON.parse(colorData)
        } catch {
          colorData = {}
        }
      }
      map[f.filament_id] = {
        id: f.filament_id,
        name: f.filament_name,
        brand_name: f.brand_name,
        material_name: f.material_name,
        color: f.color,
        color_type: f.color_type,
        color_data: colorData,
        color_hex: f.color_hex,
      } as Filament
    }
  }
  return map
}
