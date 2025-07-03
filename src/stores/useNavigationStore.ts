import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface BreadcrumbItem {
    label: string
    href?: string
    icon?: string
}

interface NavigationState {
    // UI State
    sidebarOpen: boolean
    sidebarCollapsed: boolean
    currentModule: string
    breadcrumbs: BreadcrumbItem[]
    isOffline: boolean

    // Command Palette
    commandPaletteOpen: boolean

    // Actions
    setSidebarState: (open: boolean, collapsed?: boolean) => void
    toggleSidebar: () => void
    toggleSidebarCollapsed: () => void
    setCurrentModule: (module: string) => void
    updateBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void
    setOfflineStatus: (isOffline: boolean) => void

    // Command Palette
    openCommandPalette: () => void
    closeCommandPalette: () => void
    toggleCommandPalette: () => void

    // Reset
    resetNavigation: () => void
}

export const useNavigationStore = create<NavigationState>()(
    persist(
        (set, get) => ({
            // Initial state
            sidebarOpen: true,
            sidebarCollapsed: false,
            currentModule: '',
            breadcrumbs: [],
            isOffline: false,
            commandPaletteOpen: false,

            // Actions
            setSidebarState: (open: boolean, collapsed?: boolean) => {
                set({
                    sidebarOpen: open,
                    sidebarCollapsed:
                        collapsed !== undefined
                            ? collapsed
                            : get().sidebarCollapsed,
                })
            },

            toggleSidebar: () => {
                set({ sidebarOpen: !get().sidebarOpen })
            },

            toggleSidebarCollapsed: () => {
                set({ sidebarCollapsed: !get().sidebarCollapsed })
            },

            setCurrentModule: (module: string) => {
                set({ currentModule: module })
            },

            updateBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => {
                set({ breadcrumbs })
            },

            setOfflineStatus: (isOffline: boolean) => {
                set({ isOffline })
            },

            // Command Palette
            openCommandPalette: () => {
                set({ commandPaletteOpen: true })
            },

            closeCommandPalette: () => {
                set({ commandPaletteOpen: false })
            },

            toggleCommandPalette: () => {
                set({ commandPaletteOpen: !get().commandPaletteOpen })
            },

            // Reset
            resetNavigation: () => {
                set({
                    currentModule: '',
                    breadcrumbs: [],
                    commandPaletteOpen: false,
                    // Keep sidebar state persistent
                })
            },
        }),
        {
            name: 'cylinderx-navigation-store',
            storage: createJSONStorage(() => localStorage),
            // Persist UI preferences
            partialize: (state) => ({
                sidebarOpen: state.sidebarOpen,
                sidebarCollapsed: state.sidebarCollapsed,
            }),
        },
    ),
)

// Hook for detecting offline status
export const useOfflineDetection = () => {
    const setOfflineStatus = useNavigationStore(
        (state) => state.setOfflineStatus,
    )

    // Set up offline detection
    if (typeof window !== 'undefined') {
        const updateOfflineStatus = () => {
            setOfflineStatus(!navigator.onLine)
        }

        window.addEventListener('online', updateOfflineStatus)
        window.addEventListener('offline', updateOfflineStatus)

        // Initial check
        updateOfflineStatus()

        // Cleanup function
        return () => {
            window.removeEventListener('online', updateOfflineStatus)
            window.removeEventListener('offline', updateOfflineStatus)
        }
    }
}
