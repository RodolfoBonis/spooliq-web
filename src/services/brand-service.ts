import api from '@/lib/api/client'
import type { Brand } from '@/types/models'

export interface BrandFilters {
  search?: string
  page?: number
  pageSize?: number
}

export interface CreateBrandDTO {
  name: string
  website?: string
  description?: string
}

export interface UpdateBrandDTO {
  name?: string
  website?: string
  description?: string
}

export const brandService = {
  /**
   * List brands
   */
  async list(filters?: BrandFilters): Promise<{ data: Brand[]; total: number }> {
    const { search, page, pageSize } = filters || {}
    const params = new URLSearchParams()
    if (search) params.append('search', search)
    if (page) params.append('page', page.toString())
    if (pageSize) params.append('pageSize', pageSize.toString())

    const { data } = await api.get<{ brands: Brand[]; total: number }>(
      `/brands/?${params.toString()}`
    )

    return { data: data.brands, total: data.total }
  },

  /**
   * Get brand by ID
   */
  async getById(id: string): Promise<Brand> {
    const { data } = await api.get<{ brand: Brand }>(`/brands/${id}`)
    return data.brand
  },

  /**
   * Create new brand
   */
  async create(brandData: CreateBrandDTO): Promise<Brand> {
    const { data } = await api.post<{ message: string; brand: Brand }>(
      '/brands/',
      brandData
    )
    return data.brand
  },

  /**
   * Update brand
   */
  async update(id: string, brandData: UpdateBrandDTO): Promise<Brand> {
    const { data } = await api.put<{ message: string; brand: Brand }>(
      `/brands/${id}`,
      brandData
    )
    return data.brand
  },

  /**
   * Delete brand
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/brands/${id}`)
  },
}

export default brandService

