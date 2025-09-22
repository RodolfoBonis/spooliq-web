import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import Cookies from 'js-cookie'
import { User, TokenPair } from '@/types/api'

interface AuthState {
  user: User | null
  tokens: TokenPair | null
  isAuthenticated: boolean
  isLoading: boolean
}

interface AuthActions {
  setAuth: (user: User, tokens: TokenPair) => void
  clearAuth: () => void
  setLoading: (loading: boolean) => void
  updateUser: (user: Partial<User>) => void
}

type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,

      // Actions
      setAuth: (user: User, tokens: TokenPair) => {
        // Set cookies
        Cookies.set('auth-token', tokens.access_token, { expires: 7 })
        Cookies.set('refresh-token', tokens.refresh_token, { expires: 30 })

        set({
          user,
          tokens,
          isAuthenticated: true,
          isLoading: false,
        })
      },

      clearAuth: () => {
        // Remove cookies
        Cookies.remove('auth-token')
        Cookies.remove('refresh-token')

        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
          isLoading: false,
        })
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData }
          })
        }
      },
    }),
    {
      name: 'spooliq-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)