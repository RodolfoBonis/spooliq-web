import apiClient from '@/lib/api-client'
import {
  EnergyPreset,
  MachinePreset,
  CostPreset,
  MarginPreset,
  CreateEnergyPresetRequest,
  CreateMachinePresetRequest,
  CreateCostPresetRequest,
  CreateMarginPresetRequest,
  UpdatePresetRequest
} from '@/types/api'

export class PresetService {
  // Energy Presets
  static async getEnergyPresets(location?: string): Promise<EnergyPreset[]> {
    const params = location ? `?location=${encodeURIComponent(location)}` : ''
    const response = await apiClient.get<any>(`/presets/energy${params}`)
    return response.presets || response.energy_presets || response.data || []
  }

  static async getEnergyLocations(): Promise<string[]> {
    const response = await apiClient.get<any>('/presets/energy/locations')
    return response.locations || response.data || []
  }

  // Machine Presets
  static async getMachinePresets(): Promise<MachinePreset[]> {
    const response = await apiClient.get<any>('/presets/machines')
    return response.machines || response.machine_presets || response.presets || response.data || []
  }

  // Cost Presets
  static async getCostPresets(): Promise<CostPreset[]> {
    const response = await apiClient.get<any>('/presets/cost')
    return response.cost_presets || response.presets || response.data || []
  }

  // Margin Presets
  static async getMarginPresets(): Promise<MarginPreset[]> {
    const response = await apiClient.get<any>('/presets/margin')
    return response.margin_presets || response.presets || response.data || []
  }

  // Admin operations
  static async createPreset(
    type: 'energy' | 'machine' | 'cost' | 'margin',
    data: CreateEnergyPresetRequest | CreateMachinePresetRequest | CreateCostPresetRequest | CreateMarginPresetRequest
  ): Promise<EnergyPreset | MachinePreset | CostPreset | MarginPreset> {
    return apiClient.post<EnergyPreset | MachinePreset | CostPreset | MarginPreset>(`/presets?type=${type}`, data)
  }

  static async updatePreset(
    key: string,
    data: UpdatePresetRequest
  ): Promise<EnergyPreset | MachinePreset | CostPreset | MarginPreset> {
    return apiClient.put<EnergyPreset | MachinePreset | CostPreset | MarginPreset>(`/presets/${key}`, { data })
  }

  static async deletePreset(key: string): Promise<void> {
    return apiClient.delete<void>(`/presets/${key}`)
  }

  // Helper methods for common presets
  static async getDefaultEnergyProfile(location: string): Promise<EnergyPreset | null> {
    const presets = await this.getEnergyPresets(location)
    // Get the most recent preset for the location
    return presets.sort((a, b) => b.year - a.year)[0] || null
  }

  static async getMachineByName(name: string): Promise<MachinePreset | null> {
    const machines = await this.getMachinePresets()
    return machines.find(m => m.name === name) || null
  }
}