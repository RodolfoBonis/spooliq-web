import { isAxiosError } from 'axios'
import { api } from '@/lib/api/client'
import { toPage } from '@/lib/api/pagination'
import type { Company } from '@/types/models'
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
   * Get payment history for the current company.
   * Backend route: `GET /company/subscription/payments` (Owner only) — see
   * features/company/routes.go. Tolerant to both the new `{ data, total, ... }` envelope
   * and legacy wrappers (`payments`, `entries`, `payment_methods`).
   */
  async getPaymentHistory(page = 1, pageSize = 10): Promise<PaymentHistoryResponse> {
    try {
      const { data } = await api.get('/company/subscription/payments', {
        params: { page, page_size: pageSize },
      })
      const result = toPage<PaymentHistoryResponse['payments'][number]>(data, 'payments')
      // Until the API exposes the owner's payment history, this route returns payment
      // *methods*; keep only rows that are actually payments so the UI never shows cards
      // as payments (amount/due_date would be undefined).
      const payments = result.data.filter(
        (row) => typeof row?.amount === 'number' && typeof row?.due_date === 'string'
      )
      return {
        payments,
        total: payments.length === result.data.length ? result.total : payments.length,
        page: result.page,
        page_size: result.pageSize,
      }
    } catch (error) {
      // Treat a missing endpoint as "no history yet"; surface everything else.
      if (isAxiosError(error) && error.response?.status === 404) {
        return { payments: [], total: 0, page, page_size: pageSize }
      }
      console.error('Error fetching subscription payment history:', error)
      throw error
    }
  },

  /**
   * Subscribe to a plan
   * Requires owner role
   */
  async subscribeToPlan(planId: string, paymentMethodId?: string): Promise<{ message: string; subscription: unknown }> {
    const { data } = await api.post<{ message: string; subscription: unknown }>('/subscriptions/subscribe', {
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
  async getDetailedSubscriptionStatus(): Promise<unknown> {
    const { data } = await api.get<unknown>('/subscriptions/status')
    return data
  },
}

export default subscriptionService
