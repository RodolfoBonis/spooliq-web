import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types/models'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean

  // Actions
  setAuth: (user: User, token: string) => void
  setUser: (user: User) => void
  logout: () => void
  hasRole: (roles: string | string[]) => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      setAuth: (user, token) => {
        set({
          user,
          token,
          isAuthenticated: true,
        })
      },

      setUser: (user) => {
        set({ user })
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        })
        // Redirect to login page
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
      },

      hasRole: (roles) => {
        const user = get().user
        if (!user || !user.roles) return false

        const rolesToCheck = Array.isArray(roles) ? roles : [roles]
        return user.roles.some((role) => rolesToCheck.includes(role))
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)

