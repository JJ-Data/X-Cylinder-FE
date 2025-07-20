import axios from 'axios'
import type { AxiosError } from 'axios'

// Server-side axios instance for direct backend communication
// Used for authentication and other server-side operations
const AxiosServer = axios.create({
    timeout: Number(process.env.NEXT_PUBLIC_API_TIMEOUT) || 60000,
    baseURL: process.env.BACKEND_API_URL || 'http://localhost:3000/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
    // Don't use withCredentials on server-side
    withCredentials: false,
})

// Simple request interceptor
AxiosServer.interceptors.request.use(
    (config) => {
        // Log all requests for debugging (temporarily enabled for production)
        console.log('[AxiosServer Request]', {
            method: config.method,
            url: config.url,
            baseURL: config.baseURL,
            fullUrl: `${config.baseURL}${config.url}`,
            headers: config.headers,
            hasData: !!config.data,
            timeout: config.timeout
        })
        return config
    },
    (error) => {
        return Promise.reject(error)
    },
)

// Simple response interceptor
AxiosServer.interceptors.response.use(
    (response) => {
        console.log('[AxiosServer Response Success]', {
            status: response.status,
            statusText: response.statusText,
            url: response.config?.url,
            baseURL: response.config?.baseURL,
            hasData: !!response.data
        })
        return response
    },
    (error: AxiosError) => {
        console.error('[AxiosServer Response Error]', {
            message: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            url: error.config?.url,
            baseURL: error.config?.baseURL,
            fullUrl: error.config ? `${error.config.baseURL}${error.config.url}` : 'Unknown',
            code: error.code,
            stack: error.stack
        })
        return Promise.reject(error)
    },
)

export default AxiosServer