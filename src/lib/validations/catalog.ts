import { z } from 'zod'

// Brand Schema
export const brandSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  website: z.string().url('URL inválida').optional().or(z.literal('')),
  description: z.string().optional(),
})

export type BrandFormData = z.infer<typeof brandSchema>

// Material Schema
export const materialSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  description: z.string().optional(),
  properties: z.object({
    density: z.number().positive('Densidade deve ser positiva').optional(),
    print_temp_min: z.number().int('Deve ser um número inteiro').optional(),
    print_temp_max: z.number().int('Deve ser um número inteiro').optional(),
    bed_temp: z.number().int('Deve ser um número inteiro').optional(),
  }).optional(),
})

export type MaterialFormData = z.infer<typeof materialSchema>

// Filament Schema
export const filamentSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  brand_id: z.string().uuid('Selecione uma marca válida'),
  material_id: z.string().uuid('Selecione um material válido'),
  color_type: z.enum(['solid', 'gradient', 'duo', 'rainbow']),
  color_data: z.object({
    // Solid
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida').optional(),
    
    // Gradient
    from: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida').optional(),
    to: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida').optional(),
    direction: z.enum(['horizontal', 'vertical', 'diagonal']).optional(),
    
    // Duo
    primary: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida').optional(),
    secondary: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida').optional(),
    ratio: z.number().min(0).max(100).optional(),
    
    // Rainbow
    colors: z.array(z.string().regex(/^#[0-9A-Fa-f]{6}$/)).optional(),
    pattern: z.string().optional(),
  }),
  diameter: z.enum(['1.75', '2.85']),
  price_per_kg: z.number().positive('Preço deve ser positivo').multipleOf(0.01),
  stock_quantity: z.number().nonnegative('Estoque não pode ser negativo').optional(),
  min_stock_alert: z.number().nonnegative('Alerta mínimo não pode ser negativo').optional(),
  description: z.string().optional(),
})

export type FilamentFormData = z.infer<typeof filamentSchema>

