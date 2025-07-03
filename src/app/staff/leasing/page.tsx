'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Eye, Package2, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useLeases, useOverdueLeases } from '@/hooks/useLeases'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { SearchInput } from '@/components/ui/SearchInput'
import {
    FilterDropdown,
    type FilterOption,
} from '@/components/ui/FilterDropdown'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { formatDate, formatCurrency } from '@/utils/format'
import { LeaseStatus } from '@/types/cylinder'
import type { LeaseRecord } from '@/types/cylinder'
import { useSession } from 'next-auth/react'

const statusOptions: FilterOption[] = [
    { value: '', label: 'All Statuses' },
    { value: LeaseStatus.ACTIVE, label: 'Active' },
    { value: LeaseStatus.RETURNED, label: 'Returned' },
    { value: LeaseStatus.OVERDUE, label: 'Overdue' },
]

export default function LeasingPage() {
    const router = useRouter()
    const { data: session } = useSession()
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [page, setPage] = useState(1)

    const outletId = session?.user?.outletId
        ? parseInt(session.user.outletId)
        : undefined

    // Build filters
    const filters = {
        search,
        status: (statusFilter as LeaseStatus) || undefined,
        outletId,
        page,
        limit: 20,
    }

    const { data, error, isLoading } = useLeases(filters)
    const { data: overdueLeases } = useOverdueLeases(outletId)

    const columns: Column<LeaseRecord>[] = [
        {
            key: 'id',
            header: 'Lease ID',
            cell: (lease) => (
                <div className="font-medium text-gray-900">#{lease.id}</div>
            ),
        },
        {
            key: 'customer.user.firstName',
            header: 'Customer',
            cell: (lease) => (
                <div>
                    <div className="font-medium text-gray-900">
                        {lease.customer?.firstName} {lease.customer?.lastName}
                    </div>
                    <div className="text-sm text-gray-500">
                        {lease.customer?.email}
                    </div>
                </div>
            ),
        },
        {
            key: 'cylinder.code',
            header: 'Cylinder',
            cell: (lease) => (
                <div>
                    <div className="font-medium">
                        {lease.cylinder?.cylinderCode}
                    </div>
                    <div className="text-sm text-gray-500">
                        {lease.cylinder?.type}
                    </div>
                </div>
            ),
        },
        {
            key: 'leaseDate',
            header: 'Lease Date',
            cell: (lease) => formatDate(lease.leaseDate),
        },
        {
            key: 'expectedReturnDate',
            header: 'Expected Return',
            cell: (lease) => {
                const returnDate = new Date(lease.expectedReturnDate)
                const today = new Date()
                const isOverdue =
                    today > returnDate &&
                    lease.leaseStatus === LeaseStatus.ACTIVE

                return (
                    <div
                        className={isOverdue ? 'text-red-600 font-medium' : ''}
                    >
                        {formatDate(lease.expectedReturnDate)}
                    </div>
                )
            },
        },
        {
            key: 'status',
            header: 'Status',
            cell: (lease) => {
                const statusColors = {
                    [LeaseStatus.ACTIVE]: 'bg-green-100 text-green-800',
                    [LeaseStatus.RETURNED]: 'bg-gray-100 text-gray-800',
                    [LeaseStatus.OVERDUE]: 'bg-red-100 text-red-800',
                }

                return (
                    <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[lease.leaseStatus]}`}
                    >
                        {lease.leaseStatus}
                    </span>
                )
            },
        },
        {
            key: 'leaseAmount',
            header: 'Amount',
            cell: (lease) => formatCurrency(parseFloat(lease.leaseAmount)),
        },
        {
            key: 'actions',
            header: 'Actions',
            headerClassName: 'text-right',
            className: 'text-right',
            cell: (lease) => (
                <div className="flex items-center justify-end space-x-2">
                    <Link
                        href={`/staff/leasing/${lease.id}`}
                        className="text-gray-400 hover:text-gray-500"
                    >
                        <Eye className="h-5 w-5" />
                    </Link>
                    {lease.leaseStatus === LeaseStatus.ACTIVE && (
                        <Link
                            href={`/staff/leasing/returns?leaseId=${lease.id}`}
                            className="text-gray-400 hover:text-gray-500"
                        >
                            <Package2 className="h-5 w-5" />
                        </Link>
                    )}
                </div>
            ),
        },
    ]

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Lease Management
                </h1>
                <p className="text-gray-600">
                    Manage cylinder leases and returns
                </p>
            </div>

            {/* Overdue Alert */}
            {overdueLeases && overdueLeases.length > 0 && (
                <Alert type="warning" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <span>
                        You have {overdueLeases.length} overdue lease
                        {overdueLeases.length > 1 ? 's' : ''} that need
                        attention.
                    </span>
                    <Link
                        href="/staff/leasing?status=OVERDUE"
                        className="ml-2 underline"
                    >
                        View overdue leases
                    </Link>
                </Alert>
            )}

            {/* Filters and Actions */}
            <div className="mb-6 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <SearchInput
                        value={search}
                        onChange={setSearch}
                        placeholder="Search by customer name, phone, or cylinder code..."
                        className="flex-1"
                    />
                    <FilterDropdown
                        label="Status"
                        options={statusOptions}
                        value={statusFilter}
                        onChange={(value) => setStatusFilter(value as string)}
                        className="w-full sm:w-48"
                    />
                </div>

                <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                        {data?.meta?.total || 0} leases found
                    </div>
                    <div className="flex gap-2">
                        <Link href="/staff/leasing/returns">
                            <Button
                                variant="plain"
                                size="sm"
                                icon={<Package2 className="h-4 w-4" />}
                            >
                                Process Return
                            </Button>
                        </Link>
                        <Link href="/staff/leasing/new">
                            <Button
                                variant="solid"
                                size="sm"
                                icon={<Plus className="h-4 w-4" />}
                            >
                                New Lease
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <DataTable
                data={data?.data || []}
                columns={columns}
                keyExtractor={(lease) => lease.id}
                loading={isLoading}
                error={error}
                emptyMessage="No leases found"
                currentPage={page}
                totalPages={data?.meta?.totalPages || 1}
                onPageChange={setPage}
                pageSize={20}
                totalItems={data?.meta?.total || 0}
                onRowClick={(lease) =>
                    router.push(`/staff/leasing/${lease.id}`)
                }
            />
        </div>
    )
}
