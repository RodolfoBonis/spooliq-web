import api from '@/lib/api/client'
import { buildListParams, toPage } from '@/lib/api/pagination'
import type { PaginatedResponse } from '@/types/api'
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

/**
 * Raw material as returned by the API. The temperature fields are migrating from
 * camelCase (`tempTable`/`tempExtruder`) to snake_case (`temp_table`/`temp_extruder`);
 * both are accepted here during the transition.
 */
interface RawMaterial extends Omit<Material, 'tempTable' | 'tempExtruder'> {
  tempTable?: number
  tempExtruder?: number
  temp_table?: number
  temp_extruder?: number
}

function normalizeMaterial(raw: RawMaterial): Material {
  const { temp_table, temp_extruder, ...rest } = raw
  return {
    ...rest,
    tempTable: temp_table ?? raw.tempTable,
    tempExtruder: temp_extruder ?? raw.tempExtruder,
  }
}

/**
 * Builds the create/update payload. Sends BOTH snake_case and camelCase temperature keys
 * so the request works against the current API (camelCase) and the standardized one
 * (snake_case, which accepts both).
 */
function toMaterialPayload(dto: CreateMaterialDTO | UpdateMaterialDTO): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    name: dto.name,
    description: dto.description,
  }
  if (dto.tempTable !== undefined) {
    payload.temp_table = dto.tempTable
    payload.tempTable = dto.tempTable
  }
  if (dto.tempExtruder !== undefined) {
    payload.temp_extruder = dto.tempExtruder
    payload.tempExtruder = dto.tempExtruder
  }
  return payload
}

export const materialService = {
  /**
   * List materials. Tolerant to both the new `{ data, total, ... }` envelope and legacy arrays.
   */
  async list(filters?: MaterialFilters): Promise<PaginatedResponse<Material>> {
    const { search, page, pageSize } = filters || {}
    const { data } = await api.get('/materials/', {
      params: buildListParams({ page, pageSize, q: search }),
    })
    const pageData = toPage<RawMaterial>(data)
    return { ...pageData, data: pageData.data.map(normalizeMaterial) }
  },

  /**
   * Get material by ID
   */
  async getById(id: string): Promise<Material> {
    const { data } = await api.get<{ material: RawMaterial }>(`/materials/${id}`)
    return normalizeMaterial(data.material)
  },

  /**
   * Create new material
   */
  async create(materialData: CreateMaterialDTO): Promise<Material> {
    const { data } = await api.post<{ message: string; material: RawMaterial }>(
      '/materials/',
      toMaterialPayload(materialData)
    )
    return normalizeMaterial(data.material)
  },

  /**
   * Update material
   */
  async update(id: string, materialData: UpdateMaterialDTO): Promise<Material> {
    const { data } = await api.put<{ message: string; material: RawMaterial }>(
      `/materials/${id}`,
      toMaterialPayload(materialData)
    )
    return normalizeMaterial(data.material)
  },

  /**
   * Delete material
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/materials/${id}`)
  },
}

export default materialService
