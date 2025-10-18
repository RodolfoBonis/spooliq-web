import { api } from '@/lib/api/client'

export interface CompanyAdmin {
  id: string
  organization_id: string
  name: string
  trade_name?: string
  document?: string
  email?: string
  phone?: string
  subscription_status: 'trial' | 'active' | 'overdue' | 'cancelled'
  subscription_plan: 'basic' | 'pro' | 'enterprise'
  trial_ends_at?: string
  subscription_started_at?: string
  is_platform_company: boolean
  created_at: string
  updated_at: string
}

export interface SubscriptionAdmin {
  organization_id: string
  company_name: string
  status: 'trial' | 'active' | 'overdue' | 'cancelled'
  plan: 'basic' | 'pro' | 'enterprise'
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

export const adminService = {
  async listCompanies(): Promise<CompanyAdmin[]> {
    const { data } = await api.get<{ companies: CompanyAdmin[] }>('/admin/companies')
    return data.companies
  },

  async getCompany(organizationId: string): Promise<CompanyAdmin> {
    const { data } = await api.get<{ company: CompanyAdmin }>(`/admin/companies/${organizationId}`)
    return data.company
  },

  async updateCompanyStatus(
    organizationId: string,
    status: 'active' | 'suspended' | 'cancelled'
  ): Promise<void> {
    await api.patch(`/admin/companies/${organizationId}/status`, { status })
  },

  async listSubscriptions(): Promise<SubscriptionAdmin[]> {
    const { data } = await api.get<{ subscriptions: SubscriptionAdmin[] }>('/admin/subscriptions')
    return data.subscriptions
  },

  async getStats(): Promise<AdminStats> {
    const { data } = await api.get<AdminStats>('/admin/stats')
    return data
  },
}

