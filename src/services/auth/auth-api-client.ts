import axios from 'axios'

/**
 * A separate axios instance for authentication operations
 * This instance doesn't use interceptors to avoid circular dependencies
 * It's used specifically for login, logout, and token refresh operations
 */
const authApiClient = axios.create({
    timeout: Number(process.env.NEXT_PUBLIC_API_TIMEOUT) || 60000,
    baseURL: '/api/proxy', // Use our proxy endpoint
    withCredentials: true, // Enable cookies for HTTP-only authentication
})

export default authApiClient