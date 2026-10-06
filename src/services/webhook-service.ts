import { api } from '@/lib/api/client'
import type { AsaasWebhookEvent } from '@/types/models'
import { toPage } from '@/lib/api/pagination'

export interface WebhookLog {
  id: string
  provider: 'asaas' | 'stripe' | 'other'
  event_type: string
  payload: any
  status: 'pending' | 'processing' | 'processed' | 'failed'
  error_message?: string
  processed_at?: string
  created_at: string
}

export interface WebhookConfigRequest {
  provider: 'asaas' | 'stripe'
  webhook_secret: string
  endpoint_url: string
  events: string[]
  is_active: boolean
}

export const webhookService = {
  /**
   * Process incoming webhook from Asaas
   * This is typically called by the backend automatically
   * Frontend may need to handle webhook-triggered updates
   */
  async processAsaasWebhook(event: AsaasWebhookEvent): Promise<{ success: boolean; message: string }> {
    try {
      // The backend handles the actual webhook processing
      // This method is for frontend to trigger manual processing if needed
      const { data } = await api.post<{ success: boolean; message: string }>('/webhooks/asaas', event)
      return data
    } catch (error) {
      console.error('Error processing Asaas webhook:', error)
      return { success: false, message: 'Failed to process webhook' }
    }
  },

  /**
   * Get webhook logs (admin only)
   * View history of webhook events for debugging
   */
  async getWebhookLogs(
    provider?: 'asaas' | 'stripe',
    page = 1,
    pageSize = 20
  ): Promise<{ logs: WebhookLog[]; total: number; page: number; page_size: number }> {
    const { data } = await api.get('/admin/webhooks/logs', {
      params: {
        provider,
        page,
        page_size: pageSize,
      },
    })
    const result = toPage<WebhookLog>(data, 'logs')
    return { logs: result.data, total: result.total, page: result.page, page_size: result.pageSize }
  },

  /**
   * Retry failed webhook (admin only)
   * Manually retry processing of a failed webhook
   */
  async retryWebhook(logId: string): Promise<{ success: boolean; message: string }> {
    const { data } = await api.post<{ success: boolean; message: string }>(`/admin/webhooks/logs/${logId}/retry`)
    return data
  },

  /**
   * Configure webhook settings (admin only)
   * Update webhook configuration for payment providers
   */
  async updateWebhookConfig(config: WebhookConfigRequest): Promise<{ success: boolean; message: string }> {
    const { data } = await api.put<{ success: boolean; message: string }>('/admin/webhooks/config', config)
    return data
  },

  /**
   * Test webhook endpoint (admin only)
   * Send a test webhook to verify configuration
   */
  async testWebhook(provider: 'asaas' | 'stripe'): Promise<{ success: boolean; message: string; response?: any }> {
    const { data } = await api.post<{ success: boolean; message: string; response?: any }>(
      `/admin/webhooks/test/${provider}`
    )
    return data
  },

  /**
   * Handle webhook-triggered UI updates
   * This method should be called when receiving real-time webhook notifications
   */
  handleWebhookNotification(event: AsaasWebhookEvent): void {
    // Handle different webhook events
    switch (event.event) {
      case 'PAYMENT_CONFIRMED':
        // Update payment status in UI
        console.log('Payment confirmed:', event.payment?.id)
        // Trigger UI update or notification
        break

      case 'PAYMENT_OVERDUE':
        // Show overdue payment warning
        console.log('Payment overdue:', event.payment?.id)
        // Trigger warning notification
        break

      case 'SUBSCRIPTION_UPDATED':
        // Update subscription status
        console.log('Subscription updated:', event.subscription?.id)
        // Refresh subscription data
        break

      case 'SUBSCRIPTION_CANCELLED':
        // Handle subscription cancellation
        console.log('Subscription cancelled:', event.subscription?.id)
        // Show cancellation notice
        break

      default:
        console.log('Unhandled webhook event:', event.event)
    }
  },
}

export default webhookService