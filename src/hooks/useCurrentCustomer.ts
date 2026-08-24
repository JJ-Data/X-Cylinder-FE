'use client'

import useSWR from 'swr'
import { useSession } from 'next-auth/react'
import AxiosBase from '@/services/axios/AxiosBase'
import type { Customer } from '@/types/customer'

// Resolves the logged-in CUSTOMER user's own Customer.id via GET /customers/me,
// a self-scoped endpoint restricted to the customer role (backend resolves it
// from the caller's own auth, ignoring any id in the URL).
export function useCurrentCustomerId() {
    const { data: session, status } = useSession()

    const { data, error, isLoading } = useSWR(
        status === 'authenticated' ? 'current-customer' : null,
        async () => {
            const response = await AxiosBase.get<{ data: Customer }>(
                '/customers/me',
            )
            return response.data.data
        },
        { revalidateOnFocus: false },
    )

    return {
        customerId: data?.id,
        isLoading: status === 'loading' || isLoading,
        error,
    }
}
