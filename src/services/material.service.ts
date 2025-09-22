import apiClient from '@/lib/api-client'
import {
  FilamentMaterial,
  CreateMaterialRequest,
  UpdateMaterialRequest,
  MaterialFilters,
  ApiResponse
} from '@/types/api'

export class MaterialService {
  static async getMaterials(filters?: MaterialFilters): Promise<FilamentMaterial[]> {
    const params = new URLSearchParams()

    if (filters?.active_only !== undefined) {
      params.append('active_only', filters.active_only.toString())
    }

    if (filters?.search) {
      params.append('search', filters.search)
    }

    const queryString = params.toString()
    const url = `/filament-materials${queryString ? `?${queryString}` : ''}`

    const response = await apiClient.get<ApiResponse<FilamentMaterial[]>>(url)
    return response.data
  }

  static async getMaterial(id: number): Promise<FilamentMaterial> {
    return apiClient.get<FilamentMaterial>(`/filament-materials/${id}`)
  }

  static async createMaterial(data: CreateMaterialRequest): Promise<FilamentMaterial> {
    return apiClient.post<FilamentMaterial>('/filament-materials', data)
  }

  static async updateMaterial(id: number, data: UpdateMaterialRequest): Promise<FilamentMaterial> {
    return apiClient.put<FilamentMaterial>(`/filament-materials/${id}`, data)
  }

  static async deleteMaterial(id: number): Promise<void> {
    return apiClient.delete<void>(`/filament-materials/${id}`)
  }

  // Helper method para buscar apenas materiais ativos (útil para dropdowns)
  static async getActiveMaterials(): Promise<FilamentMaterial[]> {
    return this.getMaterials({ active_only: true })
  }

  // Helper method para buscar nomes de materiais ativos (compatibilidade com sistema atual)
  static async getMaterialNames(): Promise<string[]> {
    const materials = await this.getActiveMaterials()
    return materials.map(material => material.name).sort()
  }

  // Helper method para validar e parsear propriedades JSON
  static validateProperties(properties?: string): boolean {
    if (!properties) return true

    try {
      JSON.parse(properties)
      return true
    } catch {
      return false
    }
  }

  // Helper method para formatar propriedades para exibição
  static formatProperties(properties?: string): Record<string, any> | null {
    if (!properties) return null

    try {
      return JSON.parse(properties)
    } catch {
      return null
    }
  }
}