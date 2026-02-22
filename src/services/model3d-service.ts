import api from '@/lib/api/client'
import { AxiosError } from 'axios'
import type { Model3D, FindAllModel3DResponse, UploadConflictResponse } from '@/types/models'

export interface Model3DFilters {
  search?: string
  format?: string
  customer_id?: string
  page?: number
  page_size?: number
}

export interface UpdateModel3DDTO {
  name?: string
  description?: string
  customer_id?: string | null
  tags?: string
  notes?: string
}

export class UploadConflictError extends Error {
  existing: Model3D
  constructor(data: UploadConflictResponse) {
    super(data.error)
    this.name = 'UploadConflictError'
    this.existing = data.existing
  }
}

export const model3dService = {
  /**
   * List 3D models with filters (paginated)
   */
  async list(filters?: Model3DFilters): Promise<FindAllModel3DResponse> {
    const params = new URLSearchParams()
    if (filters?.search) params.append('search', filters.search)
    if (filters?.format) params.append('format', filters.format)
    if (filters?.customer_id) params.append('customer_id', filters.customer_id)
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.page_size) params.append('page_size', filters.page_size.toString())

    const { data } = await api.get<FindAllModel3DResponse>(`/models3d?${params.toString()}`)
    return data
  },

  /**
   * Get a single 3D model by ID
   */
  async getById(id: string): Promise<Model3D> {
    const { data } = await api.get<Model3D>(`/models3d/${id}`)
    return data
  },

  /**
   * Get all 3D models for a specific customer (flat array, not paginated)
   */
  async getByCustomer(customerId: string): Promise<Model3D[]> {
    const { data } = await api.get<Model3D[]>(`/models3d/by-customer/${customerId}`)
    return data
  },

  /**
   * Upload a new 3D model file (multipart/form-data)
   * Throws UploadConflictError on 409 (duplicate file)
   */
  async upload(formData: FormData): Promise<Model3D> {
    try {
      const { data } = await api.post<Model3D>('/models3d', formData)
      return data
    } catch (err) {
      const axiosError = err as AxiosError<UploadConflictResponse>
      if (axiosError.response?.status === 409 && axiosError.response.data?.existing) {
        throw new UploadConflictError(axiosError.response.data)
      }
      throw err
    }
  },

  /**
   * Update 3D model metadata (JSON body)
   */
  async update(id: string, data: UpdateModel3DDTO): Promise<Model3D> {
    const { data: model } = await api.put<Model3D>(`/models3d/${id}`, data)
    return model
  },

  /**
   * Soft-delete a 3D model
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/models3d/${id}`)
  },
}

export default model3dService
