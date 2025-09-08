'use client'

import { useSession } from 'next-auth/react'
import { useAuthStore, useOutletStore } from '@/stores'
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

    // Security check - operators must have outlet assigned
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
        data: refills,
        error: refillError,
        isLoading: refillLoading,
    } = useRefills(operatorId ? { operatorId, limit: 10 } : undefined)
    const {
        data: cylinders,
        error: cylError,
        isLoading: cylLoading,
    } = useCylinders(
        outletId ? { outletId, status: 'available' } : undefined,
    )

    const isLoading = refillLoading || cylLoading
    const hasError = refillError || cylError

    // Calculate metrics
    const todayRefills = refills?.data?.filter((r: any) => {
        const today = new Date().toDateString()
        return r.refillDate && new Date(r.refillDate).toDateString() === today
    }).length || 0
    const availableCylinders = cylinders?.meta?.total || 0
    const totalRefills = refills?.meta?.total || 0
    
    // Calculate weekly average
    const weeklyAverage = (() => {
        if (!refills?.data || refills.data.length === 0) return 0
        const oneWeekAgo = new Date()
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
        const weekRefills = refills.data.filter((r: any) => 
            r.refillDate && new Date(r.refillDate) >= oneWeekAgo
        ).length
        return Math.round(weekRefills / 7)
    })()

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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
                {/* Available Cylinders */}
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
                        {availableCylinders < 5 && (
                            <div className="flex items-center text-xs text-orange-600">
                                <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <span>Low stock</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Completed Today */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">
                                    Completed Today
                                </h3>
                                {isLoading ? (
                                    <Skeleton className="h-7 w-16 mt-1" />
                                ) : (
                                    <p className="text-2xl font-bold text-gray-900">
                                        {todayRefills}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-600">Refills completed</p>
                        <div className="flex items-center text-xs text-green-600">
                            <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                            <span>+8.5%</span>
                        </div>
                    </div>
                </div>

                {/* Total Refills */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">
                                    Total Refills
                                </h3>
                                {isLoading ? (
                                    <Skeleton className="h-7 w-16 mt-1" />
                                ) : (
                                    <p className="text-2xl font-bold text-gray-900">
                                        {totalRefills}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-600">All time total</p>
                        <div className="flex items-center text-xs text-blue-600">
                            <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span>Your refills</span>
                        </div>
                    </div>
                </div>

                {/* Weekly Average */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">
                                    Weekly Average
                                </h3>
                                {isLoading ? (
                                    <Skeleton className="h-7 w-16 mt-1" />
                                ) : (
                                    <p className="text-2xl font-bold text-gray-900">
                                        {weeklyAverage}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-600">Avg per day (7 days)</p>
                        <div className="flex items-center text-xs text-purple-600">
                            <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span>Last 7 days</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Refill Operations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">
                        Quick Actions
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                        <Link
                            href="/operator/refills/new"
                            className="group block w-full text-left p-4 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl transition-all duration-200 border border-blue-200 hover:border-blue-300 hover:shadow-md"
                        >
                            <div className="flex items-start space-x-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                                    <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <span className="font-semibold text-blue-900 block mb-1">
                                        New Refill
                                    </span>
                                    <p className="text-sm text-blue-700">
                                        Record a new cylinder refill
                                    </p>
                                </div>
                                <div className="text-blue-400 group-hover:text-blue-600 transition-colors">
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        </Link>
                        <Link
                            href="/operator/refills"
                            className="group block w-full text-left p-4 bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 rounded-xl transition-all duration-200 border border-orange-200 hover:border-orange-300 hover:shadow-md"
                        >
                            <div className="flex items-start space-x-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                                    <svg className="h-5 w-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <span className="font-semibold text-orange-900 block mb-1">
                                        All Refills
                                    </span>
                                    <p className="text-sm text-orange-700">
                                        View refill history
                                    </p>
                                </div>
                                <div className="text-orange-400 group-hover:text-orange-600 transition-colors">
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        </Link>
                        <Link
                            href="/operator/bulk-refill"
                            className="group block w-full text-left p-4 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-xl transition-all duration-200 border border-purple-200 hover:border-purple-300 hover:shadow-md"
                        >
                            <div className="flex items-start space-x-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                                    <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <span className="font-semibold text-purple-900 block mb-1">
                                        Bulk Upload
                                    </span>
                                    <p className="text-sm text-purple-700">
                                        Process multiple refills
                                    </p>
                                </div>
                                <div className="text-purple-400 group-hover:text-purple-600 transition-colors">
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        </Link>
                        <Link
                            href="/operator/swaps/new"
                            className="group block w-full text-left p-4 bg-gradient-to-br from-teal-50 to-teal-100 hover:from-teal-100 hover:to-teal-200 rounded-xl transition-all duration-200 border border-teal-200 hover:border-teal-300 hover:shadow-md"
                        >
                            <div className="flex items-start space-x-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                                    <svg className="h-5 w-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <span className="font-semibold text-teal-900 block mb-1">
                                        Cylinder Swap
                                    </span>
                                    <p className="text-sm text-teal-700">
                                        Replace damaged cylinders
                                    </p>
                                </div>
                                <div className="text-teal-400 group-hover:text-teal-600 transition-colors">
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Recent Refills */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Recent Refills
                        </h3>
                        <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            Last 5
                        </div>
                    </div>
                    {isLoading ? (
                        <div className="space-y-3">
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {refills?.data?.slice(0, 5).map((refill, index) => (
                                <div
                                    key={refill.id}
                                    className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-150 rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-200"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="flex items-center justify-center w-8 h-8 bg-white rounded-lg shadow-sm">
                                            <span className="text-xs font-semibold text-gray-600">
                                                #{index + 1}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">
                                                {refill.cylinder?.cylinderCode}
                                            </p>
                                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                <span className="flex items-center">
                                                    <svg className="h-3 w-3 mr-1 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                                    </svg>
                                                    {refill.volumeAdded}kg
                                                </span>
                                                <span>•</span>
                                                <span className="flex items-center">
                                                    <svg className="h-3 w-3 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                                    </svg>
                                                    {formatCurrency(parseFloat(refill.refillCost))}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center text-xs text-gray-500 mb-1">
                                            <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                            </svg>
                                            {new Date(refill.refillDate).toLocaleTimeString()}
                                        </div>
                                        <div className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                                            <svg className="h-2 w-2 mr-1 fill-current" viewBox="0 0 8 8">
                                                <circle cx="4" cy="4" r="3" />
                                            </svg>
                                            Complete
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {(!refills?.data || refills.data.length === 0) && (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-500 font-medium">No refills yet today</p>
                                    <p className="text-sm text-gray-400 mt-1">Completed refills will appear here</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
