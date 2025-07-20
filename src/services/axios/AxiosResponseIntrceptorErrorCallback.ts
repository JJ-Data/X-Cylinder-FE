import { getSession } from 'next-auth/react'
import type { AxiosError, AxiosInstance } from 'axios'

const AxiosResponseIntrceptorErrorCallback = async (error: AxiosError, axiosInstance: AxiosInstance): Promise<any> => {
    const originalRequest = error.config as any
    
    // Log error for debugging
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
    
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true
        
        // Try to refresh the session
        try {
            const session = await getSession()
            
            if (session && (session as any).accessToken) {
                // Update the authorization header and retry
                originalRequest.headers['Authorization'] = `Bearer ${(session as any).accessToken}`
                return axiosInstance(originalRequest)
            }
        } catch (refreshError) {
            console.error('[API Error] Failed to refresh session:', refreshError)
        }
        
        // If refresh failed, session has expired
        console.log('[API Error] 401 Unauthorized - Session likely expired')
    }
    
    // For other errors, just return the error
    return Promise.reject(error)
}

export default AxiosResponseIntrceptorErrorCallback