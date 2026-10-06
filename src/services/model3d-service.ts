import api from '@/lib/api/client'
import { buildListParams, toPage } from '@/lib/api/pagination'
import { getModelFilePath } from '@/lib/utils/cdn-model'
import { AxiosError, type AxiosProgressEvent, type GenericAbortSignal } from 'axios'
import type { Model3D, UploadConflictResponse } from '@/types/models'
import type { PaginatedResponse } from '@/types/api'

export interface Model3DFilters {
  search?: string
  format?: string
  customer_id?: string
  page?: number
  pageSize?: number
}

export interface UpdateModel3DDTO {
  name?: string
  description?: string
  customer_id?: string | null
  tags?: string
  notes?: string
}

/**
 * Thrown when uploading a file that already exists for the organization.
 * The backend may signal this via `code === 'model3d_duplicate'` and/or by
 * returning the pre-existing model in `existing`.
 */
export class UploadConflictError extends Error {
  readonly existing?: Model3D
  constructor(data: UploadConflictResponse) {
    // Prefer the pt-BR envelope message, fall back to the legacy `error` string.
    super(data.message || data.error || 'Arquivo já existe')
    this.name = 'UploadConflictError'
    this.existing = data.existing
  }
}

/** True when a 409 payload describes a duplicate-file conflict. */
function isDuplicateConflict(data?: UploadConflictResponse): boolean {
  if (!data) return false
  return data.code === 'model3d_duplicate' || !!data.existing
}

export const model3dService = {
  /**
   * List 3D models with filters and pagination. Tolerant to both the new
   * `{ data, total, page, page_size, total_pages }` envelope and legacy arrays.
   */
  async list(filters?: Model3DFilters): Promise<PaginatedResponse<Model3D>> {
    const { search, format, customer_id, page, pageSize } = filters || {}
    const { data } = await api.get('/models3d', {
      params: buildListParams({ page, pageSize, q: search, format, customer_id }),
    })
    return toPage<Model3D>(data)
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
   * Fetch a model's binary file as an ArrayBuffer through the authenticated axios
   * client (the Authorization header is added by the request interceptor). Used by
   * the 3D viewer, which feeds the bytes into `loader.parse(...)`.
   */
  async getFileBuffer(
    id: string,
    options?: {
      signal?: GenericAbortSignal
      onDownloadProgress?: (event: AxiosProgressEvent) => void
    }
  ): Promise<ArrayBuffer> {
    const { data } = await api.get<ArrayBuffer>(getModelFilePath(id), {
      responseType: 'arraybuffer',
      signal: options?.signal,
      onDownloadProgress: options?.onDownloadProgress,
    })
    return data
  },

  /**
   * Download a model's binary file to disk, authenticated via axios. Mirrors the
   * blob + object-URL pattern used by the budget PDF download.
   */
  async downloadFile(model: Pick<Model3D, 'id' | 'file_name'>): Promise<void> {
    const { data: blob } = await api.get<Blob>(getModelFilePath(model.id), {
      responseType: 'blob',
    })
    const url = URL.createObjectURL(blob)
    try {
      const link = document.createElement('a')
      link.href = url
      link.download = model.file_name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } finally {
      URL.revokeObjectURL(url)
    }
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
      if (
        axiosError.response?.status === 409 &&
        isDuplicateConflict(axiosError.response.data)
      ) {
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
