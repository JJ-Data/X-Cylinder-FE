'use client'

import { useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useQueryClient } from '@tanstack/react-query'
import { mutate } from 'swr'

/**
 * Clears all cached client data (SWR and React Query) whenever the signed-in
 * user changes: sign-in, sign-out, switching roles, or an expired session.
 * Without this, one user can briefly see another user's cached data.
 */
const SessionCacheReset = () => {
    const { data: session, status } = useSession()
    const queryClient = useQueryClient()
    const userId = (session?.user as any)?.id ?? null
    const previousUserId = useRef<string | null | undefined>(undefined)

    useEffect(() => {
        if (status === 'loading') return

        if (
            previousUserId.current !== undefined &&
            previousUserId.current !== userId
        ) {
            mutate(() => true, undefined, { revalidate: false })
            queryClient.clear()
        }
        previousUserId.current = userId
    }, [status, userId, queryClient])

    return null
}

export default SessionCacheReset
