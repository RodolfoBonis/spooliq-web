import { z } from 'zod'

// Brand Schema
export const brandSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  description: z.string().optional(),
})

export const createBrandSchema = brandSchema
export const updateBrandSchema = brandSchema.partial()

export type BrandFormData = z.infer<typeof brandSchema>

// Material Schema
export const materialSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  description: z.string().optional(),
  tempTable: z.number().min(0).max(300, 'Temperatura máxima: 300°C').optional(),
  tempExtruder: z.number().min(0).max(500, 'Temperatura máxima: 500°C').optional(),
})

export const createMaterialSchema = materialSchema
export const updateMaterialSchema = materialSchema.partial()

export type MaterialFormData = z.infer<typeof materialSchema>

// Filament Schema
export const filamentSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  brand_id: z.string().uuid('Selecione uma marca válida'),
  material_id: z.string().uuid('Selecione um material válido'),
  color: z.string().min(1, 'Nome da cor é obrigatório'),
  color_type: z.enum(['solid', 'gradient', 'duo', 'rainbow']),
  color_data: z.object({
    // Solid
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida').optional(),
    
    // Gradient
    direction: z.string().optional(), // CSS direction like "90deg"
    colors: z.array(z.object({
      color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida'),
      position: z.number().min(0).max(100),
    })).optional(),
    
    // Duo
    primary: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida').optional(),
    secondary: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida').optional(),
    pattern: z.enum(['stripes', 'spots', 'random', 'marbled']).optional(),
    ratio: z.number().min(0.1).max(0.9).optional(),
    
    // Rainbow
    intensity: z.number().min(0.1).max(1.0).optional(),
    saturation: z.number().min(0.1).max(1.0).optional(),
    repetitions: z.number().min(1).max(10).optional(),
  }),
  diameter: z.union([z.literal(1.75), z.literal(2.85)]),
  price_per_kg: z.number().positive('Preço deve ser positivo'),
  description: z.string().optional(),
})

export const createFilamentSchema = filamentSchema
export const updateFilamentSchema = filamentSchema.partial()

export type FilamentFormData = z.infer<typeof filamentSchema>

