import apiClient from '@/lib/api-client'
import { LoginRequest, RegisterRequest, AuthResponse, User } from '@/types/api'

export class AuthService {
  static async login(credentials: LoginRequest): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/login', credentials)
  }

  static async register(data: RegisterRequest): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/register', data)
  }

  static async logout(): Promise<void> {
    return apiClient.post<void>('/logout')
  }

  static async me(): Promise<User> {
    return apiClient.get<User>('/me')
  }

  static async refreshToken(refreshToken: string): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/refresh', {
      refresh_token: refreshToken,
    })
  }
}