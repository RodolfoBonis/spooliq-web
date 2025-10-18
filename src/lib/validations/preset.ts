import { z } from 'zod'

// ✅ CORRECTED - Aligned with Backend

// Machine Preset schema
export const machinePresetSchema = z.object({
  brand: z.string().min(1).max(100).optional(),
  model: z.string().min(1).max(100).optional(),
  build_volume_x: z.number().positive('Volume X deve ser maior que zero'),
  build_volume_y: z.number().positive('Volume Y deve ser maior que zero'),
  build_volume_z: z.number().positive('Volume Z deve ser maior que zero'),
  nozzle_diameter: z.number().positive('Diâmetro do bico deve ser maior que zero'),
  layer_height_min: z.number().positive('Altura mínima de camada deve ser maior que zero'),
  layer_height_max: z.number().positive('Altura máxima de camada deve ser maior que zero'),
  print_speed_max: z.number().positive('Velocidade máxima deve ser maior que zero'),
  power_consumption: z.number().positive('Consumo de energia deve ser maior que zero'),
  bed_temperature_max: z.number().positive('Temperatura máxima da mesa deve ser maior que zero'),
  extruder_temperature_max: z.number().positive('Temperatura máxima do extrusor deve ser maior que zero'),
  filament_diameter: z.number().positive('Diâmetro do filamento deve ser maior que zero'),
  cost_per_hour: z.number().min(0, 'Custo por hora deve ser 0 ou maior'),
})

export type MachinePresetFormData = z.infer<typeof machinePresetSchema>

// Energy Preset schema
export const energyPresetSchema = z.object({
  country: z.string().min(1).max(100).optional(),
  state: z.string().min(1).max(100).optional(),
  city: z.string().min(1).max(100).optional(),
  energy_cost_per_kwh: z.number().positive('Custo por kWh deve ser maior que zero'),
  currency: z.string().length(3, 'Moeda deve ter 3 caracteres (ex: BRL, USD)'),
  provider: z.string().min(1).max(100).optional(),
  tariff_type: z.string().min(1).max(100).optional(),
  peak_hour_multiplier: z.number().positive('Multiplicador de pico deve ser maior que zero'),
  off_peak_hour_multiplier: z.number().positive('Multiplicador fora de pico deve ser maior que zero'),
})

export type EnergyPresetFormData = z.infer<typeof energyPresetSchema>

// Cost Preset schema
export const costPresetSchema = z.object({
  labor_cost_per_hour: z.number().min(0, 'Custo de mão de obra deve ser 0 ou maior'),
  packaging_cost_per_item: z.number().min(0, 'Custo de embalagem deve ser 0 ou maior'),
  shipping_cost_base: z.number().min(0, 'Custo base de envio deve ser 0 ou maior'),
  shipping_cost_per_gram: z.number().min(0, 'Custo de envio por grama deve ser 0 ou maior'),
  overhead_percentage: z.number().min(0, 'Overhead deve ser 0 ou maior').max(100, 'Overhead deve ser no máximo 100'),
  profit_margin_percentage: z.number().min(0, 'Margem de lucro deve ser 0 ou maior').max(100, 'Margem de lucro deve ser no máximo 100'),
  post_processing_cost_per_hour: z.number().min(0, 'Custo de pós-processamento deve ser 0 ou maior'),
  support_removal_cost_per_hour: z.number().min(0, 'Custo de remoção de suporte deve ser 0 ou maior'),
  quality_control_cost_per_item: z.number().min(0, 'Custo de controle de qualidade deve ser 0 ou maior'),
})

export type CostPresetFormData = z.infer<typeof costPresetSchema>

