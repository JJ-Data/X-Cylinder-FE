'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useAuthStore } from '@/stores'
import type { CommonProps } from '@/@types/common'

/**
 * AuthSyncProvider - Synchronizes NextAuth session with Zustand auth store
 * Simplified version that works with our ECME-pattern authentication
 */
export default function AuthSyncProvider({ children }: CommonProps) {
    const { data: session, status } = useSession()
    const { 
        syncWithSession,
        clearAuth,
        isSynced
    } = useAuthStore()

    useEffect(() => {
        // Skip if session is still loading
        if (status === 'loading') return

        // Clear auth store if no session
        if (!session || !session.user) {
            clearAuth()
            return
        }

        // Sync session data with auth store
        const userWithRole = session.user as any
        
        syncWithSession({
            authority: userWithRole.authority || ['customer'],
            outletId: userWithRole.outletId
        })

    }, [session, status, syncWithSession, clearAuth])

    // Render children immediately - no loading state needed
    return <>{children}</>
}