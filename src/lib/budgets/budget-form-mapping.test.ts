import { describe, it, expect } from 'vitest'
import {
  budgetToFormValues,
  formItemsToPayload,
  toItemPayload,
  centsToReais,
} from '@/lib/budgets/budget-form-mapping'
import type { BudgetWithDetails } from '@/types/models'

/** A representative draft budget with two items (one carries its own cost preset). */
function makeBudget(): BudgetWithDetails {
  return {
    id: 'b-1',
    organization_id: 'org-1',
    name: 'Projeto X',
    description: 'desc',
    customer_id: 'cust-1',
    status: 'draft',
    profile_id: 'profile-1',
    machine_preset_id: 'machine-1',
    energy_preset_id: 'energy-1',
    cost_preset_id: 'cost-budget',
    include_energy_cost: true,
    include_waste_cost: false,
    include_machine_cost: true,
    discount_type: 'fixed',
    discount_value: 30,
    include_shipping: true,
    shipping_override: 1250, // cents
    tax_rate: null, // "usar padrão da empresa"
    delivery_days: 7,
    payment_terms: '50/50',
    notes: 'obs',
    valid_until: null,
    total_cost: 0,
    filament_cost: 0,
    waste_cost: 0,
    energy_cost: 0,
    setup_cost: 0,
    labor_cost: 0,
    overhead_cost: 0,
    profit_amount: 0,
    owner_user_id: 'u-1',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    customer: { id: 'cust-1', name: 'Cliente' },
    total_print_time_hours: 0,
    total_print_time_minutes: 0,
    total_print_time_display: '0m',
    items: [
      {
        id: 'item-1',
        budget_id: 'b-1',
        model_3d_id: 'model-1',
        product_name: 'Peça A',
        product_description: 'pa',
        product_quantity: 3,
        product_dimensions: '10x10',
        print_time_hours: 2,
        print_time_minutes: 30,
        print_time_display: '2h30m',
        cost_preset_id: 'cost-item-a', // per-item override
        setup_time_minutes: 15,
        manual_labor_minutes_total: 60,
        post_processing_minutes: 20,
        support_removal_minutes: 10,
        additional_notes: 'n1',
        filament_cost: 0,
        waste_cost: 0,
        energy_cost: 0,
        setup_cost: 0,
        manual_labor_cost: 0,
        item_total_cost: 0,
        unit_price: 0,
        order: 0,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
        filaments: [
          { filament_id: 'f-1', filament_name: 'F1', brand_name: 'B', material_name: 'PLA', color: 'Azul', color_type: 'solid', color_data: { color: '#0000ff' }, color_hex: '#0000ff', color_preview: '', quantity: 120, cost: 0, order: 5 },
          { filament_id: 'f-2', filament_name: 'F2', brand_name: 'B', material_name: 'PLA', color: 'Branco', color_type: 'solid', color_data: '{"color":"#ffffff"}', color_hex: '#ffffff', color_preview: '', quantity: 80, cost: 0, order: 2 },
        ],
      },
      {
        id: 'item-2',
        budget_id: 'b-1',
        product_name: 'Peça B',
        product_quantity: 1,
        print_time_hours: 0,
        print_time_minutes: 45,
        print_time_display: '45m',
        // no explicit cost_preset_id; embedded ref present instead
        cost_preset: { id: 'cost-item-b', name: 'Preset B' },
        setup_time_minutes: 0,
        manual_labor_minutes_total: 0,
        filament_cost: 0,
        waste_cost: 0,
        energy_cost: 0,
        setup_cost: 0,
        manual_labor_cost: 0,
        item_total_cost: 0,
        unit_price: 0,
        order: 1,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
        filaments: [
          { filament_id: 'f-3', filament_name: 'F3', brand_name: 'B', material_name: 'PETG', color: 'Preto', color_type: 'solid', color_data: { color: '#000000' }, color_hex: '#000000', color_preview: '', quantity: 50, cost: 0, order: 1 },
        ],
      },
    ],
  } as unknown as BudgetWithDetails
}

describe('budgetToFormValues', () => {
  it('maps top-level commercial fields (shipping cents→reais, tax null→undefined)', () => {
    const form = budgetToFormValues(makeBudget())
    expect(form.name).toBe('Projeto X')
    expect(form.customer_id).toBe('cust-1')
    expect(form.cost_preset_id).toBe('cost-budget')
    expect(form.discount_type).toBe('fixed')
    expect(form.discount_value).toBe(30)
    expect(form.include_shipping).toBe(true)
    expect(form.shipping_override).toBe(centsToReais(1250)) // 12.5
    expect(form.tax_rate).toBeUndefined()
    expect(form.valid_until).toBeUndefined()
  })

  it('carries each item cost_preset_id (explicit or from the embedded ref)', () => {
    const form = budgetToFormValues(makeBudget())
    expect(form.items[0].cost_preset_id).toBe('cost-item-a')
    expect(form.items[1].cost_preset_id).toBe('cost-item-b')
  })

  it('preserves minutes and model_3d_id and renumbers filament order from 1', () => {
    const form = budgetToFormValues(makeBudget())
    const item = form.items[0]
    expect(item.model_3d_id).toBe('model-1')
    expect(item.setup_time_minutes).toBe(15)
    expect(item.manual_labor_minutes_total).toBe(60)
    expect(item.post_processing_minutes).toBe(20)
    expect(item.support_removal_minutes).toBe(10)
    expect(item.filaments.map((f) => f.order)).toEqual([1, 2])
    expect(item.filaments.map((f) => f.filament_id)).toEqual(['f-1', 'f-2'])
  })
})

describe('form → payload round-trip', () => {
  it('round-trips cost_preset_id, minutes, model_3d_id and filament order', () => {
    const form = budgetToFormValues(makeBudget())
    const payload = formItemsToPayload(form.items)

    expect(payload[0].cost_preset_id).toBe('cost-item-a')
    expect(payload[1].cost_preset_id).toBe('cost-item-b')

    expect(payload[0].model_3d_id).toBe('model-1')
    expect(payload[0].setup_time_minutes).toBe(15)
    expect(payload[0].manual_labor_minutes_total).toBe(60)
    expect(payload[0].post_processing_minutes).toBe(20)
    expect(payload[0].support_removal_minutes).toBe(10)

    expect(payload[0].filaments.map((f) => f.order)).toEqual([1, 2])
    expect(payload[0].order).toBe(0)
    expect(payload[1].order).toBe(1)
  })

  it('omits cost_preset_id for a brand-new item (none carried)', () => {
    const payload = toItemPayload(
      {
        model_3d_id: undefined,
        product_name: 'Novo',
        product_description: '',
        product_quantity: 1,
        product_dimensions: '',
        print_time_hours: 0,
        print_time_minutes: 0,
        setup_time_minutes: 0,
        manual_labor_minutes_total: 0,
        post_processing_minutes: 0,
        support_removal_minutes: 0,
        additional_notes: '',
        cost_preset_id: undefined,
        filaments: [{ filament_id: 'f-9', quantity: 10, order: 1 }],
        order: 0,
      },
      0
    )
    expect(payload.cost_preset_id).toBeUndefined()
    expect(payload.product_description).toBeUndefined()
    expect(payload.filaments[0].order).toBe(1)
  })
})
