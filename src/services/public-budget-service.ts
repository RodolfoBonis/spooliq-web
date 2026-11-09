import axios, { isAxiosError, type AxiosInstance } from 'axios'
import type {
  PublicBudget,
  PublicBudgetPaymentKind,
} from '@/types/models'

/**
 * Dedicated axios instance for the PUBLIC budget approval flow.
 *
 * It deliberately does NOT reuse the shared `api` client: that one injects the
 * auth token and, on 401, wipes localStorage and redirects to /login. The public
 * endpoints require no auth, so we use a bare instance that goes through the same
 * Next.js proxy (`/api/...` → `${API_URL}/...`, i.e. `/v1/public/budgets/...`).
 */
const baseURL = typeof window !== 'undefined' ? '/api' : 'http://localhost:3000/api'

const publicApi: AxiosInstance = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

export interface PublicApproveDTO {
  name: string
}

export interface PublicRejectDTO {
  name: string
  reason?: string
}

export interface CreatePublicPaymentDTO {
  kind: PublicBudgetPaymentKind
}

/** API returns the InfinitePay hosted checkout URL to redirect the customer to. */
export interface CreatePublicPaymentResponse {
  checkout_url: string
}

export interface ConfirmPublicPaymentDTO {
  order_nsu: string
  transaction_nsu: string
  slug: string
  receipt_url?: string
}

/** Confirm returns the refreshed public view plus the resolved confirmation state. */
export type ConfirmPublicPaymentResponse = PublicBudget & {
  confirmation: 'paid' | 'processing'
}

export const publicBudgetService = {
  /** Fetch the public view of a budget by its share token. */
  async get(token: string): Promise<PublicBudget> {
    const { data } = await publicApi.get<PublicBudget>(
      `/public/budgets/${encodeURIComponent(token)}`
    )
    return data
  },

  /** Download the budget PDF (public). */
  async getPDF(token: string): Promise<Blob> {
    try {
      const { data } = await publicApi.get<Blob>(
        `/public/budgets/${encodeURIComponent(token)}/pdf`,
        { responseType: 'blob' }
      )
      return data
    } catch (error) {
      // With responseType 'blob' the error body is a Blob; parse it so error codes work.
      if (isAxiosError(error) && error.response?.data instanceof Blob) {
        try {
          error.response.data = JSON.parse(await error.response.data.text())
        } catch {
          // not JSON; keep as is
        }
      }
      throw error
    }
  },

  /** Approve the budget. Returns the updated public view. */
  async approve(token: string, body: PublicApproveDTO): Promise<PublicBudget> {
    const { data } = await publicApi.post<PublicBudget>(
      `/public/budgets/${encodeURIComponent(token)}/approve`,
      body
    )
    return data
  },

  /** Reject the budget. Returns the updated public view. */
  async reject(token: string, body: PublicRejectDTO): Promise<PublicBudget> {
    const { data } = await publicApi.post<PublicBudget>(
      `/public/budgets/${encodeURIComponent(token)}/reject`,
      body
    )
    return data
  },

  /** Create (or reuse) an InfinitePay checkout link for the budget's next charge. */
  async createPayment(
    token: string,
    body: CreatePublicPaymentDTO
  ): Promise<CreatePublicPaymentResponse> {
    const { data } = await publicApi.post<CreatePublicPaymentResponse>(
      `/public/budgets/${encodeURIComponent(token)}/payments`,
      body
    )
    return data
  },

  /** Confirm a payment after the customer returns from the InfinitePay checkout. */
  async confirmPayment(
    token: string,
    body: ConfirmPublicPaymentDTO
  ): Promise<ConfirmPublicPaymentResponse> {
    const { data } = await publicApi.post<ConfirmPublicPaymentResponse>(
      `/public/budgets/${encodeURIComponent(token)}/payments/confirm`,
      body
    )
    return data
  },
}

export default publicBudgetService
