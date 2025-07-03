import useSWR from 'swr'
import AxiosBase from '@/services/axios/AxiosBase'
import { useCallback } from 'react'
import { mutate } from 'swr'
import { PaginatedResponse } from '@/types/common'
import type { Customer } from '@/types/customer'
// import type { PaginatedResponse } from '@/types/api'

const apiClient = AxiosBase

export interface CustomerFilters {
    searchTerm?: string
    paymentStatus?: 'pending' | 'active' | 'inactive'
    hasActiveLeases?: boolean
    outletId?: number
    page?: number
    limit?: number
}

// Get customers with filters
export const useCustomers = (filters?: CustomerFilters) => {
    const key = ['customers', JSON.stringify(filters || {})]

    return useSWR<PaginatedResponse<Customer>>(
        key,
        async () => {
            const params = new URLSearchParams()
            if (filters?.searchTerm)
                params.append('searchTerm', filters.searchTerm)
            if (filters?.paymentStatus)
                params.append('paymentStatus', filters.paymentStatus)
            if (filters?.hasActiveLeases !== undefined)
                params.append(
                    'hasActiveLeases',
                    String(filters.hasActiveLeases),
                )
            if (filters?.outletId)
                params.append('outletId', String(filters.outletId))
            if (filters?.page) params.append('page', filters.page.toString())
            if (filters?.limit) params.append('limit', filters.limit.toString())

            const response = await apiClient.get(
                `/customers${params.toString() ? `?${params.toString()}` : ''}`,
            )
            // Transform API response to PaginatedResponse format
            const apiData = response.data.data
            return {
                data: apiData.customers || [],
                meta: {
                    page: apiData.page || 1,
                    limit: apiData.limit || filters?.limit || 10,
                    total: apiData.total || 0,
                    totalPages: apiData.totalPages || 1,
                },
            }
        },
        {
            revalidateOnFocus: false,
        },
    )
}

// Get single customer
export const useCustomer = (id?: number) => {
    return useSWR(
        id ? ['customer', id] : null,
        async () => {
            const response = await apiClient.get(`/customers/${id}`)
            return response.data.data
        },
        {
            revalidateOnFocus: false,
        },
    )
}

// Get customer lease history
export const useCustomerLeaseHistory = (customerId?: number) => {
    return useSWR(
        customerId ? ['customer-lease-history', customerId] : null,
        async () => {
            const response = await apiClient.get(
                `/customers/${customerId}/leases`,
            )
            return response.data.data
        },
        {
            revalidateOnFocus: false,
        },
    )
}

// Get customer transaction history
export const useCustomerTransactions = (customerId?: number) => {
    return useSWR(
        customerId ? ['customer-transactions', customerId] : null,
        async () => {
            const response = await apiClient.get(
                `/customers/${customerId}/transactions`,
            )
            return response.data.data
        },
        {
            revalidateOnFocus: false,
        },
    )
}

// Mutations
export const useCustomerMutations = () => {
    const createCustomer = useCallback(async (data: Partial<Customer>) => {
        const response = await apiClient.post('/customers', data)
        mutate((key: any) => Array.isArray(key) && key[0] === 'customers')
        return response.data.data
    }, [])

    const updateCustomer = useCallback(
        async (id: number, data: Partial<Customer>) => {
            const response = await apiClient.put(`/customers/${id}`, data)
            mutate(['customer', id])
            mutate((key: any) => Array.isArray(key) && key[0] === 'customers')
            return response.data.data
        },
        [],
    )

    const blockCustomer = useCallback(async (id: number, reason: string) => {
        const response = await apiClient.post(`/customers/${id}/block`, {
            reason,
        })
        mutate(['customer', id])
        mutate((key: any) => Array.isArray(key) && key[0] === 'customers')
        return response.data.data
    }, [])

    const unblockCustomer = useCallback(async (id: number) => {
        const response = await apiClient.post(`/customers/${id}/unblock`)
        mutate(['customer', id])
        mutate((key: any) => Array.isArray(key) && key[0] === 'customers')
        return response.data.data
    }, [])

    return {
        createCustomer,
        updateCustomer,
        blockCustomer,
        unblockCustomer,
    }
}
