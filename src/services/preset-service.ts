import { api } from '@/lib/api/client'
import type { MachinePreset, EnergyPreset, CostPreset } from '@/types/models'

// ✅ CORRECTED - Aligned with Backend

// Machine Presets
export interface CreateMachinePresetDTO {
  brand?: string
  model?: string
  build_volume_x: number // mm
  build_volume_y: number // mm
  build_volume_z: number // mm
  nozzle_diameter: number // mm
  layer_height_min: number // mm
  layer_height_max: number // mm
  print_speed_max: number // mm/s
  power_consumption: number // Watts
  bed_temperature_max: number // °C
  extruder_temperature_max: number // °C
  filament_diameter: number // mm (1.75 or 2.85)
  cost_per_hour: number // cents
}

export interface UpdateMachinePresetDTO extends Partial<CreateMachinePresetDTO> {}

export const machinePresetService = {
  async list(): Promise<MachinePreset[]> {
    const { data } = await api.get<MachinePreset[]>('/presets/machines')
    return data
  },

  async getById(id: string): Promise<MachinePreset> {
    const { data } = await api.get<MachinePreset>(`/presets/machines/${id}`)
    return data
  },

  async create(preset: CreateMachinePresetDTO): Promise<MachinePreset> {
    const { data } = await api.post<MachinePreset>('/presets/machines', preset)
    return data
  },

  async update(id: string, preset: UpdateMachinePresetDTO): Promise<MachinePreset> {
    const { data } = await api.put<MachinePreset>(`/presets/machines/${id}`, preset)
    return data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/presets/machines/${id}`)
  },
}

// Energy Presets
export interface CreateEnergyPresetDTO {
  country?: string
  state?: string
  city?: string
  energy_cost_per_kwh: number // cents
  currency: string // "BRL", "USD", etc (3-letter ISO code)
  provider?: string
  tariff_type?: string
  peak_hour_multiplier: number
  off_peak_hour_multiplier: number
}

export interface UpdateEnergyPresetDTO extends Partial<CreateEnergyPresetDTO> {}

export const energyPresetService = {
  async list(): Promise<EnergyPreset[]> {
    const { data } = await api.get<EnergyPreset[]>('/presets/energy')
    return data
  },

  async getById(id: string): Promise<EnergyPreset> {
    const { data } = await api.get<EnergyPreset>(`/presets/energy/${id}`)
    return data
  },

  async create(preset: CreateEnergyPresetDTO): Promise<EnergyPreset> {
    const { data } = await api.post<EnergyPreset>('/presets/energy', preset)
    return data
  },

  async update(id: string, preset: UpdateEnergyPresetDTO): Promise<EnergyPreset> {
    const { data } = await api.put<EnergyPreset>(`/presets/energy/${id}`, preset)
    return data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/presets/energy/${id}`)
  },
}

// Cost Presets
export interface CreateCostPresetDTO {
  labor_cost_per_hour: number // cents
  packaging_cost_per_item: number // cents
  shipping_cost_base: number // cents
  shipping_cost_per_gram: number // cents
  overhead_percentage: number // 0-100
  profit_margin_percentage: number // 0-100
  post_processing_cost_per_hour: number // cents
  support_removal_cost_per_hour: number // cents
  quality_control_cost_per_item: number // cents
}

export interface UpdateCostPresetDTO extends Partial<CreateCostPresetDTO> {}

export const costPresetService = {
  async list(): Promise<CostPreset[]> {
    const { data } = await api.get<CostPreset[]>('/presets/costs')
    return data
  },

  async getById(id: string): Promise<CostPreset> {
    const { data } = await api.get<CostPreset>(`/presets/costs/${id}`)
    return data
  },

  async create(preset: CreateCostPresetDTO): Promise<CostPreset> {
    const { data } = await api.post<CostPreset>('/presets/costs', preset)
    return data
  },

  async update(id: string, preset: UpdateCostPresetDTO): Promise<CostPreset> {
    const { data } = await api.put<CostPreset>(`/presets/costs/${id}`, preset)
    return data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/presets/costs/${id}`)
  },
}

