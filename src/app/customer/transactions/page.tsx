'use client'

import { useSession } from 'next-auth/react'
import { useCustomerTransactions } from '@/hooks/useCustomers'
import { Skeleton } from '@/components/ui/Skeleton'
import { Alert } from '@/components/ui/Alert'
import { formatDate, formatCurrency } from '@/utils/format'

export default function CustomerTransactionsPage() {
    const { data: session } = useSession()
    const customerId = session?.user?.id
        ? parseInt(session.user.id)
        : undefined

    const {
        data: transactions,
        error,
        isLoading,
    } = useCustomerTransactions(customerId)

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Transaction History
                </h1>
                <p className="text-gray-600">
                    Your lease payments, deposits, and refunds
                </p>
            </div>

            {error && (
                <Alert type="danger" className="mb-6">
                    Failed to load your transactions. Please try again later.
                </Alert>
            )}

            {isLoading ? (
                <div className="space-y-3">
                    <Skeleton className="h-14 w-full" />
                    <Skeleton className="h-14 w-full" />
                    <Skeleton className="h-14 w-full" />
                </div>
            ) : !transactions || transactions.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <p className="text-gray-500">No transactions yet.</p>
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
                                        Description
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Payment Method
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Amount
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {transactions.map((transaction: any) => (
                                    <tr key={transaction.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                            {formatDate(
                                                transaction.transactionDate,
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-gray-900">
                                            {transaction.description}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                            {transaction.paymentMethod}
                                        </td>
                                        <td
                                            className={`px-6 py-4 whitespace-nowrap text-right font-medium ${
                                                transaction.type === 'CREDIT'
                                                    ? 'text-green-600'
                                                    : 'text-red-600'
                                            }`}
                                        >
                                            {transaction.type === 'CREDIT'
                                                ? '+'
                                                : '-'}
                                            {formatCurrency(
                                                transaction.amount,
                                            )}
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
