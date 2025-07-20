import axios from 'axios'
import AxiosResponseIntrceptorErrorCallback from './AxiosResponseIntrceptorErrorCallback'
import AxiosRequestIntrceptorConfigCallback from './AxiosRequestIntrceptorConfigCallback'
import type { AxiosError } from 'axios'

const AxiosBase = axios.create({
    timeout: Number(process.env.NEXT_PUBLIC_API_TIMEOUT) || 60000,
    baseURL: '/api/proxy', // Use our proxy endpoint
    // No longer need withCredentials since we're using Bearer tokens
})

AxiosBase.interceptors.request.use(
    (config) => {
        return AxiosRequestIntrceptorConfigCallback(config)
    },
    (error) => {
        return Promise.reject(error)
    },
)

AxiosBase.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        return AxiosResponseIntrceptorErrorCallback(error, AxiosBase)
    },
)

export default AxiosBase
