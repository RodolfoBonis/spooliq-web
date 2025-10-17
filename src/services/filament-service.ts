import api from '@/lib/api/client'
import type { Filament, ColorType, ColorData } from '@/types/models'

export interface FilamentFilters {
  search?: string
  brand_id?: string
  material_id?: string
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

export const filamentService = {
  /**
   * List filaments
   */
  async list(filters?: FilamentFilters): Promise<{ data: Filament[]; total: number }> {
    const { search, brand_id, material_id, pageSize } = filters || {}
    const params = new URLSearchParams()
    if (search) params.append('search', search)
    if (brand_id) params.append('brand_id', brand_id)
    if (material_id) params.append('material_id', material_id)
    if (pageSize) params.append('pageSize', pageSize.toString())

    const response = await api.get<{ 
      data: Array<any>; 
      total: number 
    }>(`/filaments/?${params.toString()}`)

    // Map backend response to frontend format
    const filaments: Filament[] = response.data.data.map((item: any) => ({
      ...item,
      brand_name: item.brand?.name || '',
      material_name: item.material?.name || '',
    }))

    return { data: filaments, total: response.data.total }
  },

  /**
   * Get filament by ID
   */
  async getById(id: string): Promise<Filament> {
    const { data } = await api.get<{ data: any }>(`/filaments/${id}`)
    
    // Map backend response to frontend format
    return {
      ...data.data,
      brand_name: data.data.brand?.name || '',
      material_name: data.data.material?.name || '',
    }
  },

  /**
   * Create new filament
   */
  async create(filamentData: CreateFilamentDTO): Promise<Filament> {
    try {
      const response = await api.post<{ message: string; filament: any }>(
        '/filaments/',
        filamentData
      )
      
      console.log('Create filament response:', response)
      console.log('Response data:', response.data)
      
      const { data } = response
      
      // Map backend response to frontend format
      const mappedData = {
        ...data.filament,
        brand_name: data.filament.brand?.name || '',
        material_name: data.filament.material?.name || '',
      }
      
      console.log('Mapped filament data:', mappedData)
      
      return mappedData
    } catch (error) {
      console.error('Error creating filament:', error)
      throw error
    }
  },

  /**
   * Update filament
   */
  async update(id: string, filamentData: UpdateFilamentDTO): Promise<Filament> {
    const { data } = await api.put<{ message: string; filament: any }>(
      `/filaments/${id}`,
      filamentData
    )
    
    // Map backend response to frontend format
    return {
      ...data.filament,
      brand_name: data.filament.brand?.name || '',
      material_name: data.filament.material?.name || '',
    }
  },

  /**
   * Delete filament
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/filaments/${id}`)
  },
}

export default filamentService

