'use client'

import { useMyCustomerHistory } from '@/hooks/useCustomerSelf'
import { Skeleton } from '@/components/ui/Skeleton'
import { Alert } from '@/components/ui/Alert'
import { formatDate, formatCurrency } from '@/utils/format'
import type { LeaseRecord } from '@/types/cylinder'
import type { SwapRecord } from '@/types/swap'

export default function CustomerTransactionsPage() {
    const { data: history, error, isLoading } = useMyCustomerHistory()

    const leaseHistory: LeaseRecord[] = history?.leaseHistory || []
    const swapHistory: SwapRecord[] = history?.swapHistory || []

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Transaction History
                </h1>
                <p className="text-gray-600">
                    Your lease payments, deposits, refunds, and cylinder
                    swaps
                </p>
            </div>

            {error && (
                <Alert type="danger" className="mb-6">
                    Failed to load your transaction history. Please try
                    again later.
                </Alert>
            )}

            {isLoading ? (
                <div className="space-y-3">
                    <Skeleton className="h-14 w-full" />
                    <Skeleton className="h-14 w-full" />
                    <Skeleton className="h-14 w-full" />
                </div>
            ) : (
                <>
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">
                        Leases
                    </h2>
                    {leaseHistory.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-md p-8 text-center mb-8">
                            <p className="text-gray-500">
                                No lease history yet.
                            </p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Cylinder
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Leased
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Returned
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Deposit
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Lease Fee
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {leaseHistory.map((lease) => (
                                            <tr key={lease.id}>
                                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                                                    {lease.cylinder
                                                        ?.cylinderCode}
                                                    <span className="text-gray-500 font-normal">
                                                        {' '}
                                                        (
                                                        {
                                                            lease.cylinder
                                                                ?.type
                                                        }
                                                        )
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                                    {formatDate(
                                                        lease.leaseDate,
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                                    {formatDate(
                                                        lease.actualReturnDate,
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span
                                                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                                            lease.leaseStatus ===
                                                            'overdue'
                                                                ? 'bg-red-100 text-red-800'
                                                                : lease.leaseStatus ===
                                                                    'returned'
                                                                  ? 'bg-gray-100 text-gray-800'
                                                                  : 'bg-green-100 text-green-800'
                                                        }`}
                                                    >
                                                        {lease.leaseStatus}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-gray-600">
                                                    {formatCurrency(
                                                        Number(
                                                            lease.depositAmount,
                                                        ),
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right font-medium text-gray-900">
                                                    {formatCurrency(
                                                        Number(
                                                            lease.leaseAmount,
                                                        ),
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    <h2 className="text-lg font-semibold text-gray-900 mb-3">
                        Cylinder Swaps
                    </h2>
                    {swapHistory.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-md p-8 text-center">
                            <p className="text-gray-500">
                                No cylinder swaps yet.
                            </p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Date
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Old Cylinder
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                New Cylinder
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Condition
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Fee
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {swapHistory.map((swap) => (
                                            <tr key={swap.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                                    {formatDate(
                                                        swap.swapDate,
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                                                    {
                                                        swap.oldCylinder
                                                            ?.cylinderCode
                                                    }
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                                                    {
                                                        swap.newCylinder
                                                            ?.cylinderCode
                                                    }
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-600 capitalize">
                                                    {swap.condition}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right font-medium text-gray-900">
                                                    {formatCurrency(
                                                        swap.swapFee,
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
