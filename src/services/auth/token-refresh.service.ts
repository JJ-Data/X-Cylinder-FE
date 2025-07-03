import authApiClient from './auth-api-client'
import type { AxiosError, InternalAxiosRequestConfig, AxiosInstance } from 'axios'

interface RefreshResponse {
  success: boolean
  data: {
    user: any
  }
  message?: string
}

class TokenRefreshService {
  private isRefreshing = false
  private refreshSubscribers: Array<(token: string) => void> = []

  /**
   * Refresh the access token using the refresh token
   */
  async refreshToken(): Promise<boolean> {
    try {
      // The refresh token is sent as HTTP-only cookie automatically
      // Use authApiClient to avoid circular dependency
      const response = await authApiClient.post<RefreshResponse>('/auth/refresh', {})
      
      if (response.data.success) {
        // Cookies are automatically set by the backend response
        return true
      }
      
      return false
    } catch (error) {
      console.error('Token refresh failed:', error)
      return false
    }
  }

  /**
   * Handle 401 errors by refreshing the token and retrying the request
   * @param error - The axios error
   * @param axiosInstance - The axios instance to use for retrying the request
   */
  async handle401Error(error: AxiosError, axiosInstance: AxiosInstance): Promise<any> {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
    
    if (!originalRequest || originalRequest._retry) {
      return Promise.reject(error)
    }

    if (this.isRefreshing) {
      // If already refreshing, queue this request
      return new Promise((resolve) => {
        this.refreshSubscribers.push(() => {
          resolve(axiosInstance(originalRequest))
        })
      })
    }

    originalRequest._retry = true
    this.isRefreshing = true

    try {
      const refreshSuccess = await this.refreshToken()
      
      if (refreshSuccess) {
        // Notify all subscribers that token has been refreshed
        this.refreshSubscribers.forEach(callback => callback(''))
        this.refreshSubscribers = []
        
        // Retry the original request
        return axiosInstance(originalRequest)
      } else {
        // Refresh failed, redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    } catch (refreshError) {
      // Refresh failed
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
      return Promise.reject(refreshError)
    } finally {
      this.isRefreshing = false
    }
  }

  /**
   * Check if we should refresh the token proactively
   * Since we're using HTTP-only cookies, we can't check expiration on client
   * Instead, we'll rely on 401 responses to trigger refresh
   */
  shouldRefreshToken(): boolean {
    // With HTTP-only cookies, we can't access the token to check expiration
    // The backend will return 401 when the token is expired
    return false
  }
}

export const tokenRefreshService = new TokenRefreshService()