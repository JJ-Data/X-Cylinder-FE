import type { NextAuthConfig } from 'next-auth'
import type { JWT } from 'next-auth/jwt'
import validateCredential from '../server/actions/user/validateCredential'
import Credentials from 'next-auth/providers/credentials'
import AxiosServer from '@/services/axios/AxiosServer'

import type { SignInCredential } from '@/@types/auth'

// Role mapping utility: backend format → frontend format
function mapBackendRoleToFrontend(backendRole: string): string {
    const roleMapping: Record<string, string> = {
        'admin': 'ADMIN',
        'staff': 'STAFF',
        'refill_operator': 'REFILL_OP',
        'customer': 'CUSTOMER'
    }

    return roleMapping[backendRole?.toLowerCase()] || backendRole?.toUpperCase() || 'CUSTOMER'
}

// Buffer before actual expiry so we refresh a bit early rather than racing a live request
const REFRESH_BUFFER_MS = 60 * 1000
// Fallback lifetime if the access token's `exp` claim can't be read
const DEFAULT_ACCESS_TOKEN_TTL_MS = 15 * 60 * 1000

// Read the `exp` claim off a backend JWT (ms epoch), without verifying the signature
// (we're just using it to schedule a refresh, not to trust the token's claims)
function getAccessTokenExpiry(accessToken: string): number {
    try {
        const payload = accessToken.split('.')[1]
        const decoded = JSON.parse(Buffer.from(payload, 'base64').toString('utf-8'))
        if (typeof decoded.exp === 'number') {
            return decoded.exp * 1000
        }
    } catch (error) {
        console.error('[Auth Config] Failed to decode access token expiry:', error)
    }
    return Date.now() + DEFAULT_ACCESS_TOKEN_TTL_MS
}

// Call the backend to exchange a refresh token for a new access/refresh token pair
async function refreshAccessToken(token: JWT): Promise<JWT> {
    try {
        if (!token.refreshToken) {
            throw new Error('No refresh token available')
        }

        const response = await AxiosServer.post('/auth/refresh', {
            refreshToken: token.refreshToken,
        })

        const tokens = response.data?.data?.tokens ?? response.data?.data ?? response.data
        const newAccessToken = tokens?.accessToken
        const newRefreshToken = tokens?.refreshToken

        if (!response.data?.success || !newAccessToken) {
            throw new Error('Refresh response missing new access token')
        }

        console.log('[Auth Config] Access token refreshed successfully')

        return {
            ...token,
            accessToken: newAccessToken,
            refreshToken: newRefreshToken || token.refreshToken,
            accessTokenExpires: getAccessTokenExpiry(newAccessToken),
            error: undefined,
        }
    } catch (error) {
        console.error('[Auth Config] Failed to refresh access token:', error)
        return {
            ...token,
            error: 'RefreshAccessTokenError',
        }
    }
}

