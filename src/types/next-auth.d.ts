import type { DefaultSession } from 'next-auth'

declare module 'next-auth' {
    interface Session {
        user: {
            id: string
            role: 'CUSTOMER' | 'STAFF' | 'OPERATOR' | 'ADMIN'
            outletId?: string
            status: 'PENDING' | 'ACTIVE' | 'INACTIVE'
            authority: string[]
        } & DefaultSession['user']
        accessToken?: string
    }

    interface User {
        id: string
        userName?: string
        role?: 'CUSTOMER' | 'STAFF' | 'OPERATOR' | 'ADMIN'
        outletId?: string
        status?: 'PENDING' | 'ACTIVE' | 'INACTIVE'
        accessToken?: string
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string
        role?: string
        outletId?: string
        status?: string
        accessToken?: string
    }
}