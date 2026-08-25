'use client'

import { useSession } from 'next-auth/react'
import { useAuthStore } from '@/stores'
import { useMyCustomerDashboard } from '@/hooks/useCustomerSelf'
import { Skeleton } from '@/components/ui/Skeleton'
import { Alert } from '@/components/ui/Alert'
import { formatCurrency, formatDate } from '@/utils/format'
import Link from 'next/link'
import { LeaseStatus } from '@/types/cylinder'

export default function CustomerDashboard() {
    const { data: session } = useSession()
    const { activeRole } = useAuthStore()

    const {
        data: dashboard,
        error,
        isLoading,
    } = useMyCustomerDashboard()

    // Best-guess field mapping against this backend's usual dashboard shape
    // (see /analytics/dashboard's DashboardMetrics) - the raw response is
    // dumped in the Debug Info panel below so field names can be corrected
    // in one look if they don't match what GET /customers/me/dashboard
    // actually returns.
    const activeLeases: any[] =
        dashboard?.activeLeases || dashboard?.leases?.active || []
    const activeLeasesCount =
        dashboard?.summary?.activeLeases ??
        dashboard?.activeLeasesCount ??
        activeLeases.length
    const overdueCount =
        dashboard?.summary?.overdueLeases ??
        dashboard?.overdueCount ??
        activeLeases.filter(
            (lease) => lease.leaseStatus === LeaseStatus.OVERDUE,
        ).length
    const totalSpent =
        dashboard?.summary?.totalSpent ?? dashboard?.totalSpent ?? 0

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Customer Dashboard
                </h1>
                <p className="text-gray-600">
                    Welcome back, {session?.user?.name || 'Customer'}!
                </p>
            </div>

            {/* Error State */}
            {error && (
                <Alert type="danger" className="mb-6">
                    Failed to load dashboard data. Please try again later.
                </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Active Leases Card */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Active Leases
                        </h3>
                        {isLoading ? (
                            <Skeleton className="h-6 w-8" />
                        ) : (
                            <div className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
                                {activeLeasesCount}
                            </div>
                        )}
                    </div>
                    <p className="text-gray-600 text-sm">Currently leasing</p>
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
                                className={`${overdueCount > 0 ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'} text-sm font-medium px-2.5 py-0.5 rounded`}
                            >
                                {overdueCount}
                            </div>
                        )}
                    </div>
                    <p className="text-gray-600 text-sm">
                        {overdueCount > 0 ? 'Need attention' : 'All on time'}
                    </p>
                </div>

                {/* Total Spent Card */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Total Spent
                        </h3>
                        {isLoading ? (
                            <Skeleton className="h-6 w-20" />
                        ) : (
                            <div className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded">
                                {formatCurrency(totalSpent)}
                            </div>
                        )}
                    </div>
                    <p className="text-gray-600 text-sm">Lifetime total</p>
                </div>

                {/* Available for Lease Card */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Available
                        </h3>
                        <Link
                            href="/customer/lease-new"
                            className="bg-purple-100 text-purple-800 hover:bg-purple-200 text-sm font-medium px-2.5 py-0.5 rounded transition-colors"
                        >
                            Browse →
                        </Link>
                    </div>
                    <p className="text-gray-600 text-sm">Cylinders to lease</p>
                </div>
            </div>

            {/* Quick Actions and Active Leases */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Quick Actions
                    </h3>
                    <div className="space-y-3">
                        <Link
                            href="/customer/lease-new"
                            className="block w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                            <span className="font-medium text-blue-900">
                                Lease New Cylinder
                            </span>
                            <p className="text-sm text-blue-700">
                                Browse available cylinders
                            </p>
                        </Link>
                        <Link
                            href="/customer/cylinders"
                            className="block w-full text-left px-4 py-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                        >
                            <span className="font-medium text-green-900">
                                My Cylinders
                            </span>
                            <p className="text-sm text-green-700">
                                View and manage your leases
                            </p>
                        </Link>
                        <Link
                            href="/customer/transactions"
                            className="block w-full text-left px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                        >
                            <span className="font-medium text-purple-900">
                                Transaction History
                            </span>
                            <p className="text-sm text-purple-700">
                                View payment history
                            </p>
                        </Link>
                    </div>
                </div>

                {/* Active Leases */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        My Active Leases
                    </h3>
                    {isLoading ? (
                        <div className="space-y-3">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {activeLeases?.slice(0, 5).map((lease) => (
                                <div
                                    key={lease.id}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                >
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            {lease.cylinder?.cylinderCode}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {lease.cylinder?.type} • Since{' '}
                                            {formatDate(lease.leaseDate)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span
                                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                                lease.leaseStatus ===
                                                LeaseStatus.OVERDUE
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-green-100 text-green-800'
                                            }`}
                                        >
                                            {lease.leaseStatus}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {(!activeLeases || activeLeases.length === 0) && (
                                <p className="text-gray-500 text-center py-4">
                                    No active leases
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
                <details className="mt-2">
                    <summary className="text-xs text-gray-600 cursor-pointer">
                        Raw /customers/me/dashboard response
                    </summary>
                    <pre className="text-xs text-gray-600 whitespace-pre-wrap break-all mt-1">
                        {JSON.stringify(dashboard, null, 2)}
                    </pre>
                </details>
            </div>
        </div>
    )
}
