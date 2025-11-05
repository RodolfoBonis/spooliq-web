import api from '@/lib/api/client'
import type { Company } from '@/types/models'

export interface UpdateCompanyDTO {
  name?: string
  trade_name?: string
  email?: string
  phone?: string
  whatsapp?: string
  instagram?: string
  website?: string
  address?: string
  city?: string
  state?: string
  zip_code?: string
}

export const companyService = {
  /**
   * Get current company information
   */
  async get(): Promise<Company> {
    const { data } = await api.get<Company>('/company/')
    return data
  },

  /**
   * Update company information
   */
  async update(data: UpdateCompanyDTO): Promise<Company> {
    const response = await api.put<{ message: string; company: Company }>(
      '/company/',
      data
    )
    return response.data.company
  },

  /**
   * Upload company logo
   */
  async uploadLogo(file: File): Promise<{ logo_url: string }> {
    const formData = new FormData()
    formData.append('logo', file)

    const { data } = await api.post<{ message: string; logo_url: string }>(
      '/company/logo',
      formData
    )

    return { logo_url: data.logo_url }
  },
}

export default companyService

