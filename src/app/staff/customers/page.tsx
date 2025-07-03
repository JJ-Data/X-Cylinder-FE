'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Eye, Edit, Phone, Mail, Package } from 'lucide-react'
import Link from 'next/link'
import { useCustomers } from '@/hooks/useCustomers'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { SearchInput } from '@/components/ui/SearchInput'
import {
    FilterDropdown,
    type FilterOption,
} from '@/components/ui/FilterDropdown'
import Button from '@/components/ui/Button'
import { formatDate } from '@/utils/format'
import type { Customer } from '@/types/customer'

const statusOptions: FilterOption[] = [
    { value: '', label: 'All Customers' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'blocked', label: 'Blocked' },
]

export default function CustomersPage() {
    const router = useRouter()
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [page, setPage] = useState(1)

    // Build filters
    const filters = {
        searchTerm: search,
        paymentStatus: statusFilter as 'pending' | 'active' | 'inactive' | undefined,
        page,
        limit: 20,
    }

    const { data, error, isLoading } = useCustomers(filters)

    const columns: Column<Customer>[] = [
        {
            key: 'user.firstName',
            header: 'Customer',
            cell: (customer) => (
                <div>
                    <div className="font-medium text-gray-900">
                        {customer.user.firstName} {customer.user.lastName}
                    </div>
                    <div className="text-sm text-gray-500">
                        ID: {customer.id}
                    </div>
                </div>
            ),
        },
        {
            key: 'user.phone',
            header: 'Contact',
            cell: (customer) => (
                <div className="space-y-1">
                    <div className="flex items-center text-sm">
                        <Phone className="h-3 w-3 mr-1 text-gray-400" />
                        {customer.user.phone}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                        <Mail className="h-3 w-3 mr-1 text-gray-400" />
                        {customer.user.email}
                    </div>
                </div>
            ),
        },
        {
            key: 'address',
            header: 'Address',
            cell: (customer) => (
                <div className="text-sm">
                    <div>{customer.address}</div>
                    <div className="text-gray-500">
                        {customer.city}, {customer.state}
                    </div>
                </div>
            ),
        },
        {
            key: 'activeLeases',
            header: 'Active Leases',
            cell: (customer) => (
                <div className="flex items-center">
                    <Package className="h-4 w-4 mr-1 text-gray-400" />
                    <span
                        className={
                            customer.activeLeases > 0
                                ? 'font-medium text-green-600'
                                : 'text-gray-500'
                        }
                    >
                        {customer.activeLeases || 0}
                    </span>
                </div>
            ),
        },
        {
            key: 'totalLeases',
            header: 'Total Leases',
            cell: (customer) => customer.totalLeases || 0,
        },
        {
            key: 'registeredAt',
            header: 'Registered',
            cell: (customer) => formatDate(customer.createdAt),
        },
        {
            key: 'status',
            header: 'Status',
            cell: (customer) => {
                const statusColors = {
                    active: 'bg-green-100 text-green-800',
                    inactive: 'bg-gray-100 text-gray-800',
                    blocked: 'bg-red-100 text-red-800',
                }

                return (
                    <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            statusColors[customer.status] || statusColors.active
                        }`}
                    >
                        {customer.status || 'Active'}
                    </span>
                )
            },
        },
        {
            key: 'actions',
            header: 'Actions',
            headerClassName: 'text-right',
            className: 'text-right',
            cell: (customer) => (
                <div className="flex items-center justify-end space-x-2">
                    <Link
                        href={`/staff/customers/${customer.id}`}
                        className="text-gray-400 hover:text-gray-500"
                    >
                        <Eye className="h-5 w-5" />
                    </Link>
                    <Link
                        href={`/staff/customers/${customer.id}/edit`}
                        className="text-gray-400 hover:text-gray-500"
                    >
                        <Edit className="h-5 w-5" />
                    </Link>
                </div>
            ),
        },
    ]

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Customer Management
                </h1>
                <p className="text-gray-600">
                    View and manage customer information
                </p>
            </div>

            {/* Filters and Actions */}
            <div className="mb-6 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <SearchInput
                        value={search}
                        onChange={setSearch}
                        placeholder="Search by name, phone, email, or address..."
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
                        {data?.meta?.total || 0} customers found
                    </div>
                    <Link href="/staff/customers/register">
                        <Button
                            variant="solid"
                            size="sm"
                            icon={<Plus className="h-4 w-4" />}
                        >
                            Register Customer
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Data Table */}
            <DataTable
                data={data?.data || []}
                columns={columns}
                keyExtractor={(customer) => customer.id}
                loading={isLoading}
                error={error}
                emptyMessage="No customers found"
                currentPage={page}
                totalPages={data?.meta?.totalPages || 1}
                onPageChange={setPage}
                pageSize={20}
                totalItems={data?.meta?.total || 0}
                onRowClick={(customer) =>
                    router.push(`/staff/customers/${customer.id}`)
                }
            />
        </div>
    )
}
