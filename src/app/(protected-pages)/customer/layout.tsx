'use client'

import RoleBasedLayout from '@/components/auth/RoleBasedLayout'
import { ReactNode } from 'react'

export default function CustomerLayout({ children }: { children: ReactNode }) {
    return (
        <RoleBasedLayout requiredRole="CUSTOMER">
            {children}
        </RoleBasedLayout>
    )
}