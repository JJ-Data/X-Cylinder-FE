'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useAuthStore } from '@/stores'
import type { CommonProps } from '@/@types/common'

/**
 * AuthSyncProvider - Synchronizes NextAuth session with Zustand auth store
 * This component ensures that the auth store is always in sync with the NextAuth session
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
        console.log('[AuthSync] Syncing session with store:', {
            authority: session.user.authority,
            outletId: session.user.outletId
        })
        
        syncWithSession({
            authority: session.user.authority,
            outletId: session.user.outletId
        })

    }, [session, status, syncWithSession, clearAuth])

    // Don't render children until session is loaded and synced
    if (status === 'loading' || (status === 'authenticated' && !isSynced)) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
            </div>
        )
    }

    return <>{children}</>
}