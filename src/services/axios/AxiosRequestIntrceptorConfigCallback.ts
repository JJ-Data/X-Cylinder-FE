import { getSession } from 'next-auth/react'
import type { InternalAxiosRequestConfig } from 'axios'

const AxiosRequestIntrceptorConfigCallback = async (
    config: InternalAxiosRequestConfig,
) => {
    // Add Content-Type header if not set
    if (!config.headers['Content-Type']) {
        config.headers['Content-Type'] = 'application/json'
    }
    
    // Get the session on each request to ensure we have the latest token
    try {
        const startTime = Date.now()
        const session = await getSession()
        const sessionFetchTime = Date.now() - startTime
        
        // Enhanced logging for debugging
        if (process.env.NODE_ENV === 'development' || !session || !(session as any)?.accessToken) {
            console.log(`[Axios Interceptor ${new Date().toISOString()}]`, {
                url: config.url,
                method: config.method?.toUpperCase(),
                hasSession: !!session,
                hasAccessToken: !!(session as any)?.accessToken,
                sessionFetchTime: `${sessionFetchTime}ms`,
                userEmail: session?.user?.email,
                userRole: session?.user?.role
            })
        }
        
        if (session && (session as any).accessToken) {
            // Add Bearer token to the request
            config.headers['Authorization'] = `Bearer ${(session as any).accessToken}`
            console.log(`[Axios Interceptor] Added auth header for ${config.url}`)
        } else {
            console.warn(`[Axios Interceptor] No access token available for ${config.url}`)
        }
    } catch (error) {
        // Log error but don't block the request
        console.error('[Axios Interceptor] Failed to get session:', {
            error: error instanceof Error ? error.message : error,
            url: config.url
        })
    }
    
    return config
}

export default AxiosRequestIntrceptorConfigCallback
