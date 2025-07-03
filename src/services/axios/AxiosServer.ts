import axios from 'axios'
import type { AxiosError } from 'axios'

// Server-side axios instance for direct backend communication
// Used for authentication and other server-side operations
const AxiosServer = axios.create({
    timeout: Number(process.env.NEXT_PUBLIC_API_TIMEOUT) || 60000,
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
    // Don't use withCredentials on server-side
    withCredentials: false,
})

// Simple request interceptor
AxiosServer.interceptors.request.use(
    (config) => {
        // Log request in development
        if (process.env.NODE_ENV === 'development') {
            console.log('[Server API Request]', {
                method: config.method,
                url: config.url,
                baseURL: config.baseURL,
            })
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    },
)

// Simple response interceptor
AxiosServer.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (process.env.NODE_ENV === 'development') {
            console.error('[Server API Error]', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data,
                url: error.config?.url,
            })
        }
        return Promise.reject(error)
    },
)

export default AxiosServer