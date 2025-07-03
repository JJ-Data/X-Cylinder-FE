'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
    ArrowLeft,
    Edit,
    Ban,
    CheckCircle,
    Package,
    Receipt,
} from 'lucide-react'
import {
    useCustomer,
    useCustomerLeaseHistory,
    useCustomerTransactions,
    useCustomerMutations,
} from '@/hooks/useCustomers'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { Alert } from '@/components/ui/Alert'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { formatDate, formatCurrency } from '@/utils/format'
import type { LeaseRecord as Lease } from '@/types/cylinder'
import type { Transaction } from '@/types/transaction'

export default function CustomerDetailsPage() {
    const params = useParams()
    const customerId = Number(params.id)

    const { data: customer, error, isLoading } = useCustomer(customerId)
    const { data: leaseHistory } = useCustomerLeaseHistory(customerId)
    const { data: transactions } = useCustomerTransactions(customerId)
    const { blockCustomer, unblockCustomer } = useCustomerMutations()

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Alert type="danger">
                    Failed to load customer details. Please try again.
                </Alert>
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <Skeleton className="h-8 w-64 mb-8" />
                    <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-6 w-1/2" />
                    </div>
                </div>
            </div>
        )
    }

    if (!customer) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Alert type="warning">Customer not found.</Alert>
            </div>
        )
    }

    const leaseColumns: Column<Lease>[] = [
        {
            key: 'leaseDate',
            header: 'Date',
            cell: (lease) => formatDate(lease.leaseDate),
        },
        {
            key: 'cylinder.cylinderCode',
            header: 'Cylinder',
            cell: (lease) =>
                `${lease.cylinder?.cylinderCode} (${lease.cylinder?.type})`,
        },
        {
            key: 'leaseAmount',
            header: 'Amount',
            cell: (lease) =>
                formatCurrency(lease.leaseAmount as unknown as number),
        },
        {
            key: 'status',
            header: 'Status',
            cell: (lease) => (
                <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        lease.leaseStatus === 'active'
                            ? 'bg-green-100 text-green-800'
                            : lease.leaseStatus === 'returned'
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-red-100 text-red-800'
                    }`}
                >
                    {lease.leaseStatus}
                </span>
            ),
        },
        {
            key: 'returnDate',
            header: 'Return Date',
            cell: (lease) =>
                lease.actualReturnDate
                    ? formatDate(lease.actualReturnDate)
                    : '-',
        },
    ]

    const transactionColumns: Column<Transaction>[] = [
        {
            key: 'transactionDate',
            header: 'Date',
            cell: (transaction) => formatDate(transaction.transactionDate),
        },
        {
            key: 'type',
            header: 'Type',
            cell: (transaction) => transaction.type,
        },
        {
            key: 'description',
            header: 'Description',
            cell: (transaction) => transaction.description,
        },
        {
            key: 'amount',
            header: 'Amount',
            cell: (transaction) => (
                <span
                    className={
                        transaction.type === 'CREDIT'
                            ? 'text-green-600'
                            : 'text-red-600'
                    }
                >
                    {transaction.type === 'CREDIT' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                </span>
            ),
        },
        {
            key: 'paymentMethod',
            header: 'Payment Method',
            cell: (transaction) => transaction.paymentMethod,
        },
    ]

    const handleToggleBlock = async () => {
        try {
            if (customer.status === 'blocked') {
                await unblockCustomer(customer.id)
            } else {
                const reason = prompt(
                    'Please provide a reason for blocking this customer:',
                )
                if (reason) {
                    await blockCustomer(customer.id, reason)
                }
            }
        } catch (error) {
            console.error('Failed to update customer status:', error)
        }
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/staff/customers"
                        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Customers
                    </Link>

                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                {customer.user.firstName}{' '}
                                {customer.user.lastName}
                            </h1>
                            <div className="flex items-center space-x-4">
                                <span
                                    className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                                        customer.status === 'active'
                                            ? 'bg-green-100 text-green-800'
                                            : customer.status === 'blocked'
                                              ? 'bg-red-100 text-red-800'
                                              : 'bg-gray-100 text-gray-800'
                                    }`}
                                >
                                    {customer.status}
                                </span>
                                <span className="text-gray-600">
                                    Customer ID: #{customer.id}
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                variant="plain"
                                size="sm"
                                icon={
                                    customer.status === 'blocked' ? (
                                        <CheckCircle className="h-4 w-4" />
                                    ) : (
                                        <Ban className="h-4 w-4" />
                                    )
                                }
                                onClick={handleToggleBlock}
                            >
                                {customer.status === 'blocked'
                                    ? 'Unblock'
                                    : 'Block'}{' '}
                                Customer
                            </Button>
                            <Link href={`/staff/customers/${customer.id}/edit`}>
                                <Button
                                    variant="plain"
                                    size="sm"
                                    icon={<Edit className="h-4 w-4" />}
                                >
                                    Edit
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Contact Information */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Contact Information
                        </h2>
                        <dl className="space-y-3">
                            <div>
                                <dt className="text-sm font-medium text-gray-500">
                                    Phone
                                </dt>
                                <dd className="text-sm text-gray-900">
                                    {customer.user.phone}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">
                                    Email
                                </dt>
                                <dd className="text-sm text-gray-900">
                                    {customer.user.email}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">
                                    Address
                                </dt>
                                <dd className="text-sm text-gray-900">
                                    {customer.address}
                                    <br />
                                    {customer.city}, {customer.state}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">
                                    Registered
                                </dt>
                                <dd className="text-sm text-gray-900">
                                    {formatDate(customer.createdAt)}
                                </dd>
                            </div>
                        </dl>
                    </div>

                    {/* Lease Statistics */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Lease Statistics
                        </h2>
                        <dl className="space-y-3">
                            <div>
                                <dt className="text-sm font-medium text-gray-500">
                                    Active Leases
                                </dt>
                                <dd className="text-2xl font-bold text-green-600">
                                    {customer.activeLeases || 0}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">
                                    Total Leases
                                </dt>
                                <dd className="text-sm text-gray-900">
                                    {customer.totalLeases || 0}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">
                                    Total Spent
                                </dt>
                                <dd className="text-sm text-gray-900">
                                    {formatCurrency(customer.totalSpent || 0)}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">
                                    Average Lease Duration
                                </dt>
                                <dd className="text-sm text-gray-900">
                                    28 days
                                </dd>
                            </div>
                        </dl>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Quick Actions
                        </h2>
                        <div className="space-y-3">
                            <Link
                                href={`/staff/leasing/new?customerId=${customer.id}`}
                                className="block w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                            >
                                <div className="flex items-center">
                                    <Package className="h-5 w-5 text-blue-600 mr-3" />
                                    <div>
                                        <div className="font-medium text-blue-900">
                                            New Lease
                                        </div>
                                        <div className="text-sm text-blue-700">
                                            Create a new cylinder lease
                                        </div>
                                    </div>
                                </div>
                            </Link>
                            <Link
                                href={`/staff/transactions/new?customerId=${customer.id}`}
                                className="block w-full text-left px-4 py-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                            >
                                <div className="flex items-center">
                                    <Receipt className="h-5 w-5 text-green-600 mr-3" />
                                    <div>
                                        <div className="font-medium text-green-900">
                                            Add Payment
                                        </div>
                                        <div className="text-sm text-green-700">
                                            Record a payment
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* History Tabs */}
                <div className="bg-white rounded-lg shadow-sm">
                    <div className="border-b border-gray-200">
                        <nav className="flex -mb-px">
                            <button className="px-6 py-3 border-b-2 border-blue-500 text-blue-600 font-medium">
                                Lease History
                            </button>
                            <button className="px-6 py-3 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium">
                                Transaction History
                            </button>
                        </nav>
                    </div>

                    <div className="p-6">
                        <DataTable
                            data={leaseHistory || []}
                            columns={leaseColumns}
                            keyExtractor={(lease) => lease.id}
                            emptyMessage="No lease history"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
