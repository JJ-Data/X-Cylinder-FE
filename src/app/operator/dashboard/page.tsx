'use client'

import { useSession } from 'next-auth/react'
import { useAuthStore, useOutletStore } from '@/stores'
import { useOperatorPerformance } from '@/hooks/useAnalytics'
import { useRefills } from '@/hooks/useRefills'
import { useCylinders } from '@/hooks/useCylinders'
import { Skeleton } from '@/components/ui/Skeleton'
import { Alert } from '@/components/ui/Alert'
import { formatCurrency } from '@/utils/format'
import Link from 'next/link'
import { CylinderStatus } from '@/types/cylinder'

export default function OperatorDashboard() {
    const { data: session } = useSession()
    const { activeRole } = useAuthStore()
    const { currentOutlet } = useOutletStore()

    // Fetch operator-specific data
    const operatorId = session?.user?.id ? parseInt(session.user.id) : undefined
    const outletId = session?.user?.outletId
        ? parseInt(session.user.outletId)
        : undefined

    const {
        data: performance,
        error: perfError,
        isLoading: perfLoading,
    } = useOperatorPerformance(operatorId)
    const {
        data: refills,
        error: refillError,
        isLoading: refillLoading,
    } = useRefills(operatorId ? { operatorId, limit: 10 } : undefined)
    const {
        data: cylinders,
        error: cylError,
        isLoading: cylLoading,
    } = useCylinders(
        outletId ? { outletId, status: CylinderStatus.IN_REFILL } : undefined,
    )

    const isLoading = perfLoading || refillLoading || cylLoading
    const hasError = perfError || refillError || cylError

    // Calculate metrics
    const todayRefills = performance?.daily?.[0]?.refillCount || 0
    const pendingRefills = cylinders?.meta?.total || 0
    const qualityRate = performance?.metrics?.accuracy || 0

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Operator Dashboard
                </h1>
                <p className="text-gray-600">
                    Welcome back, {session?.user?.name || 'Operator'}!
                </p>
                {currentOutlet && (
                    <p className="text-sm text-gray-500 mt-1">
                        Current Outlet: {currentOutlet.name} (ID:{' '}
                        {currentOutlet.id})
                    </p>
                )}
            </div>

            {/* Error State */}
            {hasError && (
                <Alert type="danger" className="mb-6">
                    Failed to load dashboard data. Please try again later.
                </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Pending Refills */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Pending Refills
                        </h3>
                        {isLoading ? (
                            <Skeleton className="h-6 w-12" />
                        ) : (
                            <div className="bg-orange-100 text-orange-800 text-sm font-medium px-2.5 py-0.5 rounded">
                                {pendingRefills}
                            </div>
                        )}
                    </div>
                    <p className="text-gray-600 text-sm">Awaiting refill</p>
                </div>

                {/* Completed Today */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Completed Today
                        </h3>
                        {isLoading ? (
                            <Skeleton className="h-6 w-12" />
                        ) : (
                            <div className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded">
                                {todayRefills}
                            </div>
                        )}
                    </div>
                    <p className="text-gray-600 text-sm">Refills completed</p>
                </div>

                {/* Quality Rate */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Quality Rate
                        </h3>
                        {isLoading ? (
                            <Skeleton className="h-6 w-14" />
                        ) : (
                            <div className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
                                {qualityRate.toFixed(1)}%
                            </div>
                        )}
                    </div>
                    <p className="text-gray-600 text-sm">Accuracy rate</p>
                </div>

                {/* Daily Average */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Daily Average
                        </h3>
                        {isLoading ? (
                            <Skeleton className="h-6 w-12" />
                        ) : (
                            <div className="bg-purple-100 text-purple-800 text-sm font-medium px-2.5 py-0.5 rounded">
                                {performance?.metrics?.dailyAverage || 0}
                            </div>
                        )}
                    </div>
                    <p className="text-gray-600 text-sm">Refills per day</p>
                </div>
            </div>

            {/* Refill Operations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Quick Actions
                    </h3>
                    <div className="space-y-3">
                        <Link
                            href="/operator/qr-scanner"
                            className="block w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                            <span className="font-medium text-blue-900">
                                Scan QR Code
                            </span>
                            <p className="text-sm text-blue-700">
                                Start refill with QR scanner
                            </p>
                        </Link>
                        <Link
                            href="/operator/refill-queue"
                            className="block w-full text-left px-4 py-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
                        >
                            <span className="font-medium text-orange-900">
                                View Queue
                            </span>
                            <p className="text-sm text-orange-700">
                                Check pending refills
                            </p>
                        </Link>
                        <Link
                            href="/operator/bulk-refill"
                            className="block w-full text-left px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                        >
                            <span className="font-medium text-purple-900">
                                Bulk Upload
                            </span>
                            <p className="text-sm text-purple-700">
                                Process multiple refills
                            </p>
                        </Link>
                    </div>
                </div>

                {/* Recent Refills */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Recent Refills
                    </h3>
                    {isLoading ? (
                        <div className="space-y-3">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {refills?.data?.slice(0, 5).map((refill) => (
                                <div
                                    key={refill.id}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                >
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            {refill.cylinder?.cylinderCode}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {refill.volumeAdded}kg •{' '}
                                            {formatCurrency(
                                                parseFloat(refill.refillCost),
                                            )}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500">
                                            {new Date(
                                                refill.refillDate,
                                            ).toLocaleTimeString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {(!refills?.data || refills.data.length === 0) && (
                                <p className="text-gray-500 text-center py-4">
                                    No refills yet today
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Performance Overview
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                            {isLoading ? (
                                <Skeleton className="h-8 w-16 mx-auto" />
                            ) : (
                                performance?.metrics?.totalRefills || 0
                            )}
                        </div>
                        <div className="text-sm text-gray-600">
                            Total Refills
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                            {isLoading ? (
                                <Skeleton className="h-8 w-16 mx-auto" />
                            ) : (
                                `${performance?.metrics?.efficiency || 0}%`
                            )}
                        </div>
                        <div className="text-sm text-gray-600">
                            Efficiency Rate
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                            {isLoading ? (
                                <Skeleton className="h-8 w-16 mx-auto" />
                            ) : (
                                performance?.metrics?.rating?.toFixed(1) ||
                                'N/A'
                            )}
                        </div>
                        <div className="text-sm text-gray-600">
                            Performance Rating
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                            {isLoading ? (
                                <Skeleton className="h-8 w-20 mx-auto" />
                            ) : (
                                formatCurrency(
                                    performance?.daily?.[0]?.revenueGenerated ||
                                        0,
                                )
                            )}
                        </div>
                        <div className="text-sm text-gray-600">
                            Today&apos;s Revenue
                        </div>
                    </div>
                </div>
            </div>

            {/* Debug Info */}
            <div className="mt-8 bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Debug Info:
                </h4>
                <p className="text-xs text-gray-600">
                    Active Role: {activeRole}
                </p>
                <p className="text-xs text-gray-600">
                    User ID: {session?.user?.id}
                </p>
                <p className="text-xs text-gray-600">
                    User Role: {session?.user?.role}
                </p>
                <p className="text-xs text-gray-600">
                    Outlet ID: {session?.user?.outletId}
                </p>
                <p className="text-xs text-gray-600">
                    Current Outlet: {currentOutlet?.name || 'Not set'}
                </p>
            </div>
        </div>
    )
}
