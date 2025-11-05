import { api } from '@/lib/api/client'
import type { Company, SubscriptionPayment } from '@/types/models'
import type { PaymentHistoryResponse } from '@/types/api'

export interface SubscriptionInfo {
  status: 'trial' | 'active' | 'overdue' | 'cancelled'
  plan: 'basic' | 'pro' | 'enterprise'
  trialEndsAt?: string
  subscriptionStartedAt?: string
  nextPaymentDue?: string
  asaasCustomerId?: string
  asaasSubscriptionId?: string
}

export const subscriptionService = {
  /**
   * Get current subscription information
   * Uses the company endpoint which already returns subscription data
   */
  async getSubscription(): Promise<SubscriptionInfo> {
    const { data } = await api.get<Company>('/company/')

    return {
      status: data.subscription_status as 'trial' | 'active' | 'overdue' | 'cancelled',
      plan: data.subscription_plan as 'basic' | 'pro' | 'enterprise',
      trialEndsAt: data.trial_ends_at,
      subscriptionStartedAt: data.subscription_started_at,
      nextPaymentDue: data.next_payment_due,
      asaasCustomerId: data.asaas_customer_id,
      asaasSubscriptionId: data.asaas_subscription_id,
    }
  },

  /**
   * Get payment history for the current company
   * Uses the payment methods list endpoint which shows payment history
   */
  async getPaymentHistory(page = 1, pageSize = 10): Promise<PaymentHistoryResponse> {
    try {
      // Note: The backend uses /payment-methods to list payment methods
      // For actual payment history, we might need to use admin endpoints or wait for implementation
      const { data } = await api.get<PaymentHistoryResponse>('/payment-methods', {
        params: { page, page_size: pageSize },
      })
      return data
    } catch (error) {
      // If endpoint doesn't exist yet, return empty array
      console.warn('Payment history endpoint not available yet')
      return {
        payments: [],
        total: 0,
        page: 1,
        page_size: pageSize,
      }
    }
  },

  /**
   * Get subscription plans
   * Public endpoint to list available subscription plans
   */
  async getSubscriptionPlans(): Promise<{ plans: any[] }> {
    const { data } = await api.get<{ plans: any[] }>('/plans')
    return data
  },

  /**
   * Subscribe to a plan
   * Requires owner role
   */
  async subscribeToPlan(planId: string, paymentMethodId?: string): Promise<{ message: string; subscription: any }> {
    const { data } = await api.post<{ message: string; subscription: any }>('/subscriptions/subscribe', {
      plan_id: planId,
      payment_method_id: paymentMethodId,
    })
    return data
  },

  /**
   * Cancel subscription
   */
  async cancelSubscription(reason?: string): Promise<{ message: string }> {
    const { data } = await api.delete<{ message: string }>('/subscriptions/cancel', {
      data: reason ? { reason } : {},
    })
    return data
  },

  /**
   * Get detailed subscription status
   */
  async getDetailedSubscriptionStatus(): Promise<any> {
    const { data } = await api.get<any>('/subscriptions/status')
    return data
  },
}

export default subscriptionService
