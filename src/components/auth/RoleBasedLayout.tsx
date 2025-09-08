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

    // For staff and operators, check outlet assignment
    if ((requiredRole === 'STAFF' || requiredRole === 'REFILL_OP') && !session.user?.outletId) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        No Outlet Assigned
                    </h2>
                    <p className="text-gray-600">
                        Your account has not been assigned to an outlet. Please contact your administrator.
                    </p>
                </div>
            </div>
        )
    }

    // Render children - role checking is done by middleware
    return <>{children}</>
}