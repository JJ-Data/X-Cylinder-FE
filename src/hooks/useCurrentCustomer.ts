'use client'

import useSWR from 'swr'
import { useSession } from 'next-auth/react'
import AxiosBase from '@/services/axios/AxiosBase'
import type { Customer } from '@/types/customer'

// Resolves the logged-in CUSTOMER user's own Customer.id.
//
// session.user.id is the auth User's id, not the Customer record's id - they're
// different rows (Customer.userId is a foreign key to User.id). There's no
// /customers/me endpoint, so this looks the customer up by their own email via
// the existing customer search endpoint instead.
export function useCurrentCustomerId() {
    const { data: session, status } = useSession()
    const email = session?.user?.email

    const { data, error, isLoading } = useSWR(
        status === 'authenticated' && email
            ? ['current-customer', email]
            : null,
        async () => {
            const response = await AxiosBase.get('/customers', {
                params: { searchTerm: email, limit: 5 },
            })
            const customers: Customer[] = response.data?.data?.customers || []
            return customers.find(
                (c) => c.user?.email?.toLowerCase() === email?.toLowerCase(),
            )
        },
        { revalidateOnFocus: false },
    )

    return {
        customerId: data?.id,
        isLoading: status === 'loading' || (!!email && isLoading),
        error,
    }
}
