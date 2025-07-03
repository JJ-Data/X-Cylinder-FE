import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { apiClient } from '@/services/api-client'

interface User {
    id: number
    email: string
    firstName: string
    lastName: string
    role: 'admin' | 'staff' | 'operator' | 'customer'
    status: 'active' | 'inactive'
    createdAt: string
    updatedAt: string
}

interface UserFilters {
    role?: string
    status?: string
    search?: string
    page?: number
    limit?: number
}

interface UserState {
    // State
    users: User[]
    selectedUser: User | null
    totalUsers: number
    currentPage: number
    pageSize: number
    totalPages: number
    isLoading: boolean
    error: string | null

    // Actions
    fetchUsers: (filters?: UserFilters) => Promise<void>
    fetchUserById: (id: number) => Promise<void>
    setSelectedUser: (user: User | null) => void
    clearError: () => void
    clearUserData: () => void
}

export const useUserStore = create<UserState>()(
    persist(
        (set) => ({
            // Initial state
            users: [],
            selectedUser: null,
            totalUsers: 0,
            currentPage: 1,
            pageSize: 10,
            totalPages: 0,
            isLoading: false,
            error: null,

            // Actions
            fetchUsers: async (filters?: UserFilters) => {
                set({ isLoading: true, error: null })
                try {
                    const params = new URLSearchParams()
                    
                    if (filters?.role) {
                        params.append('role', filters.role)
                    }
                    if (filters?.status) {
                        params.append('status', filters.status)
                    }
                    if (filters?.search) {
                        params.append('search', filters.search)
                    }
                    if (filters?.page) {
                        params.append('page', filters.page.toString())
                    }
                    if (filters?.limit) {
                        params.append('limit', filters.limit.toString())
                    }

                    const queryString = params.toString()
                    const url = queryString ? `/users?${queryString}` : '/users'
                    
                    const response = await apiClient.get<{
                        success: boolean
                        data: {
                            data: User[]
                            pagination: {
                                page: number
                                pageSize: number
                                totalPages: number
                                totalItems: number
                                hasNextPage: boolean
                                hasPrevPage: boolean
                            }
                        }
                    }>(url)
                    
                    set({
                        users: response.data.data.data,
                        totalUsers: response.data.data.pagination.totalItems,
                        currentPage: response.data.data.pagination.page,
                        totalPages: response.data.data.pagination.totalPages,
                    })
                } catch (error) {
                    set({ 
                        error: error instanceof Error ? error.message : 'Failed to fetch users',
                    })
                } finally {
                    set({ isLoading: false })
                }
            },

            fetchUserById: async (id: number) => {
                set({ isLoading: true, error: null })
                try {
                    const response = await apiClient.get<User>(`/users/${id}`)
                    set({ selectedUser: response.data })
                } catch (error) {
                    set({ 
                        error: error instanceof Error ? error.message : 'Failed to fetch user',
                    })
                } finally {
                    set({ isLoading: false })
                }
            },

            setSelectedUser: (user: User | null) => {
                set({ selectedUser: user })
            },

            clearError: () => {
                set({ error: null })
            },

            clearUserData: () => {
                set({
                    users: [],
                    selectedUser: null,
                    totalUsers: 0,
                    currentPage: 1,
                    totalPages: 0,
                    isLoading: false,
                    error: null,
                })
            },
        }),
        {
            name: 'cylinderx-user-store',
            storage: createJSONStorage(() => localStorage),
            // Don't persist any state for users
            partialize: () => ({}),
        },
    ),
)