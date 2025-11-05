import { api } from '@/lib/api/client'
import type { SubscriptionPlanModel } from '@/types/models'

export interface CreatePlanRequest {
  name: string
  description: string
  price: number
  cycle: 'MONTHLY' | 'YEARLY' | 'CUSTOM'
  features: Array<{
    name: string
    description: string
  }>
  is_active: boolean
}

export interface UpdatePlanRequest {
  name?: string
  description?: string
  price?: number
  cycle?: 'MONTHLY' | 'YEARLY' | 'CUSTOM'
  features?: Array<{
    name: string
    description: string
  }>
  is_active?: boolean
}

export interface PlanListResponse {
  plans: SubscriptionPlanModel[]
  total: number
}

export interface PlanStats {
  plan_id: string
  plan_name: string
  total_companies: number
  active_companies: number
  trial_companies: number
  total_active_users: number
  monthly_revenue: number
  annual_revenue: number
  churn_rate: number
  conversion_rate: number
}

export interface PlanCompany {
  id: string
  organization_id: string
  name: string
  email: string
  subscription_status: string
  trial_ends_at?: string
  total_users: number
  created_at: string
}

export interface PlanCompaniesResponse {
  companies: PlanCompany[]
  page: number
  page_size: number
  total_count: number
  total_pages: number
}

export interface FinancialReport {
  plan_id: string
  plan_name: string
  report_period: string
  revenue: {
    current_period: number
    previous_period: number
    growth_percentage: number
    average_per_user: number
    total_lifetime: number
  }
  subscriptions: {
    new_subscriptions: number
    cancelled_subscriptions: number
    churn_rate: number
    retention_rate: number
    conversion_rate: number
  }
  projections: {
    next_month: number
    next_quarter: number
    next_year: number
    methodology: string
  }
  trends: Array<{
    period: string
    revenue: number
    subscriptions: number
  }>
}

export interface CanDeleteResponse {
  can_delete: boolean
  reason: string
  active_companies: number
  trial_companies: number
  blocking_issues: string[]
  recommendations: string[]
}

export interface AvailableFeature {
  name: string
  description: string
  category: string
  is_active: boolean
}

export const subscriptionPlansService = {
  /**
   * List active subscription plans (public endpoint)
   * Available to everyone, even non-authenticated users
   */
  async listActivePlans(): Promise<PlanListResponse> {
    const { data } = await api.get<PlanListResponse>('/plans')
    return data
  },

  /**
   * List all subscription plans (admin only)
   * Shows both active and inactive plans
   */
  async listAllPlans(): Promise<PlanListResponse> {
    const { data } = await api.get<SubscriptionPlanModel[]>('/admin/subscription-plans')
    return {
      plans: data,
      total: data.length
    }
  },

  /**
   * Get a specific subscription plan by ID (admin only)
   * Returns detailed plan information
   */
  async getPlanById(id: string): Promise<SubscriptionPlanModel> {
    const { data } = await api.get<SubscriptionPlanModel>(`/admin/subscription-plans/${id}`)
    return data
  },

  /**
   * Get plan statistics (admin only)
   * Returns usage stats, revenue, and metrics for a plan
   */
  async getPlanStats(id: string): Promise<PlanStats> {
    const { data } = await api.get<PlanStats>(`/admin/subscription-plans/${id}/stats`)
    return data
  },

  /**
   * Get companies using a plan (admin only)
   * Returns paginated list of companies subscribed to the plan
   */
  async getPlanCompanies(id: string, page: number = 1, pageSize: number = 20): Promise<PlanCompaniesResponse> {
    const { data } = await api.get<PlanCompaniesResponse>(
      `/admin/subscription-plans/${id}/companies?page=${page}&page_size=${pageSize}`
    )
    return data
  },

  /**
   * Get financial report for a plan (admin only)
   * Returns revenue data, growth metrics, and projections
   */
  async getFinancialReport(id: string, period?: string): Promise<FinancialReport> {
    const params = period ? `?period=${period}` : ''
    const { data } = await api.get<FinancialReport>(
      `/admin/subscription-plans/${id}/financial-report${params}`
    )
    return data
  },

  /**
   * Check if a plan can be deleted (admin only)
   * Returns validation info and blocking issues
   */
  async canDeletePlan(id: string): Promise<CanDeleteResponse> {
    const { data } = await api.get<CanDeleteResponse>(`/admin/subscription-plans/${id}/can-delete`)
    return data
  },

  /**
   * Get available features for plans (admin only)
   * Returns list of features that can be assigned to plans
   */
  async getAvailableFeatures(): Promise<AvailableFeature[]> {
    const { data } = await api.get<AvailableFeature[]>('/admin/features/available')
    return data
  },

  /**
   * Create a new subscription plan (admin only)
   * Platform admins can create new subscription plans
   */
  async createPlan(plan: CreatePlanRequest): Promise<{ message: string; plan: SubscriptionPlanModel }> {
    const { data } = await api.post<{ message: string; plan: SubscriptionPlanModel }>('/admin/subscription-plans', plan)
    return data
  },

  /**
   * Update an existing subscription plan (admin only)
   * Platform admins can update plan details
   */
  async updatePlan(id: string, updates: UpdatePlanRequest): Promise<{ message: string; plan: SubscriptionPlanModel }> {
    const { data } = await api.put<{ message: string; plan: SubscriptionPlanModel }>(
      `/admin/subscription-plans/${id}`,
      updates
    )
    return data
  },

  /**
   * Delete a subscription plan (admin only)
   * Platform admins can delete plans (soft delete)
   */
  async deletePlan(id: string): Promise<{ message: string }> {
    const { data } = await api.delete<{ message: string }>(`/admin/subscription-plans/${id}`)
    return data
  },

  /**
   * Compare plans for pricing page
   * Helper method to format plans for comparison
   */
  formatPlansForComparison(plans: SubscriptionPlanModel[]): Array<{
    id: string
    name: string
    price: string
    billingCycle: string
    features: string[]
    isPopular?: boolean
    isBestValue?: boolean
  }> {
    return plans.map(plan => ({
      id: plan.id,
      name: plan.name,
      price: `R$ ${(plan.price / 100).toFixed(2)}`,
      billingCycle: plan.cycle === 'MONTHLY' ? '/mês' : '/ano',
      features: plan.features?.map(f => f.description) || [],
      isPopular: plan.name.toLowerCase() === 'pro',
      isBestValue: plan.cycle === 'YEARLY',
    }))
  },
}

export default subscriptionPlansService