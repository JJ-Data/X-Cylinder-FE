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
    }

    interface User {
        id: string
        userName?: string
        role?: 'CUSTOMER' | 'STAFF' | 'OPERATOR' | 'ADMIN'
        outletId?: string
        status?: 'PENDING' | 'ACTIVE' | 'INACTIVE'
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string
        role?: string
        outletId?: string
        status?: string
    }
}