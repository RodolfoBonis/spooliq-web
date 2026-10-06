// API Request/Response Types

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface RegisterRequest {
  // User data
  name: string
  email: string
  password: string

  // Company data (FLAT structure)
  company_name: string
  company_trade_name?: string
  company_document: string // CNPJ - required
  company_phone: string // required

  // Address (ALL required)
  address: string
  address_number: string
  complement?: string
  neighborhood: string
  city: string
  state: string // 2 characters (e.g., "SP")
  zip_code: string
}

export interface RegisterResponse {
  user_id: string
  organization_id: string
  trial_ends_at: string // ISO 8601
  message: string
}

export interface PaginationParams {
  page?: number
  pageSize?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// Subscription API Types
export interface GetSubscriptionResponse {
  subscription_status: string
  subscription_plan: string
  trial_ends_at?: string
  subscription_started_at?: string
  next_payment_due?: string
  asaas_customer_id?: string
  asaas_subscription_id?: string
}

export interface PaymentHistoryResponse {
  payments: Array<{
    id: string
    organization_id: string
    asaas_payment_id?: string
    asaas_invoice_id?: string
    amount: number
    status: string
    payment_date?: string
    due_date: string
    invoice_url?: string
    created_at: string
  }>
  total: number
  page: number
  page_size: number
}

