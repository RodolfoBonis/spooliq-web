import apiClient from '@/lib/api-client'
import {
  FilamentBrand,
  CreateBrandRequest,
  UpdateBrandRequest,
  BrandFilters,
  ApiResponse
} from '@/types/api'

export class BrandService {
  static async getBrands(filters?: BrandFilters): Promise<FilamentBrand[]> {
    const params = new URLSearchParams()

    if (filters?.active_only !== undefined) {
      params.append('active_only', filters.active_only.toString())
    }

    if (filters?.search) {
      params.append('search', filters.search)
    }

    const queryString = params.toString()
    const url = `/filament-brands${queryString ? `?${queryString}` : ''}`

    const response = await apiClient.get<ApiResponse<FilamentBrand[]>>(url)
    return response.data
  }

  static async getBrand(id: number): Promise<FilamentBrand> {
    return apiClient.get<FilamentBrand>(`/filament-brands/${id}`)
  }

  static async createBrand(data: CreateBrandRequest): Promise<FilamentBrand> {
    return apiClient.post<FilamentBrand>('/filament-brands', data)
  }

  static async updateBrand(id: number, data: UpdateBrandRequest): Promise<FilamentBrand> {
    return apiClient.put<FilamentBrand>(`/filament-brands/${id}`, data)
  }

  static async deleteBrand(id: number): Promise<void> {
    return apiClient.delete<void>(`/filament-brands/${id}`)
  }

  // Helper method para buscar apenas marcas ativas (útil para dropdowns)
  static async getActiveBrands(): Promise<FilamentBrand[]> {
    return this.getBrands({ active_only: true })
  }

  // Helper method para buscar nomes de marcas ativas (compatibilidade com sistema atual)
  static async getBrandNames(): Promise<string[]> {
    const brands = await this.getActiveBrands()
    return brands.map(brand => brand.name).sort()
  }
}