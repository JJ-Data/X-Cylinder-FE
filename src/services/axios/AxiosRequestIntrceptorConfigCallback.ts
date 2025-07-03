import type { InternalAxiosRequestConfig } from 'axios'

const AxiosRequestIntrceptorConfigCallback = async (
    config: InternalAxiosRequestConfig,
) => {
    // Add Content-Type header if not set
    if (!config.headers['Content-Type']) {
        config.headers['Content-Type'] = 'application/json'
    }
    
    // Cookies are automatically sent with withCredentials: true
    // No need to manually add authentication headers
    
    return config
}

export default AxiosRequestIntrceptorConfigCallback
