'use client'

import Link from 'next/link'
import { useCustomerActiveLeases } from '@/hooks/useLeases'
import { useCurrentCustomerId } from '@/hooks/useCurrentCustomer'
import { Skeleton } from '@/components/ui/Skeleton'
import { Alert } from '@/components/ui/Alert'
import { formatDate } from '@/utils/format'
import { LeaseStatus } from '@/types/cylinder'

export default function CustomerCylindersPage() {
    const {
        customerId,
        isLoading: customerLoading,
        error: customerError,
    } = useCurrentCustomerId()

    const {
        data: activeLeases,
        error: leaseError,
        isLoading: leaseLoading,
    } = useCustomerActiveLeases(customerId)

    const isLoading = customerLoading || leaseLoading
    const error = customerError || leaseError

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    My Cylinders
                </h1>
                <p className="text-gray-600">
                    Cylinders you currently have on lease
                </p>
            </div>

            {error && (
                <Alert type="danger" className="mb-6">
                    Failed to load your cylinders. Please try again later.
                </Alert>
            )}

            {isLoading ? (
                <div className="space-y-3">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                </div>
            ) : !activeLeases || activeLeases.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <p className="text-gray-500 mb-4">
                        You don&apos;t have any cylinders on lease right now.
                    </p>
                    <Link
                        href="/customer/lease-new"
                        className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                        Browse Available Cylinders
                    </Link>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Cylinder
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Leased Since
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Expected Return
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {activeLeases.map((lease) => (
                                    <tr key={lease.id}>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                                            {lease.cylinder?.cylinderCode}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                            {lease.cylinder?.type}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                            {formatDate(lease.leaseDate)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                            {formatDate(
                                                lease.expectedReturnDate,
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
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
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}
