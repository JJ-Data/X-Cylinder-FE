import type { NextAuthConfig } from 'next-auth'
import validateCredential from '../server/actions/user/validateCredential'
import Credentials from 'next-auth/providers/credentials'

import type { SignInCredential } from '@/@types/auth'

export default {
    providers: [
        // Removing OAuth providers for now as CylinderX uses JWT auth
        // Github and Google can be re-enabled later if needed
        Credentials({
            async authorize(credentials) {
                const user = await validateCredential(
                    credentials as SignInCredential,
                )
                if (!user) {
                    return null
                }

                return user
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            // Initial sign in
            if (user) {
                console.log('[Auth JWT] User from authorize:', user)
                token.id = user.id
                token.email = user.email
                token.name = user.userName || user.name
                token.role = user.role
                token.outletId = user.outletId
                token.status = user.status || 'ACTIVE'
                // Tokens are now handled via HTTP-only cookies
                // No need to store them in the JWT
            }

            // Update token from session
            if (trigger === 'update' && session) {
                token = { ...token, ...session }
            }

            return token
        },
        async session({ session, token }) {
            return {
                ...session,
                user: {
                    ...session.user,
                    id: token.id as string,
                    role: (token.role as string || 'CUSTOMER') as 'CUSTOMER' | 'STAFF' | 'OPERATOR' | 'ADMIN',
                    outletId: token.outletId as string | undefined,
                    status: (token.status as string || 'ACTIVE') as 'PENDING' | 'ACTIVE' | 'INACTIVE',
                    authority: [token.role as string || 'CUSTOMER'],
                },
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
} satisfies NextAuthConfig
