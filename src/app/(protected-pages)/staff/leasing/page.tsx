'use client'

import { useState, useMemo } from 'react'
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
    PiReceiptDuotone,
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
import { useAuthStore } from '@/stores'
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

export default function StaffLeasingPage() {
    const router = useRouter()
    const { data: session } = useSession()
    const { outletId } = useAuthStore()
    const { width } = useWindowSize()
    const isMobile = width ? width < 768 : false
    const [showFilters, setShowFilters] = useState(false)
    const [filters, setFilters] = useState<LeaseFilters>({
        page: 1,
        limit: 20,
        outletId: outletId ? parseInt(outletId) : undefined,
    })
    const [searchTerm, setSearchTerm] = useState('')
    const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
        null,
        null,
    ])

    const { data: leasesData, isLoading } = useLeases(filters)

    const rawLeases = leasesData?.data || []
    const totalPages = leasesData?.meta?.totalPages || 1

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
                        <span className="font-medium">
                            {lease.expectedReturnDate
                                ? format(
                                      new Date(lease.expectedReturnDate),
                                      'MMM dd, yyyy',
                                  )
                                : 'Not specified'}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Deposit:</span>
                        <span className="font-medium">
                            ₦{parseFloat(lease.depositAmount).toLocaleString()}
                        </span>
                    </div>
                </div>

                <div className="flex gap-2 mt-4 pt-3 border-t">
                    <Button
                        size="sm"
                        variant="solid"
                        className="flex-1"
                        icon={<PiEyeDuotone />}
                        onClick={() => router.push(`/staff/leasing/${lease.id}`)}
                    >
                        View
                    </Button>
                    {lease.leaseStatus === 'active' && (
                        <Button
                            size="sm"
                            variant="plain"
                            className="flex-1"
                            icon={<PiArrowLeftDuotone />}
                            onClick={() =>
                                router.push(
                                    `/staff/leasing/returns?leaseId=${lease.id}`,
                                )
                            }
                        >
                            Return
                        </Button>
                    )}
                    {lease.leaseStatus === 'returned' && (
                        <Button
                            size="sm"
                            variant="plain"
                            className="flex-1"
                            icon={<PiReceiptDuotone />}
                            onClick={() =>
                                router.push(
                                    `/staff/leasing/${lease.id}/receipt`,
                                )
                            }
                        >
                            Receipt
                        </Button>
                    )}
                </div>
            </div>
        )
    }

    // Filter for overdue status on client side if needed
    const leases = useMemo(() => {
        if (filters.status === ('overdue' as any)) {
            return rawLeases.filter((lease) => getLeaseStatus(lease) === 'overdue')
        }
        return rawLeases
    }, [rawLeases, filters.status])

    // Calculate statistics (use raw leases for accurate totals)
    const statistics = useMemo(() => {
        const activeLeases = rawLeases.filter(
            (lease) => getLeaseStatus(lease) === 'active',
        )
        const overdueLeases = rawLeases.filter(
            (lease) => getLeaseStatus(lease) === 'overdue',
        )
        const returnedLeases = rawLeases.filter(
            (lease) => lease.leaseStatus === 'returned',
        )
        const totalRevenue = rawLeases.reduce(
            (sum, lease) => sum + parseFloat(lease.leaseAmount),
            0,
        )
        const totalDeposits = rawLeases
            .filter((l) => l.leaseStatus === 'active')
            .reduce((sum, lease) => sum + parseFloat(lease.depositAmount), 0)

        return {
            total: rawLeases.length,
            active: activeLeases.length,
            overdue: overdueLeases.length,
            returned: returnedLeases.length,
            revenue: totalRevenue,
            deposits: totalDeposits,
        }
    }, [rawLeases])

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
                                router.push(`/staff/leasing/${lease.id}`)
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
                                        `/staff/leasing/returns?leaseId=${lease.id}`,
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

    return (
        <Container>
            <div className="mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
                            Lease Management
                        </h3>
                        <p className="text-sm text-gray-500">
                            Manage cylinder leases for your outlet
                        </p>
                    </div>
                    {!isMobile && (
                        <Button
                            variant="solid"
                            icon={<PiPlusDuotone />}
                            onClick={() => router.push('/staff/leasing/new')}
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
                        <div className="flex justify-between items-center mb-3">
                            <PiCurrencyCircleDollarDuotone className="text-2xl md:text-3xl text-gray-500" />
                            <Tag className="text-xs">
                                {statistics.total} Total
                            </Tag>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 mb-1">
                                Total Leases
                            </p>
                            <p className="text-xl md:text-2xl font-bold text-gray-900">
                                {statistics.total}
                            </p>
                        </div>
                    </div>
                </AdaptiveCard>

                <AdaptiveCard className="hover:shadow-lg transition-shadow duration-200">
                    <div className="p-4 md:p-5">
                        <div className="flex justify-between items-center mb-3">
                            <PiCheckCircleDuotone className="text-2xl md:text-3xl text-blue-500" />
                            <Tag className="text-xs bg-blue-100 text-blue-700">
                                Active
                            </Tag>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 mb-1">
                                Active Leases
                            </p>
                            <p className="text-xl md:text-2xl font-bold text-blue-600">
                                {statistics.active}
                            </p>
                        </div>
                    </div>
                </AdaptiveCard>

                <AdaptiveCard className="hover:shadow-lg transition-shadow duration-200">
                    <div className="p-4 md:p-5">
                        <div className="flex justify-between items-center mb-3">
                            <PiWarningDuotone className="text-2xl md:text-3xl text-red-500" />
                            <Tag className="text-xs bg-red-100 text-red-700">
                                Overdue
                            </Tag>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 mb-1">
                                Overdue Leases
                            </p>
                            <p className="text-xl md:text-2xl font-bold text-red-600">
                                {statistics.overdue}
                            </p>
                        </div>
                    </div>
                </AdaptiveCard>

                <AdaptiveCard className="hover:shadow-lg transition-shadow duration-200">
                    <div className="p-4 md:p-5">
                        <div className="flex justify-between items-center mb-3">
                            <PiTrendUpDuotone className="text-2xl md:text-3xl text-green-500" />
                            <Tag className="text-xs bg-green-100 text-green-700">
                                Deposits
                            </Tag>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 mb-1">
                                Total Deposits
                            </p>
                            <p className="text-xl md:text-2xl font-bold text-green-600">
                                ₦{statistics.deposits.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </AdaptiveCard>
            </div>

            {/* Filters Section */}
            <AdaptiveCard className="mb-6">
                <div className="p-4">
                    <div
                        className={`${
                            showFilters || !isMobile
                                ? 'block'
                                : 'hidden md:block'
                        }`}
                    >
                        <div className="flex flex-col md:flex-row gap-3">
                            <div className="flex-1">
                                <Input
                                    placeholder="Search by customer or cylinder..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    prefix={<PiMagnifyingGlassDuotone />}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') handleSearch()
                                    }}
                                />
                            </div>

                            <Select
                                options={statusOptions}
                                value={statusOptions.find(
                                    (opt) => opt.value === filters.status,
                                )}
                                onChange={(option) =>
                                    handleFilterChange('status', option?.value)
                                }
                                placeholder="Status"
                                className="w-full md:w-40"
                            />

                            <DatePicker.DatePickerRange
                                value={dateRange}
                                onChange={setDateRange}
                                placeholder="Select date range"
                                className="w-full md:w-64"
                            />

                            <Button
                                variant="solid"
                                onClick={handleSearch}
                                icon={<PiMagnifyingGlassDuotone />}
                            >
                                Search
                            </Button>

                            {!isMobile && (
                                <Button
                                    variant="plain"
                                    onClick={handleExport}
                                    icon={<PiDownloadDuotone />}
                                >
                                    Export
                                </Button>
                            )}
                        </div>
                    </div>

                    {isMobile && (
                        <Button
                            size="sm"
                            variant="plain"
                            onClick={() => setShowFilters(!showFilters)}
                            icon={<PiFunnelDuotone />}
                            className="md:hidden mt-3"
                        >
                            {showFilters ? 'Hide Filters' : 'Show Filters'}
                        </Button>
                    )}
                </div>
            </AdaptiveCard>

            {/* Table or Cards */}
            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} height={100} />
                    ))}
                </div>
            ) : isMobile ? (
                <div className="space-y-4">
                    {leases.map((lease) => (
                        <LeaseCard key={lease.id} lease={lease} />
                    ))}
                </div>
            ) : (
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
                            pageIndex: filters.page || 1,
                            pageSize: filters.limit || 20,
                        }}
                    />
                </AdaptiveCard>
            )}

            {/* Mobile Floating Action Button */}
            {isMobile && (
                <div className="fixed bottom-20 right-4 z-20">
                    <Button
                        size="lg"
                        shape="circle"
                        variant="solid"
                        icon={<PiPlusDuotone className="text-xl" />}
                        onClick={() => router.push('/staff/leasing/new')}
                        className="shadow-lg"
                    />
                </div>
            )}
        </Container>
    )
}