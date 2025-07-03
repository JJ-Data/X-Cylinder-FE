import { apiRefreshToken } from '@/services/AuthService'

const TOKEN_KEY = 'cylinderx_access_token'
const REFRESH_TOKEN_KEY = 'cylinderx_refresh_token'
const TOKEN_EXPIRY_KEY = 'cylinderx_token_expiry'

interface TokenData {
    accessToken: string
    refreshToken: string
    expiresIn?: number
}

class TokenManager {
    private refreshPromise: Promise<any> | null = null

    // Store tokens with expiry
    setTokens(data: TokenData) {
        if (typeof window === 'undefined') return

        localStorage.setItem(TOKEN_KEY, data.accessToken)
        localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken)
        
        // Calculate and store token expiry (default 15 minutes if not provided)
        const expiresIn = data.expiresIn || 900 // 15 minutes in seconds
        const expiryTime = new Date().getTime() + (expiresIn * 1000)
        localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString())
    }

    // Get access token
    getAccessToken(): string | null {
        if (typeof window === 'undefined') return null
        return localStorage.getItem(TOKEN_KEY)
    }

    // Get refresh token
    getRefreshToken(): string | null {
        if (typeof window === 'undefined') return null
        return localStorage.getItem(REFRESH_TOKEN_KEY)
    }

    // Check if token is expired
    isTokenExpired(): boolean {
        if (typeof window === 'undefined') return true

        const expiryTime = localStorage.getItem(TOKEN_EXPIRY_KEY)
        if (!expiryTime) return true

        const now = new Date().getTime()
        return now >= parseInt(expiryTime, 10)
    }

    // Check if token will expire soon (within 5 minutes)
    isTokenExpiringSoon(): boolean {
        if (typeof window === 'undefined') return true

        const expiryTime = localStorage.getItem(TOKEN_EXPIRY_KEY)
        if (!expiryTime) return true

        const now = new Date().getTime()
        const fiveMinutesFromNow = now + (5 * 60 * 1000)
        return fiveMinutesFromNow >= parseInt(expiryTime, 10)
    }

    // Clear all tokens
    clearTokens() {
        if (typeof window === 'undefined') return

        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(REFRESH_TOKEN_KEY)
        localStorage.removeItem(TOKEN_EXPIRY_KEY)
    }

    // Refresh token if needed
    async refreshTokenIfNeeded(): Promise<boolean> {
        // If token is not expiring soon, no need to refresh
        if (!this.isTokenExpiringSoon()) {
            return true
        }

        // If already refreshing, wait for the existing promise
        if (this.refreshPromise) {
            try {
                await this.refreshPromise
                return true
            } catch {
                return false
            }
        }

        // Start new refresh process
        this.refreshPromise = apiRefreshToken()

        try {
            const response = await this.refreshPromise
            if (response) {
                this.setTokens({
                    accessToken: response.token,
                    refreshToken: response.refreshToken,
                })
                return true
            }
            return false
        } catch (error) {
            this.clearTokens()
            return false
        } finally {
            this.refreshPromise = null
        }
    }

    // Parse JWT token to get user info
    parseToken(token: string): any {
        try {
            const base64Url = token.split('.')[1]
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            )
            return JSON.parse(jsonPayload)
        } catch (error) {
            console.error('Error parsing token:', error)
            return null
        }
    }

    // Get user info from stored token
    getUserFromToken() {
        const token = this.getAccessToken()
        if (!token) return null

        const tokenData = this.parseToken(token)
        if (!tokenData) return null

        return {
            userId: tokenData.userId || tokenData.sub,
            email: tokenData.email,
            role: tokenData.role,
            userName: tokenData.name || tokenData.userName,
            outletId: tokenData.outletId,
        }
    }
}

// Export singleton instance
export const tokenManager = new TokenManager()

// Re-export constants for backward compatibility
export { TOKEN_KEY, REFRESH_TOKEN_KEY }