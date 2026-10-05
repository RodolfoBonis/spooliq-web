import { api } from '@/lib/api/client'
import type {
  MachinePreset,
  EnergyPreset,
  CostPreset,
  PresetTemplate,
  PresetType,
} from '@/types/models'

// ✅ CORRECTED - Aligned with Backend

/** Fields accepted by `POST /presets/suggest-name` (only the ones relevant to `type` are used). */
export interface SuggestPresetNameDTO {
  type: PresetType
  // Machine
  brand?: string
  model?: string
  nozzle_diameter?: number
  // Energy
  provider?: string
  city?: string
  state?: string
  energy_cost_per_kwh?: number
  // Cost
  labor_cost_per_hour?: number
  profit_margin_percentage?: number
}

export interface CreateFromTemplateDTO {
  name?: string
  is_default?: boolean
}

/** Shape of a preset after a generic action (default, duplicate, from-template). */
export interface PresetSummary {
  id: string
  name: string
  type: PresetType
  is_default: boolean
}

// Actions shared by every preset type
export const presetService = {
  async suggestName(input: SuggestPresetNameDTO): Promise<string> {
    const { data } = await api.post<{ name?: string }>('/presets/suggest-name', input)
    return data.name ?? ''
  },

  async listTemplates(type: PresetType): Promise<PresetTemplate[]> {
    const { data } = await api.get<PresetTemplate[]>('/presets/templates', { params: { type } })
    return data ?? []
  },

  async createFromTemplate(key: string, overrides: CreateFromTemplateDTO = {}): Promise<PresetSummary> {
    const { data } = await api.post<PresetSummary>(
      `/presets/from-template/${encodeURIComponent(key)}`,
      overrides
    )
    return data
  },

  async setDefault(id: string): Promise<PresetSummary> {
    const { data } = await api.post<PresetSummary>(`/presets/${id}/default`)
    return data
  },

  async duplicate(id: string): Promise<PresetSummary> {
    const { data } = await api.post<PresetSummary>(`/presets/${id}/duplicate`)
    return data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/presets/${id}`)
  },
}

// Machine Presets
export interface CreateMachinePresetDTO {
  name?: string // Optional - the API auto-generates a name when omitted
  description?: string // Optional description
  is_default?: boolean // Whether this is a default preset
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
  bed_temperature_max?: number // °C
  extruder_temperature_max?: number // °C
  filament_diameter?: number // mm (1.75 or 2.85)
  cost_per_hour?: number // reais
}

export type UpdateMachinePresetDTO = Partial<CreateMachinePresetDTO>

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
    // The API exposes a single delete route for every preset type
    await api.delete(`/presets/${id}`)
  },
}

// Energy Presets
export interface CreateEnergyPresetDTO {
  name?: string // Optional - the API auto-generates a name when omitted
  description?: string // Optional description
  is_default?: boolean // Whether this is a default preset
  country?: string
  state?: string
  city?: string
  energy_cost_per_kwh: number // reais
  currency: string // "BRL", "USD", etc (3-letter ISO code)
  provider?: string
  tariff_type?: string
  peak_hour_multiplier?: number
  off_peak_hour_multiplier?: number
}

export type UpdateEnergyPresetDTO = Partial<CreateEnergyPresetDTO>

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
    // The API exposes a single delete route for every preset type
    await api.delete(`/presets/${id}`)
  },
}

// Cost Presets
export interface CreateCostPresetDTO {
  name?: string // Optional - the API auto-generates a name when omitted
  description?: string // Optional description
  is_default?: boolean // Whether this is a default preset
  labor_cost_per_hour?: number // reais
  packaging_cost_per_item?: number // reais
  shipping_cost_base?: number // reais
  shipping_cost_per_gram?: number // reais
  overhead_percentage?: number // 0-100
  profit_margin_percentage?: number // 0-1000
  post_processing_cost_per_hour?: number // reais
  support_removal_cost_per_hour?: number // reais
  quality_control_cost_per_item?: number // reais
}

export type UpdateCostPresetDTO = Partial<CreateCostPresetDTO>

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
    // The API exposes a single delete route for every preset type
    await api.delete(`/presets/${id}`)
  },
}

