'use client'

import RoleBasedLayout from '@/components/auth/RoleBasedLayout'
import { ReactNode } from 'react'

export default function OperatorLayout({ children }: { children: ReactNode }) {
    return (
        <RoleBasedLayout requiredRole="REFILL_OP">{children}</RoleBasedLayout>
    )
}
