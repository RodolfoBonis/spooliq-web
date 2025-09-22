import axios, { AxiosInstance, AxiosResponse } from 'axios'
import Cookies from 'js-cookie'
import toast from 'react-hot-toast'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    // Use proxy durante desenvolvimento para evitar CORS
    const isDevelopment = process.env.NODE_ENV === 'development'
    const baseURL = isDevelopment
      ? '/api/proxy'
      : process.env.NEXT_PUBLIC_API_URL || 'https://api.spooliq.rodolfodebonis.com.br/v1'

    this.client = axios.create({
      baseURL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      withCredentials: false,
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor para adicionar auth token
    this.client.interceptors.request.use(
      (config) => {
        // Para client-side, usar cookies
        if (typeof window !== 'undefined') {
          const token = Cookies.get('auth-token')
          if (token) {
            config.headers.Authorization = `Bearer ${token}`
          }
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor para handle de erros e refresh token
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true

          try {
            await this.refreshToken()
            return this.client(originalRequest)
          } catch {
            // Redirect to login
            if (typeof window !== 'undefined') {
              Cookies.remove('auth-token')
              Cookies.remove('refresh-token')
              window.location.href = '/login'
            }
            return Promise.reject(new Error('Failed to refresh token'))
          }
        }

        // Handle other errors
        if (error.response?.data?.message) {
          toast.error(error.response.data.message)
        } else if (error.code === 'ERR_NETWORK') {
          toast.error('Erro de rede - verifique sua conexão')
        } else {
          toast.error('Erro na comunicação com o servidor')
        }

        return Promise.reject(error)
      }
    )
  }

  private async refreshToken(): Promise<void> {
    const refreshToken = Cookies.get('refresh-token')
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    try {
      const isDevelopment = process.env.NODE_ENV === 'development'
      const baseURL = isDevelopment
        ? '/api/proxy'
        : process.env.NEXT_PUBLIC_API_URL || 'https://api.spooliq.rodolfodebonis.com.br/v1'

      const response = await axios.post(
        `${baseURL}/refresh`,
        { refresh_token: refreshToken }
      )

      const { access_token, refresh_token: newRefreshToken } = response.data

      Cookies.set('auth-token', access_token, { expires: 7 })
      if (newRefreshToken) {
        Cookies.set('refresh-token', newRefreshToken, { expires: 30 })
      }
    } catch {
      throw new Error('Failed to refresh token')
    }
  }

  // Generic methods
  async get<T>(url: string): Promise<T> {
    const response: AxiosResponse<T> = await this.client.get(url)
    return response.data
  }

  async post<T, D = unknown>(url: string, data?: D): Promise<T> {
    const response: AxiosResponse<T> = await this.client.post(url, data)
    return response.data
  }

  async put<T, D = unknown>(url: string, data?: D): Promise<T> {
    const response: AxiosResponse<T> = await this.client.put(url, data)
    return response.data
  }

  async delete<T>(url: string): Promise<T> {
    const response: AxiosResponse<T> = await this.client.delete(url)
    return response.data
  }
}

// Create singleton instance
export const apiClient = new ApiClient()

// Export for use in services
export default apiClient