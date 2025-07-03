import type { AxiosError, AxiosInstance } from 'axios'
import { tokenRefreshService } from '../auth/token-refresh.service'

const AxiosResponseIntrceptorErrorCallback = async (error: AxiosError, axiosInstance: AxiosInstance): Promise<any> => {
    // Log error for debugging
    if (process.env.NODE_ENV === 'development') {
        console.error('[API Error]', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            config: {
                url: error.config?.url,
                method: error.config?.method,
                baseURL: error.config?.baseURL,
            }
        })
    }
    
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
        // Skip refresh for auth endpoints to prevent infinite loops
        const authEndpoints = ['/auth/login', '/auth/refresh', '/auth/logout']
        const isAuthEndpoint = authEndpoints.some(endpoint => 
            error.config?.url?.includes(endpoint)
        )
        
        if (!isAuthEndpoint) {
            // Attempt to refresh token and retry the request
            return tokenRefreshService.handle401Error(error, axiosInstance)
        }
    }
    
    // For other errors, just return the error
    // You can add toast notifications or other error handling here
    return Promise.reject(error)
}

export default AxiosResponseIntrceptorErrorCallback