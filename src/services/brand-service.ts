import api from '@/lib/api/client'
import { buildListParams, toPage } from '@/lib/api/pagination'
import type { PaginatedResponse } from '@/types/api'
import type { Brand } from '@/types/models'

export interface BrandFilters {
  search?: string
  page?: number
  pageSize?: number
}

export interface CreateBrandDTO {
  name: string
  description?: string
}

export interface UpdateBrandDTO {
  name?: string
  description?: string
}

export const brandService = {
  /**
   * List brands. Tolerant to both the new `{ data, total, ... }` envelope and legacy arrays.
   */
  async list(filters?: BrandFilters): Promise<PaginatedResponse<Brand>> {
    const { search, page, pageSize } = filters || {}
    const { data } = await api.get('/brands/', {
      params: buildListParams({ page, pageSize, q: search }),
    })
    return toPage<Brand>(data)
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
