import { api } from '@/lib/api/client'
import type { Budget, BudgetWithDetails } from '@/types/models'

export interface BudgetFilters {
  page?: number
  pageSize?: number
  status?: string
  customer_id?: string
  search?: string
}

export interface BudgetListItem extends Budget {
  customer: {
    id: string
    name: string
    email?: string
    phone?: string
    document?: string
  }
  items: any[]
  total_print_time_hours: number
  total_print_time_minutes: number
  total_print_time_display: string
}

export interface BudgetListResponse {
  data: BudgetListItem[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export interface CreateBudgetItemFilamentDTO {
  filament_id: string
  quantity: number // grams
  order: number
}

export interface CreateBudgetItemDTO {
  model_3d_id?: string
  product_name: string
  product_description?: string
  product_quantity: number
  product_dimensions?: string
  print_time_hours: number
  print_time_minutes: number
  cost_preset_id?: string
  setup_time_minutes: number // Setup time in minutes (one-time)
  manual_labor_minutes_total: number // Total manual labor for all units
  additional_notes?: string
  filaments: CreateBudgetItemFilamentDTO[]
  order: number
}

export interface CreateBudgetDTO {
  name: string
  description?: string
  customer_id: string
  machine_preset_id?: string
  energy_preset_id?: string
  include_energy_cost: boolean
  include_waste_cost: boolean
  delivery_days?: number
  payment_terms?: string
  notes?: string
  items: CreateBudgetItemDTO[]
}

export interface UpdateBudgetDTO extends Partial<CreateBudgetDTO> {}

export interface UpdateBudgetStatusDTO {
  status: 'sent' | 'approved' | 'rejected' | 'printing' | 'completed'
  notes?: string
}

export const budgetService = {
  async list(filters?: BudgetFilters): Promise<BudgetListResponse> {
    const params = new URLSearchParams()
    
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.pageSize) params.append('pageSize', filters.pageSize.toString())
    if (filters?.status) params.append('status', filters.status)
    if (filters?.customer_id) params.append('customer_id', filters.customer_id)
    if (filters?.search) params.append('search', filters.search)

    const { data } = await api.get<BudgetListResponse>(`/budgets?${params.toString()}`)
    return data
  },

  async getById(id: string): Promise<BudgetWithDetails> {
    const { data } = await api.get<BudgetWithDetails>(`/budgets/${id}`)
    return data
  },

  async create(budgetData: CreateBudgetDTO): Promise<Budget> {
    const { data } = await api.post<Budget>('/budgets', budgetData)
    return data
  },

  async update(id: string, budgetData: UpdateBudgetDTO): Promise<Budget> {
    const { data } = await api.put<Budget>(`/budgets/${id}`, budgetData)
    return data
  },

  async updateStatus(id: string, statusData: UpdateBudgetStatusDTO): Promise<Budget> {
    const { data } = await api.patch<Budget>(`/budgets/${id}/status`, statusData)
    return data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/budgets/${id}`)
  },

  async generatePDF(id: string, force: boolean = false): Promise<Blob> {
    const params = force ? '?force=true' : ''
    const { data } = await api.get(`/budgets/${id}/pdf${params}`, {
      responseType: 'blob'
    })
    return data
  },
}

