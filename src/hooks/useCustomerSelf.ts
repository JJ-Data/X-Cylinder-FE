'use client'

import useSWR from 'swr'
import { useSession } from 'next-auth/react'
import AxiosBase from '@/services/axios/AxiosBase'

// Self-scoped customer endpoints - backend resolves these from the caller's
// own auth for the CUSTOMER role (no id needed, unlike the admin/staff
// /customers/:id/* routes which require elevated permissions).

export const useMyCustomerDashboard = () => {
    const { status } = useSession()

    return useSWR(
        status === 'authenticated' ? 'customer-me-dashboard' : null,
        async () => {
            const response = await AxiosBase.get('/customers/me/dashboard')
            return response.data?.data
        },
        { revalidateOnFocus: false },
    )
}

export const useMyCustomerHistory = () => {
    const { status } = useSession()

    return useSWR(
        status === 'authenticated' ? 'customer-me-history' : null,
        async () => {
            const response = await AxiosBase.get('/customers/me/history')
            return response.data?.data
        },
        { revalidateOnFocus: false },
    )
}
