import api from '@/lib/api/client'
import { buildListParams, toPage } from '@/lib/api/pagination'
import type { PaginatedResponse } from '@/types/api'
import type { Filament, ColorType, ColorData } from '@/types/models'

export interface FilamentFilters {
  search?: string
  brand_id?: string
  material_id?: string
  /** Filament color type (solid, gradient, ...). */
  color_type?: string
  /** Filament diameter in mm (e.g. 1.75, 2.85). */
  diameter?: number
  /** Price range in cents. */
  min_price?: number
  max_price?: number
  page?: number
  pageSize?: number
}

export interface CreateFilamentDTO {
  name: string
  brand_id: string
  material_id: string
  color: string // Color name (e.g., "Vermelho", "Azul → Rosa")
  color_type: ColorType
  color_data: ColorData
  diameter: 1.75 | 2.85
  price_per_kg: number // cents
  stock_quantity?: number
  min_stock_alert?: number
  description?: string
}

export interface UpdateFilamentDTO {
  name?: string
  brand_id?: string
  material_id?: string
  color?: string // Color name (e.g., "Vermelho", "Azul → Rosa")
  color_type?: ColorType
  color_data?: ColorData
  diameter?: 1.75 | 2.85
  price_per_kg?: number
  stock_quantity?: number
  min_stock_alert?: number
  description?: string
  is_active?: boolean
}

/** Raw filament as returned by the API; list/search endpoints embed brand/material objects. */
interface RawFilament extends Partial<Filament> {
  id: string
  brand?: { name?: string } | null
  material?: { name?: string } | null
}

function normalizeFilament(raw: RawFilament): Filament {
  return {
    ...(raw as Filament),
    brand_name: raw.brand_name ?? raw.brand?.name ?? '',
    material_name: raw.material_name ?? raw.material?.name ?? '',
  }
}

/** Shared filter params for both list and search (the API now accepts the same keys on both). */
function filamentListParams(filters?: FilamentFilters) {
  const {
    search,
    brand_id,
    material_id,
    color_type,
    diameter,
    min_price,
    max_price,
    page,
    pageSize,
  } = filters || {}
  return {
    page,
    pageSize,
    q: search,
    brand_id,
    material_id,
    color_type,
    diameter,
    min_price,
    max_price,
  }
}

export const filamentService = {
  /**
   * Search filaments with filters. Tolerant to both the new `{ data, total, ... }`
   * envelope and legacy arrays.
   */
  async search(filters?: FilamentFilters): Promise<PaginatedResponse<Filament>> {
    const { data } = await api.get('/filaments/search', {
      params: buildListParams({
        ...filamentListParams(filters),
        // `name` kept for backward-compat with the current search endpoint.
        name: filters?.search,
      }),
    })
    const pageData = toPage<RawFilament>(data)
    return { ...pageData, data: pageData.data.map(normalizeFilament) }
  },

  /**
   * List filaments. Tolerant to both the new `{ data, total, ... }` envelope and legacy arrays.
   * The list endpoint now accepts the same filters as search (brand_id, material_id,
   * color_type, diameter, min_price, max_price).
   */
  async list(filters?: FilamentFilters): Promise<PaginatedResponse<Filament>> {
    const { data } = await api.get('/filaments/', {
      params: buildListParams(filamentListParams(filters)),
    })
    const pageData = toPage<RawFilament>(data)
    return { ...pageData, data: pageData.data.map(normalizeFilament) }
  },

  /**
   * Get filament by ID
   */
  async getById(id: string): Promise<Filament> {
    // The API returns the filament object itself (no `data` envelope); accept both.
    const { data } = await api.get<RawFilament | { data: RawFilament }>(`/filaments/${id}`)
    const raw = 'data' in data && data.data ? data.data : (data as RawFilament)
    return normalizeFilament(raw)
  },

  /**
   * Create new filament
   */
  async create(filamentData: CreateFilamentDTO): Promise<Filament> {
    // Backend returns FilamentEntity directly (no wrapper object), without nested
    // brand/material — brand_name/material_name are populated when the list refreshes.
    const { data } = await api.post<RawFilament>('/filaments/', filamentData)
    return normalizeFilament(data)
  },

  /**
   * Update filament
   */
  async update(id: string, filamentData: UpdateFilamentDTO): Promise<Filament> {
    const { data } = await api.put<RawFilament>(`/filaments/${id}`, filamentData)
    return normalizeFilament(data)
  },

  /**
   * Delete filament
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/filaments/${id}`)
  },
}

export default filamentService
