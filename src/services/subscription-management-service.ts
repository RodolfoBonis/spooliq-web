import { api } from '@/lib/api/client'
import type { Subscription } from '@/types/models'

export interface SubscribeToPlanRequest {
  plan_id: string
  payment_method_id?: string
  billing_cycle?: 'monthly' | 'yearly'
}

export interface SubscribeResponse {
  subscription: Subscription
  message: string
  redirect_url?: string // For payment gateway redirect if needed
}

export interface CancelSubscriptionRequest {
  reason?: string
  feedback?: string
  immediately?: boolean
}

export interface SubscriptionStatusResponse {
  subscription: Subscription
  status: 'trial' | 'active' | 'overdue' | 'cancelled' | 'expired'
  days_remaining?: number // For trial
  next_billing_date?: string
  outstanding_amount?: number // In cents
  can_access_features: boolean
}

export const subscriptionManagementService = {
  /**
   * Subscribe to a plan
   * Only owners can subscribe to plans
   */
  async subscribeToPlan(data: SubscribeToPlanRequest): Promise<SubscribeResponse> {
    const response = await api.post<SubscribeResponse>('/subscriptions/subscribe', data)
    return response.data
  },

  /**
   * Cancel current subscription
   * Only owners can cancel subscriptions
   */
  async cancelSubscription(data?: CancelSubscriptionRequest): Promise<{ message: string; effective_date: string }> {
    const response = await api.delete<{ message: string; effective_date: string }>('/subscriptions/cancel', {
      data: data || {}
    })
    return response.data
  },

  /**
   * Get current subscription status
   * Only owners can view subscription status
   */
  async getSubscriptionStatus(): Promise<SubscriptionStatusResponse> {
    const { data } = await api.get<SubscriptionStatusResponse>('/subscriptions/status')
    return data
  },

  /**
   * Reactivate a cancelled subscription
   * Only owners can reactivate subscriptions
   */
  async reactivateSubscription(): Promise<{ message: string; subscription: Subscription }> {
    const { data } = await api.post<{ message: string; subscription: Subscription }>('/subscriptions/reactivate')
    return data
  },

  /**
   * Change subscription plan
   * Only owners can change plans
   */
  async changePlan(newPlanId: string): Promise<{ message: string; subscription: Subscription; proration?: number }> {
    const { data } = await api.put<{ message: string; subscription: Subscription; proration?: number }>(
      '/subscriptions/change-plan',
      { new_plan_id: newPlanId }
    )
    return data
  },
}

export default subscriptionManagementService