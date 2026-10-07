import type { DeepPartialSkipArrayKey } from 'react-hook-form'
import type { CreateBudgetFormData } from '@/lib/validations/budget'
import type { CreateBudgetDTO, PreviewBudgetDTO } from '@/services/budget-service'
import { endOfDayISO } from '@/lib/utils/format'

type WatchedBudgetForm = DeepPartialSkipArrayKey<CreateBudgetFormData>

/**
 * Budget-level pricing fields shared by create and preview payloads.
 *
 * All keys are required (not optional) so that spreading this over the raw form
 * values fully overrides the form-only `discount_type: 'none'` placeholder.
 */
type BudgetPricingPayload = {
  include_machine_cost: boolean
  discount_type: NonNullable<CreateBudgetDTO['discount_type']> | null
  discount_value: number | undefined
  include_shipping: boolean
  shipping_override: number | null
  tax_rate: number | null
}

/**
 * Update-time pricing payload. Unlike the create/preview payload, every nullable
 * field is sent *explicitly* so the API applies the documented clear semantics:
 *
 * | Field                         | `null` means                         |
 * |-------------------------------|--------------------------------------|
 * | `tax_rate`                    | clear → use the company default      |
 * | `discount_type`/`value`       | either `null` clears BOTH            |
 * | `shipping_override`           | clear the manual override (cents)    |
 * | `valid_until`                 | clear the validity date              |
 *
 * `discount_value` is therefore widened to allow `null` (vs. `undefined` on create).
 */
export type BudgetUpdatePricingPayload = {
  include_machine_cost: boolean
  discount_type: NonNullable<CreateBudgetDTO['discount_type']> | null
  discount_value: number | null
  include_shipping: boolean
  shipping_override: number | null
  tax_rate: number | null
  valid_until: string | null
}

/** Non-negative integer from a possibly empty/NaN input value. */
function toWholeNumber(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? Math.floor(value) : 0
}

function toPositiveNumber(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : 0
}

/** Finite number (including 0) or undefined. */
function toFiniteNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

/** Reais → integer cents (used for the manual shipping override input). */
export function reaisToCents(reais: number): number {
  return Math.round(reais * 100)
}

/**
 * Maps the form's "Preço final" controls to the API pricing fields, shared by the
 * server preview and the final create payload so both stay in sync.
 *
 * - `discount_type: 'none'` (form-only) → no discount (`null`, value omitted);
 * - `shipping_override` is entered in REAIS and converted to cents here;
 * - `tax_rate` left blank means "use the company default" → `null`.
 */
export function buildBudgetPricingPayload(values: WatchedBudgetForm): BudgetPricingPayload {
  const discountType = values.discount_type && values.discount_type !== 'none' ? values.discount_type : null
  const rawDiscount = discountType ? toPositiveNumber(values.discount_value) : undefined
  // Preview only: omit values the API would reject (form zod blocks submit anyway).
  const discountValue = discountType === 'percent' && rawDiscount !== undefined && rawDiscount > 100 ? undefined : rawDiscount

  const includeShipping = values.include_shipping ?? false
  const overrideReais = toFiniteNumber(values.shipping_override)
  const shippingOverride =
    includeShipping && overrideReais !== undefined && overrideReais > 0 ? reaisToCents(overrideReais) : null

  const rawTax = toFiniteNumber(values.tax_rate)
  const taxRate = rawTax !== undefined && rawTax >= 0 && rawTax <= 99.99 ? rawTax : undefined

  return {
    include_machine_cost: values.include_machine_cost ?? true,
    discount_type: discountType,
    discount_value: discountValue,
    include_shipping: includeShipping,
    shipping_override: shippingOverride,
    tax_rate: taxRate ?? null,
  }
}

/**
 * Builds the nullable pricing fields for `PUT /budgets/:id` from the edit form.
 *
 * Reuses {@link buildBudgetPricingPayload} for the shared reais→cents / percent /
 * tax-default math, then makes the "clear" intents explicit so the API applies the
 * documented update contract:
 * - "Sem desconto" → `discount_type` AND `discount_value` both `null` (clears both);
 * - "Usar padrão da empresa" (tax blank) → `tax_rate: null`;
 * - shipping without a manual override → `shipping_override: null`;
 * - empty validity → `valid_until: null`.
 */
export function buildBudgetUpdatePayload(values: WatchedBudgetForm): BudgetUpdatePricingPayload {
  const pricing = buildBudgetPricingPayload(values)
  // When no discount type is active, clear the value too (null, not undefined) so
  // the API drops any previously stored discount. With a type set, an invalid/absent
  // value falls back to null — the edit form's zod guards this before submit.
  const discountValue = pricing.discount_type === null ? null : pricing.discount_value ?? null

  return {
    include_machine_cost: pricing.include_machine_cost,
    discount_type: pricing.discount_type,
    discount_value: discountValue,
    include_shipping: pricing.include_shipping,
    shipping_override: pricing.shipping_override,
    tax_rate: pricing.tax_rate,
    valid_until: endOfDayISO(values.valid_until) ?? null,
  }
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
      model_3d_id: item.model_3d_id || undefined,
      product_name: item.product_name?.trim() || `Item #${index + 1}`,
      product_quantity: Math.max(1, toWholeNumber(item.product_quantity)),
      print_time_hours: toWholeNumber(item.print_time_hours),
      print_time_minutes: Math.min(59, toWholeNumber(item.print_time_minutes)),
      setup_time_minutes: toWholeNumber(item.setup_time_minutes),
      manual_labor_minutes_total: toWholeNumber(item.manual_labor_minutes_total),
      post_processing_minutes: toWholeNumber(item.post_processing_minutes),
      support_removal_minutes: toWholeNumber(item.support_removal_minutes),
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
    ...buildBudgetPricingPayload(values),
    items,
  }
}
