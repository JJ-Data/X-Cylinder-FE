import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface QRScanResult {
    id: string
    cylinderId: string
    cylinderCode: string
    type: string
    outletId: string
    qrCode: string
    scannedAt: string
    isValid: boolean
}

export interface BulkOperation {
    id: string
    type: 'refill' | 'transfer' | 'status_update'
    fileName: string
    totalItems: number
    processedItems: number
    successCount: number
    errorCount: number
    status: 'pending' | 'processing' | 'completed' | 'failed'
    startedAt: string
    completedAt?: string
    errors: string[]
}

interface CylinderState {
    // Scanner State
    selectedCylinder: any | null
    scanHistory: QRScanResult[]
    isScanning: boolean
    lastScanError?: string

    // Bulk Operations
    bulkOperations: BulkOperation[]
    activeBulkOperation?: BulkOperation

    // Scanner Actions
    setSelectedCylinder: (cylinder: any | null) => void
    addScanResult: (result: QRScanResult) => void
    clearScanHistory: () => void
    setScanning: (isScanning: boolean) => void
    setScanError: (error: string | undefined) => void

    // Bulk Operation Actions
    createBulkOperation: (
        operation: Omit<BulkOperation, 'id' | 'startedAt'>,
    ) => string
    updateBulkOperation: (id: string, updates: Partial<BulkOperation>) => void
    completeBulkOperation: (
        id: string,
        results: { successCount: number; errorCount: number; errors: string[] },
    ) => void
    clearBulkOperations: () => void

    // Utilities
    getRecentScans: (limit?: number) => QRScanResult[]
    getValidScans: () => QRScanResult[]
    getActiveBulkOperations: () => BulkOperation[]

    // Reset
    resetCylinderData: () => void
}

export const useCylinderStore = create<CylinderState>()(
    persist(
        (set, get) => ({
            // Initial state
            selectedCylinder: null,
            scanHistory: [],
            isScanning: false,
            lastScanError: undefined,
            bulkOperations: [],
            activeBulkOperation: undefined,

            // Scanner Actions
            setSelectedCylinder: (cylinder: any | null) => {
                set({ selectedCylinder: cylinder })
            },

            addScanResult: (result: QRScanResult) => {
                set((state) => ({
                    scanHistory: [result, ...state.scanHistory].slice(0, 100),
                    lastScanError: undefined,
                }))
            },

            clearScanHistory: () => {
                set({ scanHistory: [] })
            },

            setScanning: (isScanning: boolean) => {
                set({ isScanning })
            },

            setScanError: (error: string | undefined) => {
                set({ lastScanError: error })
            },

            // Bulk Operation Actions
            createBulkOperation: (
                operation: Omit<BulkOperation, 'id' | 'startedAt'>,
            ) => {
                const id = `bulk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
                const newOperation: BulkOperation = {
                    ...operation,
                    id,
                    startedAt: new Date().toISOString(),
                    processedItems: 0,
                    successCount: 0,
                    errorCount: 0,
                    errors: [],
                }

                set((state) => ({
                    bulkOperations: [newOperation, ...state.bulkOperations],
                    activeBulkOperation: newOperation,
                }))

                return id
            },

            updateBulkOperation: (
                id: string,
                updates: Partial<BulkOperation>,
            ) => {
                set((state) => ({
                    bulkOperations: state.bulkOperations.map((op) =>
                        op.id === id ? { ...op, ...updates } : op,
                    ),
                    activeBulkOperation:
                        state.activeBulkOperation?.id === id
                            ? { ...state.activeBulkOperation, ...updates }
                            : state.activeBulkOperation,
                }))
            },

            completeBulkOperation: (
                id: string,
                results: {
                    successCount: number
                    errorCount: number
                    errors: string[]
                },
            ) => {
                const completedAt = new Date().toISOString()

                set((state) => ({
                    bulkOperations: state.bulkOperations.map((op) =>
                        op.id === id
                            ? {
                                  ...op,
                                  ...results,
                                  status: 'completed' as const,
                                  completedAt,
                                  processedItems:
                                      results.successCount + results.errorCount,
                              }
                            : op,
                    ),
                    activeBulkOperation:
                        state.activeBulkOperation?.id === id
                            ? undefined
                            : state.activeBulkOperation,
                }))
            },

            clearBulkOperations: () => {
                set({
                    bulkOperations: [],
                    activeBulkOperation: undefined,
                })
            },

            // Utilities
            getRecentScans: (limit = 10) => {
                return get().scanHistory.slice(0, limit)
            },

            getValidScans: () => {
                return get().scanHistory.filter((scan) => scan.isValid)
            },

            getActiveBulkOperations: () => {
                return get().bulkOperations.filter(
                    (op) =>
                        op.status === 'pending' || op.status === 'processing',
                )
            },

            // Reset
            resetCylinderData: () => {
                set({
                    selectedCylinder: null,
                    scanHistory: [],
                    isScanning: false,
                    lastScanError: undefined,
                    bulkOperations: [],
                    activeBulkOperation: undefined,
                })
            },
        }),
        {
            name: 'cylinderx-cylinder-store',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                scanHistory: state.scanHistory.slice(0, 20),
                bulkOperations: state.bulkOperations.filter(
                    (op) =>
                        op.status === 'processing' || op.status === 'pending',
                ),
            }),
        },
    ),
)

// Utility function to validate QR code data
export const validateQRData = (qrData: string): QRScanResult | null => {
    try {
        const parsed = JSON.parse(qrData)

        if (
            typeof parsed.id === 'number' &&
            typeof parsed.code === 'string' &&
            typeof parsed.type === 'string' &&
            typeof parsed.outlet === 'number' &&
            typeof parsed.qr === 'string'
        ) {
            return {
                id: `scan_${Date.now()}`,
                cylinderId: parsed.id.toString(),
                cylinderCode: parsed.code,
                type: parsed.type,
                outletId: parsed.outlet.toString(),
                qrCode: parsed.qr,
                scannedAt: new Date().toISOString(),
                isValid: true,
            }
        }
    } catch (error) {
        console.error('Invalid QR code data:', error)
    }

    return null
}
