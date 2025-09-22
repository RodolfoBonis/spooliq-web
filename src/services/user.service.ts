import apiClient from '@/lib/api-client'
import {
  User,
  PaginatedResponse,
  ApiResponse
} from '@/types/api'

export interface UserFilters {
  search?: string
  role?: string
  status?: 'active' | 'inactive' | 'suspended'
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface CreateUserRequest {
  name: string
  email: string
  password: string
  password_confirmation: string
  roles: string[]
}

export interface UpdateUserRequest {
  name?: string
  email?: string
  roles?: string[]
  status?: 'active' | 'inactive' | 'suspended'
}

export interface UpdatePasswordRequest {
  current_password: string
  password: string
  password_confirmation: string
}

export class UserService {
  static async getUsers(filters: UserFilters = {}, page = 1, perPage = 12): Promise<PaginatedResponse<User>> {
    const params = new URLSearchParams()

    if (filters.search) params.append('search', filters.search)
    if (filters.role) params.append('role', filters.role)
    if (filters.status) params.append('status', filters.status)
    if (filters.sortBy) params.append('sort_by', filters.sortBy)
    if (filters.sortOrder) params.append('sort_order', filters.sortOrder)

    params.append('page', page.toString())
    params.append('size', perPage.toString()) // Backend usa 'size' ao invés de 'per_page'

    const response = await apiClient.get<{
      users: User[]
      total: number
      page: number
      size: number
    }>(`/users?${params.toString()}`)

    // Normalizar dados dos usuários e converter para o formato esperado pelo frontend
    const normalizedUsers = response.users.map(user => ({
      ...user,
      name: user.full_name || user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username || 'Usuário',
      status: user.enabled ? 'active' : 'inactive' as 'active' | 'inactive' | 'suspended',
      role: user.roles?.find(role => role === 'Admin') ? 'admin' : 'user'
    }))

    return {
      data: normalizedUsers,
      total: response.total,
      page: response.page,
      per_page: response.size,
      last_page: Math.ceil(response.total / response.size)
    }
  }

  static async getUser(id: string): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>(`/users/${id}`)
    return response.data
  }

  static async createUser(data: CreateUserRequest): Promise<User> {
    const response = await apiClient.post<ApiResponse<User>>('/users', data)
    return response.data
  }

  static async updateUser(id: string, data: UpdateUserRequest): Promise<User> {
    const response = await apiClient.put<ApiResponse<User>>(`/users/${id}`, data)
    return response.data
  }

  static async updatePassword(id: string, data: UpdatePasswordRequest): Promise<void> {
    await apiClient.put<void>(`/users/${id}/password`, data)
  }

  static async deleteUser(id: string): Promise<void> {
    await apiClient.delete<void>(`/users/${id}`)
  }

  static async toggleUserStatus(id: string): Promise<User> {
    const response = await apiClient.patch<ApiResponse<User>>(`/users/${id}/toggle-status`)
    return response.data
  }

  static async resetPassword(id: string): Promise<{ temporary_password: string }> {
    const response = await apiClient.post<{ temporary_password: string }>(`/users/${id}/reset-password`)
    return response
  }

  // Get available roles
  static async getRoles(): Promise<string[]> {
    const response = await apiClient.get<{ roles: string[] }>('/users/roles')
    return response.roles
  }

  // Get user activity/stats
  static async getUserStats(): Promise<{
    total: number
    active: number
    inactive: number
    suspended: number
    admins: number
  }> {
    try {
      // Tentar buscar stats específicos do endpoint
      const response = await apiClient.get<{
        total: number
        active: number
        inactive: number
        suspended: number
        admins: number
      }>('/users/stats')
      return response
    } catch (error) {
      // Se não houver endpoint de stats, calcular baseado na lista de usuários
      const usersData = await this.getUsers({}, 1, 1000) // Buscar todos os usuários

      const stats = {
        total: usersData.total,
        active: 0,
        inactive: 0,
        suspended: 0,
        admins: 0
      }

      usersData.data.forEach(user => {
        if (user.status === 'active') stats.active++
        else if (user.status === 'inactive') stats.inactive++
        else if (user.status === 'suspended') stats.suspended++

        if (user.role === 'admin') stats.admins++
      })

      return stats
    }
  }
}