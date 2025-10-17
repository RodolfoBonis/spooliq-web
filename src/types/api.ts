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

export interface ApiError {
  error: string
  message: string
  statusCode: number
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

