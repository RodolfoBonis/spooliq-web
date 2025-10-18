import { api } from '@/lib/api/client'
import type { MachinePreset, EnergyPreset, CostPreset } from '@/types/models'

// Machine Presets
export interface CreateMachinePresetDTO {
  name: string
  description?: string
  waste_percentage: number // AMS waste % (e.g., 15 for 15%)
  is_default?: boolean
}

export interface UpdateMachinePresetDTO extends Partial<CreateMachinePresetDTO> {}

export const machinePresetService = {
  async list(): Promise<{ presets: MachinePreset[] }> {
    const { data } = await api.get<{ data: MachinePreset[] }>('/presets/machines')
    return { presets: data.data }
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
  name: string
  kwh_cost: number // Cost per kWh in cents
  printer_power: number // Power in Watts
  is_default?: boolean
}

export interface UpdateEnergyPresetDTO extends Partial<CreateEnergyPresetDTO> {}

export const energyPresetService = {
  async list(): Promise<{ presets: EnergyPreset[] }> {
    const { data } = await api.get<{ data: EnergyPreset[] }>('/presets/energy')
    return { presets: data.data }
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
  name: string
  labor_cost_per_hour: number // Labor cost per hour in cents
  profit_margin?: number // Profit margin %
  is_default?: boolean
}

export interface UpdateCostPresetDTO extends Partial<CreateCostPresetDTO> {}

export const costPresetService = {
  async list(): Promise<{ presets: CostPreset[] }> {
    const { data } = await api.get<{ data: CostPreset[] }>('/presets/costs')
    return { presets: data.data }
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

