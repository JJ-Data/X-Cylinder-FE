'use client'

import RoleBasedLayout from '@/components/auth/RoleBasedLayout'
import { Suspense, ReactNode } from 'react'

export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        <RoleBasedLayout requiredRole="ADMIN">
            <Suspense
                fallback={
                    <div className="flex h-screen items-center justify-center">
                        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
                    </div>
                }
            >
                {children}
            </Suspense>
        </RoleBasedLayout>
    )
}
