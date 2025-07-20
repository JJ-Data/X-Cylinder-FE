'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores'
import type { CommonProps } from '@/@types/common'
import type { UserRole } from '@/stores/useAuthStore'

interface RoleBasedLayoutProps extends CommonProps {
    requiredRole: UserRole
}

/**
 * Higher-Order Component for role-based layouts
 * Handles authentication, authorization, and role setting consistently
 */
export default function RoleBasedLayout({ 
    children, 
    requiredRole
}: RoleBasedLayoutProps) {
    const { data: session, status } = useSession()
    const router = useRouter()
    const { setActiveRole } = useAuthStore()

    useEffect(() => {
        if (status === 'loading') return

        if (status === 'unauthenticated') {
            console.log('[RoleBasedLayout] User is unauthenticated, redirecting to sign-in')
            router.push('/sign-in')
            return
        }

        if (session) {
            // Only set active role once when component mounts or role changes
            console.log(`[RoleBasedLayout] Setting active role to: ${requiredRole}`)
            setActiveRole(requiredRole)
        }
    }, [session, status, requiredRole, router, setActiveRole])

    // Loading state
    if (status === 'loading') {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
            </div>
        )
    }

    // Not signed in
    if (!session) {
        return null
    }

    // Render children - role checking is done by middleware
    return <>{children}</>
}