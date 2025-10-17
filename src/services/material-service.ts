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
  properties?: {
    density?: number        // g/cm³
    print_temp_min?: number // °C
    print_temp_max?: number
    bed_temp?: number
  }
}

export interface UpdateMaterialDTO {
  name?: string
  description?: string
  properties?: {
    density?: number
    print_temp_min?: number
    print_temp_max?: number
    bed_temp?: number
  }
}

export const materialService = {
  /**
   * List materials
   */
  async list(filters?: MaterialFilters): Promise<{ data: Material[]; total: number }> {
    const { search, page, pageSize } = filters || {}
    const params = new URLSearchParams()
    if (search) params.append('search', search)
    if (page) params.append('page', page.toString())
    if (pageSize) params.append('pageSize', pageSize.toString())

    const { data } = await api.get<{ materials: Material[]; total: number }>(
      `/materials/?${params.toString()}`
    )

    return { data: data.materials, total: data.total }
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

