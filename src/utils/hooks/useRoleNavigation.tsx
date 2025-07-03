'use client'

import { useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { getNavigationByRole } from '@/configs/navigation.config'

export const useRoleNavigation = () => {
    const { data: session } = useSession()

    const navigationTree = useMemo(() => {
        if (!session?.user?.role) {
            return []
        }

        // Get navigation based on user role
        return getNavigationByRole(session.user.role.toLowerCase())
    }, [session?.user?.role])

    return {
        navigationTree,
        userRole: session?.user?.role || '',
    }
}

export default useRoleNavigation