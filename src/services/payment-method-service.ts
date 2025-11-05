import { api } from '@/lib/api/client'
import type { PaymentMethod } from '@/types/models'

export interface AddPaymentMethodRequest {
  card_number: string
  card_holder_name: string
  expiry_month: string
  expiry_year: string
  cvv: string
  billing_address?: {
    street: string
    city: string
    state: string
    zip_code: string
    country: string
  }
}

export interface PaymentMethodResponse {
  payment_method: PaymentMethod
  message: string
}

export interface ListPaymentMethodsResponse {
  payment_methods: PaymentMethod[]
  total: number
}

export const paymentMethodService = {
  /**
   * Add a new payment method
   * Only owners can add payment methods
   */
  async addPaymentMethod(data: AddPaymentMethodRequest): Promise<PaymentMethodResponse> {
    const response = await api.post<PaymentMethodResponse>('/payment-methods', data)
    return response.data
  },

  /**
   * List all payment methods for the company
   * Only owners can view payment methods
   */
  async listPaymentMethods(): Promise<ListPaymentMethodsResponse> {
    const { data } = await api.get<ListPaymentMethodsResponse>('/payment-methods')
    return data
  },

  /**
   * Set a payment method as primary
   * Only owners can modify payment methods
   */
  async setPrimaryPaymentMethod(id: string): Promise<{ message: string }> {
    const { data } = await api.put<{ message: string }>(`/payment-methods/${id}/set-primary`)
    return data
  },

  /**
   * Delete a payment method
   * Only owners can delete payment methods
   */
  async deletePaymentMethod(id: string): Promise<{ message: string }> {
    const { data } = await api.delete<{ message: string }>(`/payment-methods/${id}`)
    return data
  },
}

export default paymentMethodService