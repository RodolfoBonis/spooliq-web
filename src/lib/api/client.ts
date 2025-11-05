import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import { toast } from 'sonner'

// Use Next.js proxy for ALL requests (browser and server-side)
// The proxy will handle forwarding to the actual backend
const API_URL = typeof window !== 'undefined'
  ? '/api' // Client-side: use Next.js proxy
  : 'http://localhost:3000/api' // Server-side: also use proxy through localhost:3000

if (typeof window !== 'undefined') {
  console.log('🔧 API Client initialized')
  console.log('🔧 Base URL:', API_URL)
  console.log('🔧 Environment:', 'browser')
}

// Create axios instance
export const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const fullUrl = `${config.baseURL}${config.url}`
    console.log('📡 API Request:', config.method?.toUpperCase(), fullUrl)
    
    // Remove Content-Type header for FormData requests to let axios set it automatically
    if (config.data instanceof FormData) {
      console.log('📡 FormData detected, removing Content-Type header')
      delete config.headers['Content-Type']
    }
    
    // Get token from localStorage
    if (typeof window !== 'undefined') {
      const authStore = localStorage.getItem('auth-storage')
      if (authStore) {
        try {
          const { state } = JSON.parse(authStore)
          if (state?.token) {
            config.headers.Authorization = `Bearer ${state.token}`
          }
        } catch (error) {
          console.error('Error parsing auth storage:', error)
        }
      }
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.status, response.config.url)
    return response
  },
  (error: AxiosError<{ error?: string; message?: string }>) => {
    console.error('❌ API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      fullUrl: `${error.config?.baseURL}${error.config?.url}`,
    })

    // Handle 401 Unauthorized - logout user
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth-storage')
        window.location.href = '/login'
      }
      toast.error('Sessão expirada. Por favor, faça login novamente.')
      return Promise.reject(error)
    }

    // Handle other errors with toast notifications
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Erro ao processar requisição'

    // Don't show toast for expected errors (like validation errors that component handles)
    // Also don't show toast for successful responses that had processing errors
    // Let components handle their own error messages
    // if (error.response?.status !== 400) {
    //   toast.error(errorMessage)
    // }

    return Promise.reject(error)
  }
)

export default api

