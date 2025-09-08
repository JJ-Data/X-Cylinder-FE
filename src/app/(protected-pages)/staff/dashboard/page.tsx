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

    // Ensure outlet is assigned for staff role
    const outletId = session?.user?.outletId
        ? parseInt(session.user.outletId)
        : undefined

    // Security check - staff must have outlet assigned
    if (!outletId) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Alert type="danger">
                    Access denied: No outlet assigned to your account. Please contact your administrator.
                </Alert>
            </div>
        )
    }
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
                {/* Available Cylinders Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">
                                    Available Cylinders
                                </h3>
                                {isLoading ? (
                                    <Skeleton className="h-7 w-16 mt-1" />
                                ) : (
                                    <p className="text-2xl font-bold text-gray-900">
                                        {availableCylinders}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-600">Ready for lease</p>
                        <div className="flex items-center text-xs text-green-600">
                            <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                            <span>+5.2%</span>
                        </div>
                    </div>
                </div>

                {/* Active Leases Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">
                                    Active Leases
                                </h3>
                                {isLoading ? (
                                    <Skeleton className="h-7 w-16 mt-1" />
                                ) : (
                                    <p className="text-2xl font-bold text-gray-900">
                                        {activeLeases}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-600">Currently leased out</p>
                        <div className="flex items-center text-xs text-blue-600">
                            <span>+2.1%</span>
                        </div>
                    </div>
                </div>

                {/* Overdue Returns Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${overdueLeases > 0 ? 'bg-red-100' : 'bg-gray-100'}`}>
                                <svg className={`h-6 w-6 ${overdueLeases > 0 ? 'text-red-600' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">
                                    Overdue Returns
                                </h3>
                                {isLoading ? (
                                    <Skeleton className="h-7 w-16 mt-1" />
                                ) : (
                                    <p className={`text-2xl font-bold ${overdueLeases > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                                        {overdueLeases}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-600">Require follow-up</p>
                        {overdueLeases > 0 && (
                            <div className="flex items-center text-xs text-red-600">
                                <span>Urgent</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Monthly Revenue Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">
                                    Monthly Revenue
                                </h3>
                                {isLoading ? (
                                    <Skeleton className="h-7 w-20 mt-1" />
                                ) : (
                                    <p className="text-2xl font-bold text-gray-900">
                                        {formatCurrency(
                                            performance?.[0]?.metrics.monthlyRevenue ||
                                                0,
                                        )}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-600">This month</p>
                        <div className="flex items-center text-xs text-purple-600">
                            <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                            <span>+12.5%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions and Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Quick Actions
                        </h3>
                        <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Link
                            href="/staff/leasing/new"
                            className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border border-blue-200 rounded-xl p-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-blue-500 rounded-lg text-white group-hover:bg-blue-600 transition-colors">
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                </div>
                                <div>
                                    <span className="font-semibold text-blue-900 text-sm">
                                        New Lease
                                    </span>
                                    <p className="text-xs text-blue-700 mt-1">
                                        Process lease
                                    </p>
                                </div>
                            </div>
                        </Link>
                        
                        <Link
                            href="/staff/leasing/returns"
                            className="group relative overflow-hidden bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 border border-green-200 rounded-xl p-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-green-500 rounded-lg text-white group-hover:bg-green-600 transition-colors">
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                                <div>
                                    <span className="font-semibold text-green-900 text-sm">
                                        Process Return
                                    </span>
                                    <p className="text-xs text-green-700 mt-1">
                                        Handle returns
                                    </p>
                                </div>
                            </div>
                        </Link>
                        
                        <Link
                            href="/staff/swaps/new"
                            className="group relative overflow-hidden bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 border border-orange-200 rounded-xl p-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-orange-500 rounded-lg text-white group-hover:bg-orange-600 transition-colors">
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                    </svg>
                                </div>
                                <div>
                                    <span className="font-semibold text-orange-900 text-sm">
                                        Cylinder Swap
                                    </span>
                                    <p className="text-xs text-orange-700 mt-1">
                                        Replace cylinders
                                    </p>
                                </div>
                            </div>
                        </Link>
                        
                        <Link
                            href="/staff/customers"
                            className="group relative overflow-hidden bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border border-purple-200 rounded-xl p-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-purple-500 rounded-lg text-white group-hover:bg-purple-600 transition-colors">
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <div>
                                    <span className="font-semibold text-purple-900 text-sm">
                                        Customer Lookup
                                    </span>
                                    <p className="text-xs text-purple-700 mt-1">
                                        Search customers
                                    </p>
                                </div>
                            </div>
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
        </div>
    )
}
