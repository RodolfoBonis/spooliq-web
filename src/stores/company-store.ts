import { create } from 'zustand'
import type { Company } from '@/types/models'
import { companyService, type UpdateCompanyDTO } from '@/services/company-service'
import { toast } from 'sonner'

interface CompanyState {
  company: Company | null
  isLoading: boolean
  error: string | null

  // Actions
  fetchCompany: () => Promise<void>
  updateCompany: (data: UpdateCompanyDTO) => Promise<void>
  uploadLogo: (file: File) => Promise<void>
  setCompany: (company: Company) => void
}

export const useCompanyStore = create<CompanyState>((set, get) => ({
  company: null,
  isLoading: false,
  error: null,

  fetchCompany: async () => {
    try {
      set({ isLoading: true, error: null })
      const company = await companyService.get()
      set({ company, isLoading: false })
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erro ao carregar empresa'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
    }
  },

  updateCompany: async (data: UpdateCompanyDTO) => {
    try {
      set({ isLoading: true, error: null })
      const company = await companyService.update(data)
      set({ company, isLoading: false })
      toast.success('Empresa atualizada com sucesso!')
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erro ao atualizar empresa'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
      throw error
    }
  },

  uploadLogo: async (file: File) => {
    try {
      set({ isLoading: true, error: null })
      await companyService.uploadLogo(file)
      
      // Fetch fresh company data from backend to ensure we have the latest info
      const updatedCompany = await companyService.get()
      set({ company: updatedCompany, isLoading: false })
      
      toast.success('Logo atualizado com sucesso!')
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erro ao fazer upload do logo'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
      throw error
    }
  },

  setCompany: (company: Company) => {
    set({ company })
  },
}))

