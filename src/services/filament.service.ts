import apiClient from '@/lib/api-client'
import {
  Filament,
  CreateFilamentRequest,
  FilamentFilters,
  PaginatedResponse
} from '@/types/api'

export class FilamentService {
  static async getFilaments(filters?: FilamentFilters, page = 1, perPage = 10): Promise<PaginatedResponse<Filament>> {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
      ...(filters?.search && { search: filters.search }),
      ...(filters?.material && { material: filters.material }),
      ...(filters?.brand && { brand: filters.brand }),
      ...(filters?.is_global !== undefined && { is_global: filters.is_global.toString() }),
    })

    const response = await apiClient.get<any>(`/filaments?${params}`)

    // Map the API response to our expected structure
    return {
      data: response.filaments || response.data || [],
      total: response.total || 0,
      page: response.page || page,
      per_page: response.per_page || perPage,
      last_page: response.last_page || 1,
    }
  }

  static async getFilament(id: string): Promise<Filament> {
    return apiClient.get<Filament>(`/filaments/${id}`)
  }

  static async createFilament(data: CreateFilamentRequest): Promise<Filament> {
    return apiClient.post<Filament>('/filaments', data)
  }

  static async updateFilament(id: string, data: Partial<CreateFilamentRequest>): Promise<Filament> {
    return apiClient.put<Filament>(`/filaments/${id}`, data)
  }

  static async deleteFilament(id: string): Promise<void> {
    return apiClient.delete<void>(`/filaments/${id}`)
  }

  static async getGlobalFilaments(): Promise<Filament[]> {
    return apiClient.get<Filament[]>('/filaments/global')
  }

  static async getMaterials(): Promise<string[]> {
    return apiClient.get<string[]>('/filaments/materials')
  }

  static async getBrands(): Promise<string[]> {
    return apiClient.get<string[]>('/filaments/brands')
  }
}