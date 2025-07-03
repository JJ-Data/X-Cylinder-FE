import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type UserRole = 'CUSTOMER' | 'STAFF' | 'REFILL_OP' | 'ADMIN'

export interface User {
    id: string
    email: string
    name?: string
    role: UserRole
    outletId?: string
    status: string
}

interface AuthState {
    // State
    activeRole: UserRole | null
    availableRoles: UserRole[]
    outletId?: string
    isRoleSwitching: boolean
    isSynced: boolean

    // Actions
    setActiveRole: (role: UserRole) => void
    setAvailableRoles: (roles: UserRole[]) => void
    setOutletContext: (outletId: string) => void
    switchRole: (role: UserRole) => void
    clearAuth: () => void
    syncWithSession: (sessionData: {
        authority?: string[]
        outletId?: string
    }) => void

    // Role utilities
    hasRole: (role: UserRole) => boolean
    canAccessRole: (role: UserRole) => boolean
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            // Initial state
            activeRole: null,
            availableRoles: [],
            outletId: undefined,
            isRoleSwitching: false,
            isSynced: false,

            // Actions
            setActiveRole: (role: UserRole) => {
                set({ activeRole: role })
            },

            setAvailableRoles: (roles: UserRole[]) => {
                set({
                    availableRoles: roles,
                    // Set active role to first available if not set
                    activeRole: get().activeRole || roles[0] || null,
                })
            },

            setOutletContext: (outletId: string) => {
                set({ outletId })
            },

            switchRole: (role: UserRole) => {
                const { availableRoles } = get()
                if (availableRoles.includes(role)) {
                    set({
                        isRoleSwitching: true,
                        activeRole: role,
                    })

                    // Reset switching state after a short delay
                    setTimeout(() => {
                        set({ isRoleSwitching: false })
                    }, 500)
                }
            },

            clearAuth: () => {
                set({
                    activeRole: null,
                    availableRoles: [],
                    outletId: undefined,
                    isRoleSwitching: false,
                    isSynced: false,
                })
            },

            syncWithSession: (sessionData) => {
                const { authority, outletId } = sessionData
                
                if (authority && authority.length > 0) {
                    // Normalize roles - convert OPERATOR back to REFILL_OP for store compatibility
                    const normalizedRoles = authority.map((role) => {
                        if (role === 'OPERATOR') return 'REFILL_OP'
                        return role as UserRole
                    })
                    
                    const currentRoles = get().availableRoles
                    const rolesChanged = JSON.stringify(normalizedRoles.sort()) !== JSON.stringify(currentRoles.sort())
                    
                    if (rolesChanged) {
                        set({
                            availableRoles: normalizedRoles,
                            // Set active role if not set or if current active role is not available
                            activeRole: get().activeRole && normalizedRoles.includes(get().activeRole!) 
                                ? get().activeRole 
                                : normalizedRoles[0] || null,
                            isSynced: true,
                        })
                    } else {
                        // Even if roles haven't changed, mark as synced
                        set({ isSynced: true })
                    }
                } else {
                    // No authority but still mark as synced
                    set({ isSynced: true })
                }
                
                // Update outlet context if provided
                if (outletId && outletId !== 'undefined') {
                    set({ outletId })
                }
            },

            // Role utilities
            hasRole: (role: UserRole) => {
                return get().availableRoles.includes(role)
            },

            canAccessRole: (role: UserRole) => {
                const { availableRoles, activeRole } = get()

                // Admin can access all roles
                if (activeRole === 'ADMIN') return true

                // Staff can access customer views (for helping customers)
                if (activeRole === 'STAFF' && role === 'CUSTOMER') return true

                // Otherwise, user must have the specific role
                return availableRoles.includes(role)
            },
        }),
        {
            name: 'cylinderx-auth-store',
            storage: createJSONStorage(() => localStorage),
            // Only persist certain fields
            partialize: (state) => ({
                activeRole: state.activeRole,
                outletId: state.outletId,
            }),
        },
    ),
)
