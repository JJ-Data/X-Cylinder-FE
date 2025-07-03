'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Package, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { useCylinders } from '@/hooks/useCylinders'
import { useRefillMutations } from '@/hooks/useRefills'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { formatCurrency } from '@/utils/format'
import { CylinderStatus } from '@/types/cylinder'
import type { Cylinder } from '@/types/cylinder'
import { useSession } from 'next-auth/react'

export default function RefillQueuePage() {
    const _router = useRouter()
    const { data: session } = useSession()
    const [selectedCylinder, setSelectedCylinder] = useState<Cylinder | null>(
        null,
    )
    const [volume, setVolume] = useState(0)
    const [isProcessing, setIsProcessing] = useState(false)

    const outletId = session?.user?.outletId
        ? parseInt(session.user.outletId)
        : undefined

    // Get cylinders in refill queue
    const {
        data,
        error: _error,
        isLoading,
        mutate,
    } = useCylinders({
        status: CylinderStatus.IN_REFILL,
        outletId,
        limit: 50,
    })

    const { createRefill } = useRefillMutations()

    const handleRefillStart = (cylinder: Cylinder) => {
        setSelectedCylinder(cylinder)
        // Set default volume based on cylinder type
        const defaultVolumes: Record<string, number> = {
            SMALL: 10,
            MEDIUM: 25,
            LARGE: 50,
        }
        setVolume(defaultVolumes[cylinder.type] || 25)
    }

    const handleRefillComplete = async () => {
        if (!selectedCylinder || volume <= 0) return

        setIsProcessing(true)
        try {
            await createRefill({
                cylinderId: selectedCylinder.id,
                volume,
                cost: calculateCost(volume),
                paymentMethod: 'CASH',
                notes: `Refilled from queue`,
            })

            // Refresh the queue
            mutate()

            // Reset selection
            setSelectedCylinder(null)
            setVolume(0)

            // Show success
            alert('Refill completed successfully!')
        } catch (err) {
            console.error('Failed to complete refill:', err)
            alert('Failed to complete refill')
        } finally {
            setIsProcessing(false)
        }
    }

    const calculateCost = (volume: number) => {
        return volume * 50 // ₦50 per liter
    }

    const pendingCylinders = data?.data || []

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Refill Queue
                </h1>
                <p className="text-gray-600">
                    Cylinders waiting to be refilled
                </p>
            </div>

            {/* Queue Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-2">
                        <Package className="h-8 w-8 text-orange-500" />
                        <span className="text-2xl font-bold text-gray-900">
                            {pendingCylinders.length}
                        </span>
                    </div>
                    <div className="text-sm text-gray-600">In Queue</div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-2">
                        <Clock className="h-8 w-8 text-blue-500" />
                        <span className="text-2xl font-bold text-gray-900">
                            {
                                pendingCylinders.filter((c) => c.currentLease)
                                    .length
                            }
                        </span>
                    </div>
                    <div className="text-sm text-gray-600">
                        Customer Waiting
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-2">
                        <CheckCircle className="h-8 w-8 text-green-500" />
                        <span className="text-2xl font-bold text-gray-900">
                            15
                        </span>
                    </div>
                    <div className="text-sm text-gray-600">Completed Today</div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-2">
                        <AlertCircle className="h-8 w-8 text-red-500" />
                        <span className="text-2xl font-bold text-gray-900">
                            0
                        </span>
                    </div>
                    <div className="text-sm text-gray-600">Need Inspection</div>
                </div>
            </div>

            {/* Queue List */}
            <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b">
                    <h2 className="text-lg font-semibold">Pending Refills</h2>
                </div>

                {isLoading ? (
                    <div className="p-12 text-center text-gray-500">
                        Loading queue...
                    </div>
                ) : pendingCylinders.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        No cylinders in queue
                    </div>
                ) : (
                    <div className="divide-y">
                        {pendingCylinders.map((cylinder) => (
                            <div
                                key={cylinder.id}
                                className="p-6 hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-4">
                                            <div>
                                                <div className="font-medium text-gray-900">
                                                    {cylinder.code}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {cylinder.type}
                                                </div>
                                            </div>

                                            {cylinder.currentLease && (
                                                <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                                                    Customer Waiting
                                                </div>
                                            )}
                                        </div>

                                        {cylinder.currentLease && (
                                            <div className="mt-2 text-sm text-gray-600">
                                                Customer:{' '}
                                                {
                                                    cylinder.currentLease
                                                        .customer?.firstName
                                                }{' '}
                                                {
                                                    cylinder.currentLease
                                                        .customer?.lastName
                                                }{' '}
                                                •{' '}
                                                {
                                                    cylinder.currentLease
                                                        .customer?.email
                                                }
                                            </div>
                                        )}
                                    </div>

                                    <Button
                                        variant="solid"
                                        size="sm"
                                        onClick={() =>
                                            handleRefillStart(cylinder)
                                        }
                                    >
                                        Start Refill
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Refill Modal */}
            {selectedCylinder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full m-4">
                        <h3 className="text-lg font-semibold mb-4">
                            Refill Cylinder {selectedCylinder.code}
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Cylinder Type
                                </label>
                                <div className="text-gray-900">
                                    {selectedCylinder.type}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Volume (Liters)
                                </label>
                                <input
                                    type="number"
                                    value={volume}
                                    onChange={(e) =>
                                        setVolume(Number(e.target.value))
                                    }
                                    min="0"
                                    max="50"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex justify-between items-center">
                                    <span className="font-medium">
                                        Total Cost:
                                    </span>
                                    <span className="text-lg font-bold">
                                        {formatCurrency(calculateCost(volume))}
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button
                                    variant="plain"
                                    onClick={() => {
                                        setSelectedCylinder(null)
                                        setVolume(0)
                                    }}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="solid"
                                    onClick={handleRefillComplete}
                                    loading={isProcessing}
                                    disabled={volume <= 0}
                                    className="flex-1"
                                >
                                    Complete Refill
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