export default {
    providers: [
        // Removing OAuth providers for now as CylinderX uses JWT auth
        // Github and Google can be re-enabled later if needed
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                console.log('[Auth Config] ========== AUTHORIZE START ==========')
                console.log('[Auth Config] Authorize called with:', {
                    email: credentials?.email,
                    hasPassword: !!credentials?.password,
                    timestamp: new Date().toISOString()
                })
                
                // Simple validation like ECME
                const user = await validateCredential(
                    credentials as SignInCredential,
                )
                
                if (!user) {
                    console.log('[Auth Config] Authorize failed - no user returned')
                    console.log('[Auth Config] ========== AUTHORIZE END (FAILED) ==========')
                    return null
                }

                console.log('[Auth Config] Authorize success - user:', {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    hasAccessToken: !!user.accessToken,
                    accessTokenLength: user.accessToken?.length || 0
                })
                
                console.log('[Auth Config] ========== AUTHORIZE END (SUCCESS) ==========')

                // Return the entire user object to preserve all fields
                return user as any
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            try {
                console.log('[Auth Config] ===== JWT CALLBACK START =====')
                console.log('[Auth Config] JWT callback triggered:', {
                    trigger,
                    hasUser: !!user,
                    hasToken: !!token,
                    tokenSub: token?.sub,
                    hasSession: !!session,
                    timestamp: new Date().toISOString(),
                })
                
                // Store user data in token on first login
                if (user) {
                console.log('[Auth Config] JWT callback - storing user data:', {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: (user as any).role,
                    outletId: (user as any).outletId,
                    status: (user as any).status,
                    hasAccessToken: !!(user as any).accessToken
                })
                
                // Copy all user data to token
                token.id = user.id
                token.email = user.email
                token.name = user.name
                token.role = (user as any).role
                token.outletId = (user as any).outletId
                token.status = (user as any).status
                // Store the backend JWT tokens
                token.accessToken = (user as any).accessToken
                token.refreshToken = (user as any).refreshToken
                token.accessTokenExpires = getAccessTokenExpiry((user as any).accessToken)
                token.error = undefined

                console.log('[Auth Config] ===== JWT CALLBACK END (initial sign in) =====')
                return token
            }

            // On subsequent calls, keep serving the cached token until it's about to expire
            if (token.accessTokenExpires && Date.now() < token.accessTokenExpires - REFRESH_BUFFER_MS) {
                console.log('[Auth Config] ===== JWT CALLBACK END (token still valid) =====')
                return token
            }

            // Access token is expired (or about to be) - refresh it against the backend
            console.log('[Auth Config] Access token expired, refreshing...')
            const refreshedToken = await refreshAccessToken(token)

            console.log('[Auth Config] JWT callback - returning token:', {
                tokenId: refreshedToken.id,
                tokenEmail: refreshedToken.email,
                tokenRole: refreshedToken.role,
                hasAccessToken: !!refreshedToken.accessToken,
                hasError: !!refreshedToken.error,
                timestamp: new Date().toISOString(),
            })

                console.log('[Auth Config] ===== JWT CALLBACK END =====')
                return refreshedToken
            } catch (error) {
                console.error('[Auth Config] ❌ JWT CALLBACK ERROR:', error)
                console.log('[Auth Config] ===== JWT CALLBACK FAILED =====')
                throw error
            }
        },
        async session({ session, token }) {
            try {
                console.log('[Auth Config] ===== SESSION CALLBACK START =====')
                console.log('[Auth Config] Session callback called:', {
                    hasSession: !!session,
                    hasToken: !!token,
                    tokenId: token?.id,
                    tokenSub: token?.sub,
                    tokenRole: token?.role,
                    tokenOutletId: token?.outletId,
                    tokenStatus: token?.status,
                    hasAccessToken: !!token?.accessToken,
                    timestamp: new Date().toISOString()
                })
            
            // Add complete user data to session for dashboard
            const backendRole = token.role as string || 'customer'
            const frontendRole = mapBackendRoleToFrontend(backendRole)
            
            const updatedSession = {
                ...session,
                user: {
                    ...session.user,
                    id: token.sub || '',
                    authority: [frontendRole], // Use frontend role for UI access control
                    role: frontendRole, // Frontend role for UI components (ADMIN, OPERATOR, etc.)
                    backendRole: backendRole, // Keep backend role for API calls
                    outletId: token.outletId as string,
                    status: (token.status as string || 'ACTIVE') as 'PENDING' | 'ACTIVE' | 'INACTIVE',
                },
                // Include the backend JWT token in the session (contains backend role)
                accessToken: token.accessToken as string,
                // Surfaces a failed background refresh so the client can force a sign-out
                error: token.error,
            }
            
            console.log('[Auth Config] Session callback - final session:', {
                backendRole: updatedSession.user.backendRole,
                frontendRole: updatedSession.user.role,
                authority: updatedSession.user.authority,
                hasAccessToken: !!updatedSession.accessToken,
                timestamp: new Date().toISOString()
            })
            
                console.log('[Auth Config] ===== SESSION CALLBACK END =====')
                return updatedSession
            } catch (error) {
                console.error('[Auth Config] ❌ SESSION CALLBACK ERROR:', error)
                console.log('[Auth Config] ===== SESSION CALLBACK FAILED =====')
                throw error
            }
        },
    },
    session: {
        strategy: 'jwt',
        maxAge: 24 * 60 * 60, // 24 hours
    },
    pages: {
        signIn: '/sign-in',
        error: '/sign-in',
    },
    trustHost: true,
} satisfies NextAuthConfig
