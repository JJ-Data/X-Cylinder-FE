'use client'

import { useSession } from 'next-auth/react'
import { useAuthStore, useOutletStore } from '@/stores'
import { useOutletPerformance } from '@/hooks/useAnalytics'
import { useCylinders } from '@/hooks/useCylinders'
import { useLeases } from '@/hooks/useLeases'
import { Skeleton } from '@/components/ui/Skeleton'
import { Alert } from '@/components/ui/Alert'
import { formatCurrency } from '@/utils/format'
import Link from 'next/link'
import { CylinderStatus, LeaseStatus } from '@/types/cylinder'

export default function StaffDashboard() {
    const { data: session } = useSession()
    const { activeRole } = useAuthStore()
    const { currentOutlet } = useOutletStore()

    // Fetch outlet-specific data
    const outletId = session?.user?.outletId
        ? parseInt(session.user.outletId)
        : undefined
    const {
        data: performance,
        error: perfError,
        isLoading: perfLoading,
    } = useOutletPerformance(
        outletId
            ? {
                  outletId,
                  startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                      .toISOString()
                      .split('T')[0], // 30 days ago
                  endDate: new Date().toISOString().split('T')[0], // today
              }
            : undefined,
    )
    const {
        data: cylinders,
        error: cylError,
        isLoading: cylLoading,
    } = useCylinders(outletId ? { outletId, limit: 10 } : undefined)
    const {
        data: leases,
        error: leaseError,
        isLoading: leaseLoading,
    } = useLeases(outletId ? { outletId, limit: 10 } : undefined)

    // Calculate metrics
    const availableCylinders =
        cylinders?.data?.filter((c) => c.status === CylinderStatus.AVAILABLE)
            .length || 0
    const activeLeases =
        leases?.data?.filter((l) => l.leaseStatus === LeaseStatus.ACTIVE)
            .length || 0
    const overdueLeases =
        leases?.data?.filter((l) => l.leaseStatus === LeaseStatus.OVERDUE)
            .length || 0

    const isLoading = perfLoading || cylLoading || leaseLoading
    const hasError = perfError || cylError || leaseError

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Staff Dashboard
                </h1>
                <p className="text-gray-600">
                    Welcome back, {session?.user?.name || 'Staff Member'}!
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
                {/* Available Cylinders Card */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Available Cylinders
                        </h3>
                        {isLoading ? (
                            <Skeleton className="h-6 w-12" />
                        ) : (
                            <div className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
                                {availableCylinders}
                            </div>
                        )}
                    </div>
                    <p className="text-gray-600 text-sm">Ready for lease</p>
                </div>

                {/* Active Leases Card */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Active Leases
                        </h3>
                        {isLoading ? (
                            <Skeleton className="h-6 w-12" />
                        ) : (
                            <div className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded">
                                {activeLeases}
                            </div>
                        )}
                    </div>
                    <p className="text-gray-600 text-sm">
                        Currently leased out
                    </p>
                </div>

                {/* Overdue Returns Card */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Overdue Returns
                        </h3>
                        {isLoading ? (
                            <Skeleton className="h-6 w-8" />
                        ) : (
                            <div
                                className={`${overdueLeases > 0 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'} text-sm font-medium px-2.5 py-0.5 rounded`}
                            >
                                {overdueLeases}
                            </div>
                        )}
                    </div>
                    <p className="text-gray-600 text-sm">Require follow-up</p>
                </div>

                {/* Monthly Revenue Card */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Monthly Revenue
                        </h3>
                        {isLoading ? (
                            <Skeleton className="h-6 w-20" />
                        ) : (
                            <div className="bg-purple-100 text-purple-800 text-sm font-medium px-2.5 py-0.5 rounded">
                                {formatCurrency(
                                    performance?.[0]?.metrics.monthlyRevenue ||
                                        0,
                                )}
                            </div>
                        )}
                    </div>
                    <p className="text-gray-600 text-sm">This month</p>
                </div>
            </div>

            {/* Quick Actions and Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Quick Actions
                    </h3>
                    <div className="space-y-3">
                        <Link
                            href="/staff/leasing/new"
                            className="block w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                            <span className="font-medium text-blue-900">
                                New Lease
                            </span>
                            <p className="text-sm text-blue-700">
                                Process a new cylinder lease
                            </p>
                        </Link>
                        <Link
                            href="/staff/leasing/returns"
                            className="block w-full text-left px-4 py-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                        >
                            <span className="font-medium text-green-900">
                                Process Return
                            </span>
                            <p className="text-sm text-green-700">
                                Handle cylinder returns
                            </p>
                        </Link>
                        <Link
                            href="/staff/customers"
                            className="block w-full text-left px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                        >
                            <span className="font-medium text-purple-900">
                                Customer Lookup
                            </span>
                            <p className="text-sm text-purple-700">
                                Search and manage customers
                            </p>
                        </Link>
                    </div>
                </div>

                {/* Recent Leases */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Recent Leases
                    </h3>
                    {isLoading ? (
                        <div className="space-y-3">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {leases?.data?.slice(0, 5).map((lease) => (
                                <div
                                    key={lease.id}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                >
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            {lease.customer?.firstName}{' '}
                                            {lease.customer?.lastName}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Cylinder:{' '}
                                            {lease.cylinder?.cylinderCode}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-gray-900">
                                            {formatCurrency(
                                                parseFloat(lease.leaseAmount),
                                            )}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(
                                                lease.leaseDate,
                                            ).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {(!leases?.data || leases.data.length === 0) && (
                                <p className="text-gray-500 text-center py-4">
                                    No recent leases
                                </p>
                            )}
                        </div>
                    )}
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
