import { z } from 'zod'

// Machine Preset schema
export const machinePresetSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  description: z.string().optional(),
  waste_percentage: z.number().min(0, 'Percentual deve ser 0 ou maior').max(100, 'Percentual deve ser no máximo 100'),
  is_default: z.boolean().optional(),
})

export type MachinePresetFormData = z.infer<typeof machinePresetSchema>

// Energy Preset schema
export const energyPresetSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  kwh_cost: z.number().positive('Custo deve ser maior que zero'),
  printer_power: z.number().positive('Potência deve ser maior que zero'),
  is_default: z.boolean().optional(),
})

export type EnergyPresetFormData = z.infer<typeof energyPresetSchema>

// Cost Preset schema
export const costPresetSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  labor_cost_per_hour: z.number().min(0, 'Custo deve ser 0 ou maior'),
  profit_margin: z.number().min(0, 'Margem deve ser 0 ou maior').max(100, 'Margem deve ser no máximo 100').optional(),
  is_default: z.boolean().optional(),
})

export type CostPresetFormData = z.infer<typeof costPresetSchema>

