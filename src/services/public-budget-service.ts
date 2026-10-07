import axios, { type AxiosInstance } from 'axios'
import type { PublicBudget } from '@/types/models'

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
    const { data } = await publicApi.get(
      `/public/budgets/${encodeURIComponent(token)}/pdf`,
      { responseType: 'blob' }
    )
    return data
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
}

export default publicBudgetService
