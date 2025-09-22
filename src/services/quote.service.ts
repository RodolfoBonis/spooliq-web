import apiClient from '@/lib/api-client'
import {
  Quote,
  CreateQuoteRequest,
  QuoteFilters,
  PaginatedResponse,
  CalculateQuoteRequest,
  CalculationResult
} from '@/types/api'

export class QuoteService {
  static async getQuotes(filters?: QuoteFilters, page = 1, perPage = 10): Promise<PaginatedResponse<Quote>> {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
      ...(filters?.search && { search: filters.search }),
      ...(filters?.dateRange?.from && { date_from: filters.dateRange.from }),
      ...(filters?.dateRange?.to && { date_to: filters.dateRange.to }),
      ...(filters?.sortBy && { sort_by: filters.sortBy }),
      ...(filters?.sortOrder && { sort_order: filters.sortOrder }),
    })

    const response = await apiClient.get<any>(`/quotes?${params}`)

    // Map the API response to our expected structure
    return {
      data: response.quotes || response.data || [],
      total: response.total || 0,
      page: response.page || page,
      per_page: response.per_page || perPage,
      last_page: response.last_page || 1,
    }
  }

  static async getQuote(id: string): Promise<Quote> {
    return apiClient.get<Quote>(`/quotes/${id}`)
  }

  static async createQuote(data: CreateQuoteRequest): Promise<Quote> {
    return apiClient.post<Quote>('/quotes', data)
  }

  static async updateQuote(id: string, data: Partial<CreateQuoteRequest>): Promise<Quote> {
    return apiClient.put<Quote>(`/quotes/${id}`, data)
  }

  static async deleteQuote(id: string): Promise<void> {
    return apiClient.delete<void>(`/quotes/${id}`)
  }

  static async calculateQuote(id: string, data: CalculateQuoteRequest): Promise<CalculationResult> {
    return apiClient.post<CalculationResult>(`/quotes/${id}/calculate`, data)
  }

  static async duplicateQuote(id: string): Promise<Quote> {
    return apiClient.post<Quote>(`/quotes/${id}/duplicate`)
  }

  static async exportQuote(id: string, format: 'pdf' | 'csv'): Promise<Blob> {
    const response = await apiClient.client.get(`/quotes/${id}/export/${format}`, {
      responseType: 'blob'
    })
    return response.data
  }
}