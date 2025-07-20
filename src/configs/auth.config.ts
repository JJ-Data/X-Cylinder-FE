import type { NextAuthConfig } from 'next-auth'
import validateCredential from '../server/actions/user/validateCredential'
import Credentials from 'next-auth/providers/credentials'

import type { SignInCredential } from '@/@types/auth'

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
                // Store the backend JWT token
                token.accessToken = (user as any).accessToken
            }
            
            console.log('[Auth Config] JWT callback - returning token:', {
                tokenId: token.id,
                tokenEmail: token.email,
                tokenRole: token.role,
                hasAccessToken: !!token.accessToken,
                timestamp: new Date().toISOString(),
            })
            
            return token
        },
        async session({ session, token }) {
            console.log('[Auth Config] Session callback called:', {
                hasSession: !!session,
                hasToken: !!token,
                tokenSub: token?.sub,
                tokenRole: token?.role,
                tokenOutletId: token?.outletId,
                tokenStatus: token?.status,
                hasAccessToken: !!token?.accessToken
            })
            
            // Add complete user data to session for dashboard
            const updatedSession = {
                ...session,
                user: {
                    ...session.user,
                    id: token.sub || '',
                    authority: [token.role as string || 'customer'],
                    role: (token.role as string || 'CUSTOMER') as 'CUSTOMER' | 'STAFF' | 'OPERATOR' | 'ADMIN',
                    outletId: token.outletId as string,
                    status: (token.status as string || 'ACTIVE') as 'PENDING' | 'ACTIVE' | 'INACTIVE',
                },
                // Include the backend JWT token in the session
                accessToken: token.accessToken as string,
            }
            
            console.log('[Auth Config] Session callback - final session:', {
                userRole: updatedSession.user.role,
                authority: updatedSession.user.authority,
                hasAccessToken: !!updatedSession.accessToken
            })
            
            return updatedSession
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
