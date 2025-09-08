'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    PiPlusDuotone,
    PiEyeDuotone,
    PiArrowLeftDuotone,
    PiDownloadDuotone,
    PiMagnifyingGlassDuotone,
    PiCalendarDuotone,
    PiCurrencyCircleDollarDuotone,
    PiClockDuotone,
    PiWarningDuotone,
    PiTrendUpDuotone,
    PiFunnelDuotone,
    PiDotsThreeVerticalDuotone,
    PiCheckCircleDuotone,
} from 'react-icons/pi'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Container from '@/components/shared/Container'
import DataTable from '@/components/shared/DataTable'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Tag from '@/components/ui/Tag'
import Badge from '@/components/ui/Badge'
import Skeleton from '@/components/ui/Skeleton'
import Dropdown from '@/components/ui/Dropdown'
import { useLeases } from '@/hooks/useLeases'
import type { LeaseRecord } from '@/types/cylinder'
import type { LeaseFilters } from '@/services/api/lease.service'
import { ColumnDef } from '@tanstack/react-table'
import { format, differenceInDays, isAfter, parseISO } from 'date-fns'
import { useSession } from 'next-auth/react'
import DatePicker from '@/components/ui/DatePicker'
import { useOutlets } from '@/hooks/useOutlets'
import useWindowSize from '@/components/ui/hooks/useWindowSize'

const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'returned', label: 'Returned' },
    { value: 'overdue', label: 'Overdue' },
]

const getStatusColor = (status: string) => {
    switch (status) {
        case 'active':
            return {
                color: 'text-blue-700',
                bgColor: 'bg-blue-100',
                borderColor: 'border-blue-200',
                icon: <PiCheckCircleDuotone className="text-blue-600" />,
            }
        case 'returned':
            return {
                color: 'text-green-700',
                bgColor: 'bg-green-100',
                borderColor: 'border-green-200',
                icon: <PiCheckCircleDuotone className="text-green-600" />,
            }
        case 'overdue':
            return {
                color: 'text-red-700',
                bgColor: 'bg-red-100',
                borderColor: 'border-red-200',
                icon: <PiWarningDuotone className="text-red-600" />,
            }
        default:
            return {
                color: 'text-gray-700',
                bgColor: 'bg-gray-100',
                borderColor: 'border-gray-200',
                icon: null,
            }
    }
}

const getLeaseStatus = (lease: LeaseRecord): string => {
    if (lease.leaseStatus === 'returned') return 'returned'
    // Only check for overdue if there's an expected return date
    if (lease.leaseStatus === 'active' && lease.expectedReturnDate) {
        const isOverdue = isAfter(
            new Date(),
            parseISO(lease.expectedReturnDate),
        )
        return isOverdue ? 'overdue' : 'active'
    }
    // If no expected return date, just show as active
    return lease.leaseStatus || 'active'
}

