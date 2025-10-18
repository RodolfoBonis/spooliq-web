import { api } from '@/lib/api/client'

export interface User {
  id: string
  name: string
  email: string
  user_type: string // 'owner', 'admin', 'user'
  organization_id: string
  keycloak_user_id: string
  is_active: boolean
  created_at: string
  updated_at: string
  deleted_at?: string
}

export interface CreateUserDTO {
  name: string
  email: string
  password: string
  user_type: 'admin' | 'user'
}

export interface UpdateUserDTO {
  name?: string
  is_active?: boolean
}

export const userService = {
  async list(): Promise<User[]> {
    const { data } = await api.get<User[]>('/users')
    return data
  },

  async create(userData: CreateUserDTO): Promise<User> {
    const { data } = await api.post<User>('/users', userData)
    return data
  },

  async update(id: string, userData: UpdateUserDTO): Promise<User> {
    const { data } = await api.put<User>(`/users/${id}`, userData)
    return data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/users/${id}`)
  },
}

