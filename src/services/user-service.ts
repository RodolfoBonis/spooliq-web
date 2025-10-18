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
    const { data } = await api.get<{ users: User[] }>('/users')
    return data.users
  },

  async create(userData: CreateUserDTO): Promise<User> {
    const { data } = await api.post<{ user: User }>('/users', userData)
    return data.user
  },

  async update(id: string, userData: UpdateUserDTO): Promise<User> {
    const { data } = await api.put<{ user: User }>(`/users/${id}`, userData)
    return data.user
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/users/${id}`)
  },
}

