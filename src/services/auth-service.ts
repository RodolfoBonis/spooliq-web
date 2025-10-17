import api from '@/lib/api/client'
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from '@/types/api'
import type { User } from '@/types/models'

export const authService = {
  /**
   * Login user
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>('/login', credentials)
    return data
  },

  /**
   * Register new company and owner user
   */
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await api.post<RegisterResponse>('/register', data)
    return response.data
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await api.post('/logout')
    } catch (error) {
      // Even if logout fails on backend, clear local storage
      console.error('Logout error:', error)
    }
  },

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>('/refresh')
    return data
  },

  /**
   * Validate current token
   */
  async validateToken(): Promise<{ valid: boolean; user?: User }> {
    try {
      const { data } = await api.post<{ valid: boolean; user: User }>(
        '/validate_token'
      )
      return data
    } catch (error) {
      return { valid: false }
    }
  },

  /**
   * Get current user info (assuming there's a /me endpoint or similar)
   * This is a placeholder - adjust based on actual backend endpoint
   */
  async getCurrentUser(): Promise<User> {
    const { data } = await api.get<User>('/users/me')
    return data
  },
}

export default authService

