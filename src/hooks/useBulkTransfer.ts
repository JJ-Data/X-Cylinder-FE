'use client'

import { useCallback, useState } from 'react'
import { useCylinderMutations } from '@/hooks/useCylinders'

export type BulkTransferInput = {
    cylinderIds: number[]
    toOutletId: number
    reason: string
    notes?: string
}

export type BulkTransferResult = {
    succeeded: number[]
    failed: { cylinderId: number; message: string }[]
}

export function useBulkTransfer() {
    const { transferCylinder } = useCylinderMutations()
    const [progress, setProgress] = useState({ done: 0, total: 0 })

    const run = useCallback(
        async (input: BulkTransferInput): Promise<BulkTransferResult> => {
            const result: BulkTransferResult = { succeeded: [], failed: [] }
            setProgress({ done: 0, total: input.cylinderIds.length })

            // Sequential on purpose: gentle on the live API, easy to report per item
            for (const cylinderId of input.cylinderIds) {
                try {
                    await transferCylinder({
                        cylinderId,
                        toOutletId: input.toOutletId,
                        // reason: input.reason,
                        // notes: input.notes,
                        reason: input.reason.trim().slice(0, 255) || undefined,
                        notes: input.notes?.trim().slice(0, 500) || undefined,
                    })
                    result.succeeded.push(cylinderId)
                } catch (e) {
                    result.failed.push({
                        cylinderId,
                        message: (e as Error).message || 'Transfer failed',
                    })
                }
                setProgress((p) => ({ ...p, done: p.done + 1 }))
            }
            return result
        },
        [transferCylinder],
    )

    return { run, progress }
}
