import { api } from '@/lib/api/client'
import type { PrintProfile } from '@/types/models'

export interface CreateProfileDTO {
  name?: string // Optional - the API auto-generates "{machine} · {energy}" when omitted
  description?: string
  machine_preset_id: string
  energy_preset_id: string
  cost_preset_id?: string
  is_default?: boolean
}

// Note: the API treats omitted/empty fields as "keep current value".
export type UpdateProfileDTO = Partial<CreateProfileDTO>

export const profileService = {
  async list(): Promise<PrintProfile[]> {
    const { data } = await api.get<PrintProfile[]>('/profiles')
    return data ?? []
  },

  async getById(id: string): Promise<PrintProfile> {
    const { data } = await api.get<PrintProfile>(`/profiles/${id}`)
    return data
  },

  async create(profile: CreateProfileDTO): Promise<PrintProfile> {
    const { data } = await api.post<PrintProfile>('/profiles', profile)
    return data
  },

  async update(id: string, profile: UpdateProfileDTO): Promise<PrintProfile> {
    const { data } = await api.put<PrintProfile>(`/profiles/${id}`, profile)
    return data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/profiles/${id}`)
  },

  async setDefault(id: string): Promise<PrintProfile> {
    const { data } = await api.post<PrintProfile>(`/profiles/${id}/default`)
    return data
  },

  async duplicate(id: string): Promise<PrintProfile> {
    const { data } = await api.post<PrintProfile>(`/profiles/${id}/duplicate`)
    return data
  },
}