export default function LeasesPage() {
    const router = useRouter()
    const { data: _session } = useSession()
    const { width } = useWindowSize()
    const isMobile = width ? width < 768 : false
    const [showFilters, setShowFilters] = useState(false)
    const [filters, setFilters] = useState<LeaseFilters>({
        page: 1,
        limit: 20, // Changed from pageSize to limit to match API
    })
    const [searchTerm, setSearchTerm] = useState('')
    const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
        null,
        null,
    ])

    const { data: leasesData, isLoading } = useLeases(filters)
    const { data: outletsData } = useOutlets()

    const rawLeases = leasesData?.data || []
    const totalPages = leasesData?.meta?.totalPages || 1
    const outlets = outletsData?.outlets || []

    // Mobile card view component
    const LeaseCard = ({ lease }: { lease: LeaseRecord }) => {
        const status = getLeaseStatus(lease)
        const statusStyle = getStatusColor(status)

        return (
            <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200 p-4">
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <p className="text-sm font-semibold text-gray-900">
                            #{lease.id} -{' '}
                            {lease.cylinder?.cylinderCode || 'N/A'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            {lease.customer?.firstName}{' '}
                            {lease.customer?.lastName}
                        </p>
                    </div>
                    <Tag
                        className={`${statusStyle.color} ${statusStyle.bgColor} ${statusStyle.borderColor} border text-xs`}
                    >
                        {status}
                    </Tag>
                </div>

                <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                        <span className="text-gray-500">Lease Date:</span>
                        <span className="font-medium">
                            {format(new Date(lease.leaseDate), 'MMM dd, yyyy')}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Expected Return:</span>
                        <span
                            className={`font-medium ${status === 'overdue' ? 'text-red-600' : ''}`}
                        >
                            {lease.expectedReturnDate 
                                ? format(new Date(lease.expectedReturnDate), 'MMM dd, yyyy')
                                : 'Not specified'}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Amount:</span>
                        <span className="font-medium">
                            ₦{parseFloat(lease.leaseAmount).toLocaleString()}
                        </span>
                    </div>
                </div>

                <div className="flex gap-2 mt-4 pt-3 border-t">
                    <Button
                        size="sm"
                        variant="plain"
                        icon={<PiEyeDuotone />}
                        onClick={() => router.push(`/admin/leases/${lease.id}`)}
                        className="flex-1"
                    >
                        View Details
                    </Button>
                    {lease.leaseStatus === 'active' && (
                        <Dropdown
                            renderTitle={
                                <Button
                                    size="sm"
                                    variant="plain"
                                    icon={<PiDotsThreeVerticalDuotone />}
                                />
                            }
                        >
                            <Dropdown.Item
                                eventKey="return"
                                onClick={() =>
                                    router.push(
                                        `/admin/leases/return?leaseId=${lease.id}`,
                                    )
                                }
                            >
                                <PiArrowLeftDuotone className="mr-2" />
                                Process Return
                            </Dropdown.Item>
                        </Dropdown>
                    )}
                </div>
            </div>
        )
    }

    // Filter for overdue status on client side if needed
    const leases =
        filters.status === ('overdue' as any)
            ? rawLeases.filter((lease) => getLeaseStatus(lease) === 'overdue')
            : rawLeases

    // Calculate statistics (use raw leases for accurate totals)
    const activeLeases = rawLeases.filter(
        (lease) => getLeaseStatus(lease) === 'active',
    )
    const overdueLeases = rawLeases.filter(
        (lease) => getLeaseStatus(lease) === 'overdue',
    )
    const totalRevenue = rawLeases.reduce(
        (sum, lease) => sum + parseFloat(lease.leaseAmount),
        0,
    )
    const totalDeposits = rawLeases
        .filter((l) => l.leaseStatus === 'active')
        .reduce((sum, lease) => sum + parseFloat(lease.depositAmount), 0)

    const handleSearch = () => {
        setFilters({
            ...filters,
            search: searchTerm,
            fromDate: dateRange[0]
                ? format(dateRange[0], 'yyyy-MM-dd')
                : undefined,
            toDate: dateRange[1]
                ? format(dateRange[1], 'yyyy-MM-dd')
                : undefined,
            page: 1,
        })
    }

    const handleFilterChange = (key: keyof LeaseFilters, value: any) => {
        // Handle overdue filter specially since it's calculated client-side
        if (key === 'status' && value === 'overdue') {
            // For overdue, we'll filter active leases and check dates client-side
            setFilters({ ...filters, status: 'active' as any, page: 1 })
        } else {
            setFilters({ ...filters, [key]: value, page: 1 })
        }
    }

    const handlePageChange = (page: number) => {
        setFilters({ ...filters, page })
    }

    const handleExport = () => {
        // TODO: Implement export functionality
        console.log('Export leases')
    }

    const columns: ColumnDef<LeaseRecord>[] = [
        {
            header: 'Lease ID',
            accessorKey: 'id',
            cell: ({ row }) => (
                <span className="font-medium">#{row.original.id}</span>
            ),
        },
        {
            header: 'Customer',
            accessorKey: 'customer',
            cell: ({ row }) => {
                const customer = row.original.customer
                if (!customer) return 'N/A'
                return (
                    <div>
                        <div className="font-medium">
                            {customer.firstName} {customer.lastName}
                        </div>
                        <div className="text-xs text-gray-500">
                            {customer.email}
                        </div>
                    </div>
                )
            },
        },
        {
            header: 'Cylinder',
            accessorKey: 'cylinder',
            cell: ({ row }) => {
                const cylinder = row.original.cylinder
                if (!cylinder) return 'N/A'
                return (
                    <div>
                        <div className="font-medium">
                            {cylinder.cylinderCode}
                        </div>
                        <div className="text-xs text-gray-500">
                            {cylinder.type}
                        </div>
                    </div>
                )
            },
        },
        {
            header: 'Outlet',
            accessorKey: 'outlet',
            cell: ({ row }) => {
                const outlet = row.original.outlet
                return outlet ? (
                    <span className="text-sm">{outlet.name}</span>
                ) : (
                    <span className="text-gray-400">N/A</span>
                )
            },
        },
        {
            header: 'Staff',
            accessorKey: 'staff',
            cell: ({ row }) => {
                const staff = row.original.staff
                return staff ? (
                    <div className="text-sm">
                        <div>
                            {staff.firstName} {staff.lastName}
                        </div>
                    </div>
                ) : (
                    <span className="text-gray-400">N/A</span>
                )
            },
        },
        {
            header: 'Lease Date',
            accessorKey: 'leaseDate',
            cell: ({ row }) =>
                format(new Date(row.original.leaseDate), 'MMM dd, yyyy'),
        },
        {
            header: 'Expected Return',
            accessorKey: 'expectedReturnDate',
            cell: ({ row }) => {
                const expectedDate = row.original.expectedReturnDate
                const actualDate = row.original.actualReturnDate
                const status = getLeaseStatus(row.original)

                if (actualDate) {
                    return (
                        <div>
                            <div className="text-sm text-green-600">
                                Returned:{' '}
                                {format(new Date(actualDate), 'MMM dd, yyyy')}
                            </div>
                            {expectedDate && (
                                <div className="text-xs text-gray-500">
                                    Expected:{' '}
                                    {format(new Date(expectedDate), 'MMM dd, yyyy')}
                                </div>
                            )}
                        </div>
                    )
                }

                if (!expectedDate) {
                    return <span className="text-gray-400">Not specified</span>
                }

                return (
                    <div className={status === 'overdue' ? 'text-red-600' : ''}>
                        {format(new Date(expectedDate), 'MMM dd, yyyy')}
                        {status === 'overdue' && (
                            <div className="text-xs">
                                {differenceInDays(
                                    new Date(),
                                    new Date(expectedDate),
                                )}{' '}
                                days overdue
                            </div>
                        )}
                    </div>
                )
            },
        },
        {
            header: 'Amount',
            accessorKey: 'leaseAmount',
            cell: ({ row }) => {
                const lease = row.original
                return (
                    <div>
                        <div>
                            ₦{parseFloat(lease.leaseAmount).toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">
                            Deposit: ₦
                            {parseFloat(lease.depositAmount).toLocaleString()}
                        </div>
                        {lease.refundAmount && (
                            <div className="text-xs text-green-600">
                                Refunded: ₦
                                {parseFloat(
                                    lease.refundAmount,
                                ).toLocaleString()}
                            </div>
                        )}
                    </div>
                )
            },
        },
        {
            header: 'Status',
            accessorKey: 'leaseStatus',
            cell: ({ row }) => {
                const status = getLeaseStatus(row.original)
                const statusStyle = getStatusColor(status)
                return (
                    <div className="flex items-center gap-1">
                        {statusStyle.icon}
                        <Tag
                            className={`${statusStyle.color} ${statusStyle.bgColor} ${statusStyle.borderColor} border capitalize`}
                        >
                            {status}
                        </Tag>
                    </div>
                )
            },
        },
        {
            header: '',
            id: 'actions',
            cell: ({ row }) => {
                const lease = row.original
                return (
                    <div className="flex gap-2 justify-end">
                        <Button
                            size="sm"
                            variant="plain"
                            icon={<PiEyeDuotone />}
                            onClick={() =>
                                router.push(`/admin/leases/${lease.id}`)
                            }
                        >
                            View
                        </Button>
                        {lease.leaseStatus === 'active' && (
                            <Button
                                size="sm"
                                variant="plain"
                                icon={<PiArrowLeftDuotone />}
                                onClick={() =>
                                    router.push(
                                        `/admin/leases/return?leaseId=${lease.id}`,
                                    )
                                }
                            >
                                Return
                            </Button>
                        )}
                    </div>
                )
            },
        },
    ]

    const outletOptions = [
        { value: '', label: 'All Outlets' },
        ...outlets.map((outlet) => ({
            value: outlet.id.toString(),
            label: outlet.name,
        })),
    ]

    return (
        <Container>
            <div className="mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
                            Lease Management
                        </h3>
                        <p className="text-sm text-gray-500">
                            Manage all cylinder leases across outlets
                        </p>
                    </div>
                    {!isMobile && (
                        <Button
                            variant="solid"
                            icon={<PiPlusDuotone />}
                            onClick={() => router.push('/admin/leases/new')}
                            size="md"
                        >
                            New Lease
                        </Button>
                    )}
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
                <AdaptiveCard className="hover:shadow-lg transition-shadow duration-200">
                    <div className="p-4 md:p-5">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-xs md:text-sm font-medium text-gray-600">
                                Active Leases
                            </p>
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <PiCalendarDuotone className="text-lg md:text-xl text-blue-600" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xl md:text-2xl font-bold text-gray-900">
                                {isLoading ? (
                                    <Skeleton className="w-16 h-7" />
                                ) : (
                                    activeLeases.length
                                )}
                            </p>
                            <p className="text-xs text-gray-500">
                                Currently leased
                            </p>
                            {!isLoading && (
                                <div className="flex items-center gap-1 text-xs">
                                    <PiTrendUpDuotone className="text-green-500" />
                                    <span className="text-green-600">+12%</span>
                                    <span className="text-gray-400">
                                        vs last month
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </AdaptiveCard>

                <AdaptiveCard className="hover:shadow-lg transition-shadow duration-200">
                    <div className="p-4 md:p-5">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-xs md:text-sm font-medium text-gray-600">
                                Overdue
                            </p>
                            <div className="p-2 bg-red-50 rounded-lg">
                                <PiWarningDuotone className="text-lg md:text-xl text-red-600" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xl md:text-2xl font-bold text-red-600">
                                {isLoading ? (
                                    <Skeleton className="w-16 h-7" />
                                ) : (
                                    overdueLeases.length
                                )}
                            </p>
                            <p className="text-xs text-gray-500">
                                Require attention
                            </p>
                            {!isLoading && overdueLeases.length > 0 && (
                                <div className="flex items-center gap-1 text-xs">
                                    <PiWarningDuotone className="text-orange-500" />
                                    <span className="text-orange-600">
                                        Action needed
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </AdaptiveCard>

                <AdaptiveCard className="hover:shadow-lg transition-shadow duration-200 col-span-2 md:col-span-1">
                    <div className="p-4 md:p-5">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-xs md:text-sm font-medium text-gray-600">
                                Total Revenue
                            </p>
                            <div className="p-2 bg-green-50 rounded-lg">
                                <PiCurrencyCircleDollarDuotone className="text-lg md:text-xl text-green-600" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xl md:text-2xl font-bold text-gray-900">
                                {isLoading ? (
                                    <Skeleton className="w-24 h-7" />
                                ) : (
                                    `₦${totalRevenue.toLocaleString()}`
                                )}
                            </p>
                            <p className="text-xs text-gray-500">
                                From lease fees
                            </p>
                            {!isLoading && (
                                <div className="flex items-center gap-1 text-xs">
                                    <PiTrendUpDuotone className="text-green-500" />
                                    <span className="text-green-600">+18%</span>
                                    <span className="text-gray-400">
                                        vs last month
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </AdaptiveCard>

                <AdaptiveCard className="hover:shadow-lg transition-shadow duration-200 col-span-2 md:col-span-1">
                    <div className="p-4 md:p-5">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-xs md:text-sm font-medium text-gray-600">
                                Total Deposits
                            </p>
                            <div className="p-2 bg-purple-50 rounded-lg">
                                <PiClockDuotone className="text-lg md:text-xl text-purple-600" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xl md:text-2xl font-bold text-gray-900">
                                {isLoading ? (
                                    <Skeleton className="w-24 h-7" />
                                ) : (
                                    `₦${totalDeposits.toLocaleString()}`
                                )}
                            </p>
                            <p className="text-xs text-gray-500">
                                Held deposits
                            </p>
                            {!isLoading && (
                                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                                    <div
                                        className="bg-purple-600 h-1.5 rounded-full"
                                        style={{ width: '65%' }}
                                    ></div>
                                </div>
                            )}
                        </div>
                    </div>
                </AdaptiveCard>
            </div>

            {/* Search and Filters */}
            <AdaptiveCard className="mb-6">
                <div className="p-4 md:p-6">
                    {/* Mobile Filter Toggle */}
                    {isMobile && (
                        <Button
                            variant="plain"
                            icon={<PiFunnelDuotone />}
                            onClick={() => setShowFilters(!showFilters)}
                            className="mb-3 w-full justify-center"
                        >
                            {showFilters ? 'Hide Filters' : 'Show Filters'}
                            {(filters.status ||
                                filters.outletId ||
                                dateRange[0]) && (
                                <Badge content="Active" className="ml-2" />
                            )}
                        </Button>
                    )}

                    <div
                        className={`${isMobile && !showFilters ? 'hidden' : ''} space-y-4`}
                    >
                        {/* Search Bar */}
                        <div className="flex flex-col md:flex-row gap-3">
                            <div className="flex-1">
                                <Input
                                    placeholder="Search by customer, cylinder..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    onKeyDown={(e) =>
                                        e.key === 'Enter' && handleSearch()
                                    }
                                    prefix={
                                        <PiMagnifyingGlassDuotone className="text-lg" />
                                    }
                                    className="w-full"
                                />
                            </div>
                            <DatePicker.DatePickerRange
                                placeholder="Select date range"
                                value={dateRange}
                                onChange={setDateRange}
                                className="w-full md:w-auto md:min-w-[240px]"
                            />
                            <Button
                                onClick={handleSearch}
                                variant="solid"
                                className="w-full md:w-auto"
                                icon={<PiMagnifyingGlassDuotone />}
                            >
                                Search
                            </Button>
                        </div>

                        {/* Filter Options */}
                        <div className="flex flex-col md:flex-row gap-3 pt-3 border-t">
                            <div className="flex-1 flex flex-col md:flex-row gap-3">
                                <Select
                                    placeholder="Filter by status"
                                    options={statusOptions}
                                    value={statusOptions.find(
                                        (opt) =>
                                            opt.value ===
                                            (filters.status || ''),
                                    )}
                                    onChange={(option) =>
                                        handleFilterChange(
                                            'status',
                                            option?.value || undefined,
                                        )
                                    }
                                    className="w-full md:w-40"
                                />
                                <Select
                                    placeholder="Filter by outlet"
                                    options={outletOptions}
                                    value={outletOptions.find(
                                        (opt) =>
                                            opt.value ===
                                            (filters.outletId?.toString() ||
                                                ''),
                                    )}
                                    onChange={(option) =>
                                        handleFilterChange(
                                            'outletId',
                                            option?.value
                                                ? parseInt(option.value)
                                                : undefined,
                                        )
                                    }
                                    className="w-full md:w-40"
                                />
                            </div>
                            <div className="flex gap-3">
                                {(filters.status ||
                                    filters.outletId ||
                                    dateRange[0]) && (
                                    <Button
                                        variant="plain"
                                        size="sm"
                                        onClick={() => {
                                            setFilters({ page: 1, limit: 20 })
                                            setSearchTerm('')
                                            setDateRange([null, null])
                                        }}
                                    >
                                        Clear All
                                    </Button>
                                )}
                                <Button
                                    variant="plain"
                                    icon={<PiDownloadDuotone />}
                                    onClick={handleExport}
                                    className="w-full md:w-auto"
                                >
                                    Export
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </AdaptiveCard>

            {/* Desktop Table View */}
            {!isMobile ? (
                <AdaptiveCard>
                    <DataTable
                        columns={columns}
                        data={leases}
                        loading={isLoading}
                        onPaginationChange={(page) =>
                            handlePageChange(page)
                        }
                        pagingData={{
                            total: leasesData?.meta?.total || 0,
                            pageIndex: filters.page!,  // Pass 1-based directly - DataTable uses 1-based
                            pageSize: filters.limit || 20,
                        }}
                    />
                </AdaptiveCard>
            ) : (
                /* Mobile Card View */
                <div className="space-y-4">
                    {isLoading ? (
                        // Loading skeleton for mobile
                        Array.from({ length: 5 }).map((_, index) => (
                            <AdaptiveCard key={index}>
                                <div className="p-4 space-y-3">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-3 w-1/2" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-3 w-full" />
                                        <Skeleton className="h-3 w-full" />
                                    </div>
                                    <Skeleton className="h-8 w-full" />
                                </div>
                            </AdaptiveCard>
                        ))
                    ) : leases.length > 0 ? (
                        leases.map((lease) => (
                            <LeaseCard key={lease.id} lease={lease} />
                        ))
                    ) : (
                        // Empty state
                        <AdaptiveCard>
                            <div className="text-center py-12">
                                <PiCalendarDuotone className="text-6xl text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 mb-2">
                                    No leases found
                                </p>
                                <p className="text-sm text-gray-400">
                                    Try adjusting your filters or search
                                    criteria
                                </p>
                                <Button
                                    variant="solid"
                                    icon={<PiPlusDuotone />}
                                    onClick={() =>
                                        router.push('/admin/leases/new')
                                    }
                                    className="mt-4"
                                >
                                    Create New Lease
                                </Button>
                            </div>
                        </AdaptiveCard>
                    )}

                    {/* Mobile Pagination */}
                    {leases.length > 0 && (
                        <div className="flex justify-between items-center p-4 bg-white rounded-lg shadow-sm">
                            <Button
                                variant="plain"
                                size="sm"
                                onClick={() =>
                                    handlePageChange(filters.page! - 1)
                                }
                                disabled={filters.page === 1}
                            >
                                Previous
                            </Button>
                            <span className="text-sm text-gray-600">
                                Page {filters.page} of {totalPages}
                            </span>
                            <Button
                                variant="plain"
                                size="sm"
                                onClick={() =>
                                    handlePageChange(filters.page! + 1)
                                }
                                disabled={filters.page === totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {/* Floating Action Button for Mobile */}
            {isMobile && (
                <div className="fixed bottom-6 right-6 z-50">
                    <Button
                        variant="solid"
                        size="lg"
                        className="rounded-full shadow-lg w-14 h-14 p-0"
                        onClick={() => router.push('/admin/leases/new')}
                    >
                        <PiPlusDuotone className="text-2xl" />
                    </Button>
                </div>
            )}
        </Container>
    )
}
