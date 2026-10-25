'use client'

import { useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useQueryClient } from '@tanstack/react-query'
import { mutate } from 'swr'
import { useAuthStore } from '@/stores'

/**
 * Clears all cached client data (SWR, React Query and the persisted auth
 * store) whenever the signed-in user changes: sign-in, sign-out, switching
 * accounts, or an expired session. Without this, one user can briefly see
 * another user's cached data or inherit their active role.
 *
 * Effect order: this component is a child of AuthSyncProvider, so its effect
 * runs first. The reset happens before syncWithSession sets the new user's
 * roles, and the sync is never wiped.
 */
const SessionCacheReset = () => {
    const { data: session, status } = useSession()
    const queryClient = useQueryClient()
    const user = session?.user as any
    const userId: string | null = user?.id ?? user?.email ?? null
    const previousUserId = useRef<string | null | undefined>(undefined)

    useEffect(() => {
        if (status === 'loading') return

        if (
            previousUserId.current !== undefined &&
            previousUserId.current !== userId
        ) {
            mutate(() => true, undefined, { revalidate: false })
            queryClient.clear()
            useAuthStore.getState().clearAuth()
        }
        previousUserId.current = userId
    }, [status, userId, queryClient])

    return null
}

export default SessionCacheReset
