import { api } from '@/lib/api/client'
import { buildListParams, toPage } from '@/lib/api/pagination'
import type { Budget, BudgetItem, BudgetItemFilament, BudgetWithDetails } from '@/types/models'

export interface BudgetFilters {
  page?: number
  pageSize?: number
  status?: string
  customer_id?: string
  search?: string
  from?: string
  to?: string
}

export interface BudgetListItem extends Budget {
  customer: {
    id: string
    name: string
    email?: string
    phone?: string
    document?: string
  }
  items: BudgetItem[]
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
  post_processing_minutes?: number // Phase 4A: total post-processing minutes (all units)
  support_removal_minutes?: number // Phase 4A: total support-removal minutes (all units)
  additional_notes?: string
  filaments: CreateBudgetItemFilamentDTO[]
  order: number
}

export interface CreateBudgetDTO {
  name: string
  description?: string
  customer_id: string
  profile_id?: string // Print profile; the API resolves omitted presets from it
  machine_preset_id?: string
  energy_preset_id?: string
  cost_preset_id?: string // Budget-level cost preset (overhead/margin)
  include_energy_cost: boolean
  include_waste_cost: boolean
  // Phase 4A pricing controls (all optional; API defaults apply when omitted).
  include_machine_cost?: boolean
  discount_type?: 'percent' | 'fixed' | null
  discount_value?: number // percent 0-100, or REAIS when discount_type === 'fixed'
  include_shipping?: boolean
  shipping_override?: number | null // cents; overrides computed shipping when set
  tax_rate?: number | null // % 0-99.99; null uses the company default
  delivery_days?: number
  payment_terms?: string
  notes?: string
  items: CreateBudgetItemDTO[]
}

export type UpdateBudgetDTO = Partial<CreateBudgetDTO>

/** Same body as create, but customer and name are optional (nothing is persisted). */
export type PreviewBudgetDTO = Omit<CreateBudgetDTO, 'customer_id' | 'name'> & {
  customer_id?: string
  name?: string
}

/** Full budget breakdown computed by `POST /budgets/preview` (all money in cents). */
export type BudgetPreview = Omit<
  BudgetWithDetails,
  'id' | 'organization_id' | 'customer' | 'customer_id' | 'status' | 'owner_user_id' | 'created_at' | 'updated_at' | 'items'
> & {
  items: Array<Omit<BudgetItem, 'id' | 'budget_id' | 'created_at' | 'updated_at'> & { filaments?: BudgetItemFilament[] }>
}

export interface UpdateBudgetStatusDTO {
  status: 'sent' | 'approved' | 'rejected' | 'printing' | 'completed'
  notes?: string
}

export const budgetService = {
  async list(filters?: BudgetFilters): Promise<BudgetListResponse> {
    const { data } = await api.get('/budgets', {
      params: buildListParams({
        page: filters?.page,
        pageSize: filters?.pageSize,
        q: filters?.search,
        status: filters?.status,
        customer_id: filters?.customer_id,
        from: filters?.from,
        to: filters?.to,
      }),
    })
    const pageData = toPage<BudgetListItem>(data)
    return {
      data: pageData.data,
      total: pageData.total,
      page: pageData.page,
      page_size: pageData.pageSize,
      total_pages: pageData.totalPages,
    }
  },

  async getById(id: string): Promise<BudgetWithDetails> {
    const { data } = await api.get<BudgetWithDetails>(`/budgets/${id}`)
    return data
  },

  async create(budgetData: CreateBudgetDTO): Promise<Budget> {
    const { data } = await api.post<Budget>('/budgets', budgetData)
    return data
  },

  async preview(budgetData: PreviewBudgetDTO, signal?: AbortSignal): Promise<BudgetPreview> {
    const { data } = await api.post<BudgetPreview>('/budgets/preview', budgetData, { signal })
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

