'use client'

import RoleBasedLayout from '@/components/auth/RoleBasedLayout'
import { ReactNode } from 'react'

export default function StaffLayout({ children }: { children: ReactNode }) {
    return <RoleBasedLayout requiredRole="STAFF">{children}</RoleBasedLayout>
}
