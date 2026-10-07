import { z } from 'zod'

// Budget Item Filament schema
export const budgetItemFilamentSchema = z.object({
  filament_id: z.string().uuid('Filamento inválido'),
  quantity: z.number().positive('Quantidade deve ser maior que zero'),
  order: z.number().min(0),
})

// Budget Item schema
export const budgetItemSchema = z.object({
  model_3d_id: z.string().uuid().optional(),
  product_name: z.string().min(3, 'Nome do produto deve ter no mínimo 3 caracteres'),
  product_description: z.string().optional(),
  product_quantity: z.number().positive('Quantidade deve ser maior que zero'),
  product_dimensions: z.string().optional(),
  print_time_hours: z.number().min(0, 'Horas devem ser 0 ou mais'),
  print_time_minutes: z.number().min(0, 'Minutos devem ser 0 ou mais').max(59, 'Minutos devem ser no máximo 59'),
  setup_time_minutes: z.number().min(0, 'Tempo de setup deve ser 0 ou mais'),
  manual_labor_minutes_total: z.number().min(0, 'Tempo de mão de obra deve ser 0 ou mais'),
  post_processing_minutes: z.number().min(0, 'Tempo de pós-processamento deve ser 0 ou mais').optional(),
  support_removal_minutes: z.number().min(0, 'Tempo de remoção de suporte deve ser 0 ou mais').optional(),
  additional_notes: z.string().optional(),
  filaments: z.array(budgetItemFilamentSchema).min(1, 'Adicione pelo menos um filamento'),
  order: z.number().min(0),
})

// Create Budget schema (base object; `createBudgetSchema` adds cross-field refinement)
export const createBudgetObject = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  description: z.string().optional(),
  customer_id: z.string().uuid('Cliente inválido'),
  profile_id: z.string().uuid().optional(),
  machine_preset_id: z.string().uuid().optional(),
  energy_preset_id: z.string().uuid().optional(),
  cost_preset_id: z.string().uuid().optional(), // budget-level: labor rate, overhead and margin for every item
  include_energy_cost: z.boolean(),
  include_waste_cost: z.boolean(),
  // Phase 4A "Preço final" controls. `discount_type: 'none'` is a form-only value
  // meaning "no discount" (mapped to null/omitted when the payload is built).
  include_machine_cost: z.boolean(),
  discount_type: z.enum(['none', 'percent', 'fixed']),
  // In REAIS when fixed, percent (0-100) when percent. Optional/undefined when disabled.
  discount_value: z.number().min(0, 'Valor do desconto deve ser 0 ou mais').optional(),
  include_shipping: z.boolean(),
  // Manual shipping override in REAIS (converted to cents in the payload). Optional.
  shipping_override: z.number().min(0, 'Valor do frete deve ser 0 ou mais').optional(),
  // Tax rate (%). Undefined means "use the company default".
  tax_rate: z
    .number()
    .min(0, 'Alíquota deve ser 0 ou mais')
    .max(99.99, 'Alíquota deve ser no máximo 99,99%')
    .optional(),
  delivery_days: z.number().positive().optional(),
  payment_terms: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(budgetItemSchema).min(1, 'Adicione pelo menos um item'),
})

export const createBudgetSchema = createBudgetObject.superRefine((data, ctx) => {
  if (data.discount_type !== 'none') {
    if (data.discount_value === undefined || data.discount_value <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['discount_value'],
        message: 'Informe o valor do desconto',
      })
    } else if (data.discount_type === 'percent' && data.discount_value > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['discount_value'],
        message: 'Percentual deve ser no máximo 100%',
      })
    }
  }
})

// Update Budget schema (all fields optional)
export const updateBudgetSchema = createBudgetObject.partial()

// Update Status schema
export const updateBudgetStatusSchema = z.object({
  status: z.enum(['sent', 'approved', 'rejected', 'printing', 'completed']),
  notes: z.string().optional(),
})

// Export types
export type BudgetItemFilamentFormData = z.infer<typeof budgetItemFilamentSchema>
export type BudgetItemFormData = z.infer<typeof budgetItemSchema>
export type CreateBudgetFormData = z.infer<typeof createBudgetSchema>
export type UpdateBudgetFormData = z.infer<typeof updateBudgetSchema>
export type UpdateBudgetStatusFormData = z.infer<typeof updateBudgetStatusSchema>

