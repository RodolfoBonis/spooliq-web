import { z } from 'zod'

// Budget Item Filament schema
export const budgetItemFilamentSchema = z.object({
  filament_id: z.string().uuid('Filamento inválido'),
  quantity: z.number().positive('Quantidade deve ser maior que zero'),
  order: z.number().min(0),
})

// Budget Item schema
export const budgetItemSchema = z.object({
  product_name: z.string().min(3, 'Nome do produto deve ter no mínimo 3 caracteres'),
  product_description: z.string().optional(),
  product_quantity: z.number().positive('Quantidade deve ser maior que zero'),
  product_dimensions: z.string().optional(),
  print_time_hours: z.number().min(0, 'Horas devem ser 0 ou mais'),
  print_time_minutes: z.number().min(0, 'Minutos devem ser 0 ou mais').max(59, 'Minutos devem ser no máximo 59'),
  setup_time_minutes: z.number().min(0, 'Tempo de setup deve ser 0 ou mais'),
  manual_labor_minutes_total: z.number().min(0, 'Tempo de mão de obra deve ser 0 ou mais'),
  additional_notes: z.string().optional(),
  filaments: z.array(budgetItemFilamentSchema).min(1, 'Adicione pelo menos um filamento'),
  order: z.number().min(0),
})

// Create Budget schema
export const createBudgetSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  description: z.string().optional(),
  customer_id: z.string().uuid('Cliente inválido'),
  profile_id: z.string().uuid().optional(),
  machine_preset_id: z.string().uuid().optional(),
  energy_preset_id: z.string().uuid().optional(),
  cost_preset_id: z.string().uuid().optional(), // budget-level: labor rate, overhead and margin for every item
  include_energy_cost: z.boolean(),
  include_waste_cost: z.boolean(),
  delivery_days: z.number().positive().optional(),
  payment_terms: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(budgetItemSchema).min(1, 'Adicione pelo menos um item'),
})

// Update Budget schema (all fields optional)
export const updateBudgetSchema = createBudgetSchema.partial()

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

