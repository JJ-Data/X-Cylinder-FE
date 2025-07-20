'use client'

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'
import AuthSyncProvider from '../AuthSyncProvider'

type AuthProviderProps = {
    children: React.ReactNode
}

const AuthProvider = ({ children }: AuthProviderProps) => {
    return (
        // Let NextAuth handle session fetching on the client
        <NextAuthSessionProvider 
            refetchOnWindowFocus={false}
            basePath="/api/auth"
        >
            <AuthSyncProvider>
                {children}
            </AuthSyncProvider>
        </NextAuthSessionProvider>
    )
}

export default AuthProvider
