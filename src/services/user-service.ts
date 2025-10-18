import { api } from '@/lib/api/client'

export interface User {
  id: string
  name: string
  email: string
  roles: string[]
  organization_id: string
  created_at: string
  updated_at: string
}

export interface CreateUserDTO {
  name: string
  email: string
  password: string
  role: 'OrgAdmin' | 'User'
}

export interface UpdateUserDTO {
  name?: string
  email?: string
  role?: 'OrgAdmin' | 'User'
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

