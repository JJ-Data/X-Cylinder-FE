import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { outletService } from '@/services/api/outlet.service'
import type { 
    Outlet, 
    OutletInventory, 
    OutletFilters,
    OutletCreationData,
    OutletUpdateData
} from '@/types/outlet'

interface OutletState {
    // State
    outlets: Outlet[]
    selectedOutlet: Outlet | null
    currentOutlet: Outlet | null
    inventory: OutletInventory | null
    totalOutlets: number
    currentPage: number
    pageSize: number
    totalPages: number
    isLoading: boolean
    isInitialLoading: boolean
    error: string | null

    // Actions
    fetchOutlets: (filters?: OutletFilters) => Promise<void>
    fetchOutletById: (id: number) => Promise<void>
    createOutlet: (data: OutletCreationData) => Promise<Outlet>
    updateOutlet: (id: number, data: OutletUpdateData) => Promise<Outlet>
    deactivateOutlet: (id: number) => Promise<void>
    fetchOutletInventory: (id: number) => Promise<void>
    setSelectedOutlet: (outlet: Outlet | null) => void
    setCurrentOutlet: (outlet: Outlet | null) => void
    setFilters: (filters: OutletFilters) => void

    // Reset
    clearOutletData: () => void
    clearError: () => void
}

export const useOutletStore = create<OutletState>()(
    persist(
        (set, get) => ({
            // Initial state
            outlets: [],
            selectedOutlet: null,
            currentOutlet: null,
            inventory: null,
            totalOutlets: 0,
            currentPage: 1,
            pageSize: 10,
            totalPages: 0,
            isLoading: false,
            isInitialLoading: false,
            error: null,

            // Actions
            fetchOutlets: async (filters?: OutletFilters) => {
                set({ isLoading: true, error: null })
                try {
                    const response = await outletService.getAllOutlets(filters)
                    set({
                        outlets: response.outlets,
                        totalOutlets: response.total,
                        currentPage: response.page,
                        totalPages: response.totalPages,
                        isInitialLoading: false,
                    })
                } catch (error) {
                    set({ 
                        error: error instanceof Error ? error.message : 'Failed to fetch outlets',
                        isInitialLoading: false,
                    })
                } finally {
                    set({ isLoading: false })
                }
            },

            fetchOutletById: async (id: number) => {
                set({ isLoading: true, error: null })
                try {
                    const outlet = await outletService.getOutletById(id)
                    set({ selectedOutlet: outlet })
                } catch (error) {
                    set({ 
                        error: error instanceof Error ? error.message : 'Failed to fetch outlet',
                    })
                } finally {
                    set({ isLoading: false })
                }
            },

            createOutlet: async (data: OutletCreationData) => {
                set({ isLoading: true, error: null })
                try {
                    const newOutlet = await outletService.createOutlet(data)
                    set((state) => ({
                        outlets: [newOutlet, ...state.outlets],
                        totalOutlets: state.totalOutlets + 1,
                    }))
                    return newOutlet
                } catch (error) {
                    set({ 
                        error: error instanceof Error ? error.message : 'Failed to create outlet',
                    })
                    throw error
                } finally {
                    set({ isLoading: false })
                }
            },

            updateOutlet: async (id: number, data: OutletUpdateData) => {
                set({ isLoading: true, error: null })
                try {
                    const updatedOutlet = await outletService.updateOutlet(id, data)
                    set((state) => ({
                        outlets: state.outlets.map(outlet =>
                            outlet.id === id ? updatedOutlet : outlet
                        ),
                        selectedOutlet: state.selectedOutlet?.id === id ? updatedOutlet : state.selectedOutlet,
                        currentOutlet: state.currentOutlet?.id === id ? updatedOutlet : state.currentOutlet,
                    }))
                    return updatedOutlet
                } catch (error) {
                    set({ 
                        error: error instanceof Error ? error.message : 'Failed to update outlet',
                    })
                    throw error
                } finally {
                    set({ isLoading: false })
                }
            },

            deactivateOutlet: async (id: number) => {
                set({ isLoading: true, error: null })
                try {
                    await outletService.deactivateOutlet(id)
                    set((state) => ({
                        outlets: state.outlets.map(outlet =>
                            outlet.id === id ? { ...outlet, status: 'inactive' as const } : outlet
                        ),
                    }))
                } catch (error) {
                    set({ 
                        error: error instanceof Error ? error.message : 'Failed to deactivate outlet',
                    })
                    throw error
                } finally {
                    set({ isLoading: false })
                }
            },

            fetchOutletInventory: async (id: number) => {
                set({ isLoading: true, error: null })
                try {
                    const inventory = await outletService.getOutletInventory(id)
                    set({ inventory })
                } catch (error) {
                    set({ 
                        error: error instanceof Error ? error.message : 'Failed to fetch inventory',
                    })
                } finally {
                    set({ isLoading: false })
                }
            },

            setSelectedOutlet: (outlet: Outlet | null) => {
                set({ selectedOutlet: outlet })
            },

            setCurrentOutlet: (outlet: Outlet | null) => {
                set({ 
                    currentOutlet: outlet,
                    inventory: null, // Clear inventory when switching outlets
                })
            },

            setFilters: (filters: OutletFilters) => {
                const { fetchOutlets } = get()
                fetchOutlets(filters)
            },

            // Reset
            clearOutletData: () => {
                set({
                    outlets: [],
                    selectedOutlet: null,
                    currentOutlet: null,
                    inventory: null,
                    totalOutlets: 0,
                    currentPage: 1,
                    totalPages: 0,
                    isLoading: false,
                    error: null,
                })
            },

            clearError: () => {
                set({ error: null })
            },
        }),
        {
            name: 'cylinderx-outlet-store',
            storage: createJSONStorage(() => localStorage),
            // Persist outlet selection only
            partialize: (state) => ({
                currentOutlet: state.currentOutlet,
            }),
        },
    ),
)
