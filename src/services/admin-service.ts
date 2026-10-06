import { api } from '@/lib/api/client'
import { buildListParams, toPage } from '@/lib/api/pagination'

export interface SubscriptionPlan {
  id: string
  name: string
  description: string
  price: number
  cycle: string
  features: Array<{
    id: string
    name: string
    description: string
    is_active: boolean
  }>
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CompanyAdmin {
  id: string
  organization_id: string
  name: string
  trade_name?: string
  document?: string
  email?: string
  phone?: string
  subscription_status: 'trial' | 'ACTIVE' | 'overdue' | 'cancelled'
  subscription_plan_id?: string
  current_plan?: SubscriptionPlan
  trial_ends_at?: string
  subscription_started_at?: string
  is_platform_company: boolean
  created_at: string
  updated_at: string
}

export interface SubscriptionAdmin {
  organization_id: string
  company_name: string
  subscription_status: 'trial' | 'ACTIVE' | 'overdue' | 'cancelled'
  subscription_plan_id?: string
  current_plan?: SubscriptionPlan
  trial_ends_at?: string
  subscription_started_at?: string
  next_payment_due?: string
  mrr: number // Monthly Recurring Revenue in cents
  created_at: string
}

export interface AdminStats {
  total_companies: number
  active_subscriptions: number
  trial_subscriptions: number
  overdue_subscriptions: number
  total_mrr: number // in cents
  churn_rate: number // percentage
}

export interface UpdateCompanyStatusRequest {
  /** Must match the API's `oneof=trial active suspended cancelled permanent` (case-sensitive). */
  status: 'trial' | 'active' | 'suspended' | 'cancelled' | 'permanent'
  /** Required by the API. */
  reason: string
  notes?: string
}

export interface SubscriptionDetailsResponse {
  subscription: SubscriptionAdmin
  payment_history: Array<{
    id: string
    amount_cents: number
    status: 'paid' | 'pending' | 'failed' | 'refunded'
    payment_date: string
    payment_method?: string
    invoice_url?: string
  }>
  usage_stats?: {
    users_count: number
    storage_used_gb: number
    api_calls_month: number
  }
}

export interface PaymentHistoryResponse {
  payments: Array<{
    id: string
    organization_id: string
    company_name: string
    amount_cents: number
    status: 'paid' | 'pending' | 'failed' | 'refunded'
    payment_date: string
    payment_method?: string
    invoice_url?: string
    asaas_payment_id?: string
  }>
  total: number
  page: number
  page_size: number
}

export const adminService = {
  async listCompanies(
    page = 1,
    pageSize = 20,
    statusFilter?: string,
    search?: string
  ): Promise<{
    companies: CompanyAdmin[]
    total: number
    page: number
    page_size: number
    total_pages: number
  }> {
    const { data } = await api.get('/admin/companies', {
      params: buildListParams({ page, pageSize, q: search, status: statusFilter }),
    })
    // Tolerates legacy { companies, total_count } and the new { data, total } envelope.
    const result = toPage<CompanyAdmin>(data, 'companies')
    return {
      companies: result.data,
      total: result.total,
      page: result.page,
      page_size: result.pageSize,
      total_pages: result.totalPages,
    }
  },

  async getCompany(organizationId: string): Promise<CompanyAdmin> {
    const { data } = await api.get<{ company: CompanyAdmin }>(`/admin/companies/${organizationId}`)
    return data.company
  },

  async updateCompanyStatus(
    organizationId: string,
    request: UpdateCompanyStatusRequest
  ): Promise<CompanyAdmin> {
    const { data } = await api.patch<{ company: CompanyAdmin }>(
      `/admin/companies/${organizationId}/status`,
      request
    )
    return data.company
  },


  async getSubscriptionDetails(organizationId: string): Promise<SubscriptionDetailsResponse> {
    const { data } = await api.get<SubscriptionDetailsResponse>(`/admin/subscriptions/${organizationId}`)
    return data
  },

  async getPaymentHistory(
    organizationId: string,
    page = 1,
    pageSize = 20
  ): Promise<PaymentHistoryResponse> {
    const { data } = await api.get(
      `/admin/subscriptions/${organizationId}/payments`,
      {
        params: {
          page,
          page_size: pageSize,
        },
      }
    )
    const result = toPage<PaymentHistoryResponse['payments'][number]>(data, 'payments')
    return {
      payments: result.data,
      total: result.total,
      page: result.page,
      page_size: result.pageSize,
    }
  },

  async getStats(): Promise<AdminStats> {
    const { data } = await api.get<AdminStats>('/admin/stats')
    return data
  },

  // Helper methods for admin dashboard
  async getDashboardMetrics(): Promise<{
    stats: AdminStats
    recentCompanies: CompanyAdmin[]
    overdueCompanies: CompanyAdmin[]
  }> {
    const [stats, companies, overdueCompanies] = await Promise.all([
      this.getStats(),
      this.listCompanies(1, 5),
      this.listCompanies(1, 10, 'overdue'),
    ])

    return {
      stats,
      recentCompanies: companies.companies,
      overdueCompanies: overdueCompanies.companies,
    }
  },
}

