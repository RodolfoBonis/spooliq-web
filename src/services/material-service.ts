import api from '@/lib/api/client'
import type { Material } from '@/types/models'

export interface MaterialFilters {
  search?: string
  page?: number
  pageSize?: number
}

export interface CreateMaterialDTO {
  name: string
  description?: string
  tempTable?: number    // °C - Bed temperature
  tempExtruder?: number // °C - Extruder temperature
}

export interface UpdateMaterialDTO {
  name?: string
  description?: string
  tempTable?: number    // °C - Bed temperature
  tempExtruder?: number // °C - Extruder temperature
}

export const materialService = {
  /**
   * List materials
   */
  async list(filters?: MaterialFilters): Promise<{ data: Material[]; total: number }> {
    const { search, page, pageSize } = filters || {}
    const params = new URLSearchParams()
    if (search) params.append('search', search)
    if (pageSize) params.append('pageSize', pageSize.toString())

    const response = await api.get<{ data: Material[] }>(
      `/materials/?${params.toString()}`
    )

    return { data: response.data.data, total: response.data.data.length }
  },

  /**
   * Get material by ID
   */
  async getById(id: string): Promise<Material> {
    const { data } = await api.get<{ material: Material }>(`/materials/${id}`)
    return data.material
  },

  /**
   * Create new material
   */
  async create(materialData: CreateMaterialDTO): Promise<Material> {
    const { data } = await api.post<{ message: string; material: Material }>(
      '/materials/',
      materialData
    )
    return data.material
  },

  /**
   * Update material
   */
  async update(id: string, materialData: UpdateMaterialDTO): Promise<Material> {
    const { data } = await api.put<{ message: string; material: Material }>(
      `/materials/${id}`,
      materialData
    )
    return data.material
  },

  /**
   * Delete material
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/materials/${id}`)
  },
}

export default materialService

