'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    PiPlusDuotone,
    PiDownloadDuotone,
    PiEyeDuotone,
    PiPencilDuotone,
    PiMagnifyingGlassDuotone,
    PiFunnelDuotone,
    PiCubeDuotone,
    PiCheckCircleDuotone,
    PiClockDuotone,
    PiWarningDuotone,
    PiToolboxDuotone,
    PiArchiveDuotone,
    PiTrendUpDuotone,
    PiDotsThreeVerticalDuotone,
    PiGasPumpDuotone,
    PiBuildingsDuotone,
    PiCalendarDuotone,
} from 'react-icons/pi'
import { useCylinders } from '@/hooks/useCylinders'
import DataTable from '@/components/shared/DataTable'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Dropdown from '@/components/ui/Dropdown'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Container from '@/components/shared/Container'
import Skeleton from '@/components/ui/Skeleton'
import { VolumeGaugeMini } from '@/components/shared/VolumeGauge'
import { formatDate } from '@/utils/format'
import useWindowSize from '@/components/ui/hooks/useWindowSize'
import CylinderCard from '@/components/cylinders/CylinderCard'
import type { ColumnDef } from '@/components/shared/DataTable'
import type { Cylinder, CylinderStatus, CylinderType } from '@/types/cylinder'

const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'available', label: 'Available' },
    { value: 'leased', label: 'Leased' },
    { value: 'refilling', label: 'Refilling' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'damaged', label: 'Damaged' },
    { value: 'retired', label: 'Retired' },
]

const typeOptions = [
    { value: '', label: 'All Types' },
    { value: '5kg', label: '5kg' },
    { value: '10kg', label: '10kg' },
    { value: '15kg', label: '15kg' },
    { value: '50kg', label: '50kg' },
]

const getCylinderStatusClass = (status: string) => {
    switch (status) {
        case 'available':
            return 'bg-emerald-500 text-white'
        case 'leased':
            return 'bg-blue-500 text-white'
        case 'refilling':
            return 'bg-yellow-500 text-white'
        case 'maintenance':
            return 'bg-orange-500 text-white'
        case 'damaged':
            return 'bg-red-500 text-white'
        case 'retired':
            return 'bg-gray-500 text-white'
        default:
            return 'bg-gray-500 text-white'
    }
}

const getStatusIcon = (status: string) => {
    switch (status) {
        case 'available':
            return <PiCheckCircleDuotone />
        case 'leased':
            return <PiClockDuotone />
        case 'refilling':
            return <PiGasPumpDuotone />
        case 'maintenance':
            return <PiToolboxDuotone />
        case 'damaged':
            return <PiWarningDuotone />
        case 'retired':
            return <PiArchiveDuotone />
        default:
            return <PiCubeDuotone />
    }
}

export default function CylindersPage() {
    const router = useRouter()
    const { width } = useWindowSize()
    const isMobile = width ? width < 768 : false

    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [typeFilter, setTypeFilter] = useState('')
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(20)
    const [showFilters, setShowFilters] = useState(false)

    // Build filters
    const filters = {
        search,
        status: (statusFilter as CylinderStatus) || undefined,
        type: (typeFilter as CylinderType) || undefined,
        page,
        limit: pageSize,
    }

    const { data, error, isLoading } = useCylinders(filters)

    // Calculate statistics
    const cylinders = data?.data || []
    const total = data?.meta?.total || 0
    const availableCount = cylinders.filter(
        (c) => c.status === 'available',
    ).length
    const leasedCount = cylinders.filter((c) => c.status === 'leased').length
    const maintenanceCount = cylinders.filter(
        (c) => c.status === 'maintenance' || c.status === 'damaged',
    ).length

    const columns: ColumnDef<Cylinder>[] = [
        {
            accessorKey: 'cylinderCode',
            header: 'Cylinder',
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                        <PiCubeDuotone className="text-xl text-gray-600" />
                    </div>
                    <div className="flex flex-col">
                        <div className="font-medium text-gray-900">
                            {row.original.cylinderCode}
                        </div>
                        <div className="text-xs text-gray-500">
                            {row.original.qrCode}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'type',
            header: 'Type',
            cell: ({ row }) => (
                <Badge
                    content={row.original.type}
                    innerClass="bg-blue-500 text-white"
                />
            ),
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => (
                <div className="flex items-center gap-1">
                    {getStatusIcon(row.original.status)}
                    <Badge
                        content={
                            row.original.status.charAt(0).toUpperCase() +
                            row.original.status.slice(1)
                        }
                        innerClass={getCylinderStatusClass(row.original.status)}
                    />
                </div>
            ),
        },
        {
            accessorKey: 'currentOutlet.name',
            header: 'Outlet',
            cell: ({ row }) => (
                <div className="flex items-center gap-2 text-sm">
                    <PiBuildingsDuotone className="text-gray-400" />
                    {row.original.currentOutlet?.name || '-'}
                </div>
            ),
        },
        {
            accessorKey: 'gasLevel',
            header: 'Gas Level',
            cell: ({ row }) => (
                <VolumeGaugeMini
                    current={parseFloat(row.original.currentGasVolume)}
                    max={parseFloat(row.original.maxGasVolume)}
                />
            ),
        },
        {
            accessorKey: 'lastInspectionDate',
            header: 'Last Inspection',
            cell: ({ row }) => (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <PiCalendarDuotone className="text-gray-400" />
                    {formatDate(row.original.lastInspectionDate)}
                </div>
            ),
        },
        {
            id: 'actions',
            header: () => <div className="text-right">Actions</div>,
            cell: ({ row }) => (
                <div className="flex items-center justify-end gap-2">
                    <Button
                        size="sm"
                        variant="plain"
                        icon={<PiEyeDuotone />}
                        onClick={() =>
                            router.push(`/admin/cylinders/${row.original.id}`)
                        }
                    />
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
                            eventKey="edit"
                            onClick={() =>
                                router.push(
                                    `/admin/cylinders/${row.original.id}/edit`,
                                )
                            }
                        >
                            <PiPencilDuotone className="mr-2" />
                            Edit Cylinder
                        </Dropdown.Item>
                    </Dropdown>
                </div>
            ),
        },
    ]

    const handleExport = () => {
        // TODO: Implement export functionality
        console.log('Export cylinders')
    }

    const clearFilters = () => {
        setSearch('')
        setStatusFilter('')
        setTypeFilter('')
    }

    if (error) {
        return (
            <Container>
                <div className="text-center py-12">
                    <p className="text-red-500">Failed to load cylinders</p>
                </div>
            </Container>
        )
    }

    return (
        <Container>
            {/* Header */}
            <div className="mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
                            Cylinder Management
                        </h3>
                        <p className="text-sm text-gray-500">
                            Manage and track all cylinders in the system
                        </p>
                    </div>
                    {!isMobile && (
                        <div className="flex gap-2">
                            <Button
                                variant="plain"
                                size="md"
                                icon={<PiDownloadDuotone />}
                                onClick={handleExport}
                            >
                                Export
                            </Button>
                            <Link href="/admin/cylinders/new">
                                <Button
                                    variant="solid"
                                    size="md"
                                    icon={<PiPlusDuotone />}
                                >
                                    Add Cylinder
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
                <AdaptiveCard className="hover:shadow-lg transition-shadow duration-200">
                    <div className="p-4 md:p-5">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-xs md:text-sm font-medium text-gray-600">
                                Total Cylinders
                            </p>
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <PiCubeDuotone className="text-lg md:text-xl text-blue-600" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xl md:text-2xl font-bold text-gray-900">
                                {isLoading ? (
                                    <Skeleton className="w-16 h-7" />
                                ) : (
                                    total
                                )}
                            </p>
                            <p className="text-xs text-gray-500">
                                All cylinders
                            </p>
                        </div>
                    </div>
                </AdaptiveCard>

                <AdaptiveCard className="hover:shadow-lg transition-shadow duration-200">
                    <div className="p-4 md:p-5">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-xs md:text-sm font-medium text-gray-600">
                                Available
                            </p>
                            <div className="p-2 bg-green-50 rounded-lg">
                                <PiCheckCircleDuotone className="text-lg md:text-xl text-green-600" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xl md:text-2xl font-bold text-gray-900">
                                {isLoading ? (
                                    <Skeleton className="w-16 h-7" />
                                ) : (
                                    availableCount
                                )}
                            </p>
                            <p className="text-xs text-gray-500">
                                Ready for lease
                            </p>
                            {!isLoading && total > 0 && (
                                <div className="flex items-center gap-1 text-xs">
                                    <span className="text-gray-600">
                                        {Math.round(
                                            (availableCount / total) * 100,
                                        )}
                                        %
                                    </span>
                                    <span className="text-gray-400">
                                        of total
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
                                In Lease
                            </p>
                            <div className="p-2 bg-purple-50 rounded-lg">
                                <PiClockDuotone className="text-lg md:text-xl text-purple-600" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xl md:text-2xl font-bold text-gray-900">
                                {isLoading ? (
                                    <Skeleton className="w-16 h-7" />
                                ) : (
                                    leasedCount
                                )}
                            </p>
                            <p className="text-xs text-gray-500">
                                Currently leased
                            </p>
                            {!isLoading && (
                                <div className="flex items-center gap-1 text-xs">
                                    <PiTrendUpDuotone className="text-green-500" />
                                    <span className="text-green-600">
                                        Active
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
                                Maintenance
                            </p>
                            <div className="p-2 bg-orange-50 rounded-lg">
                                <PiToolboxDuotone className="text-lg md:text-xl text-orange-600" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xl md:text-2xl font-bold text-gray-900">
                                {isLoading ? (
                                    <Skeleton className="w-16 h-7" />
                                ) : (
                                    maintenanceCount
                                )}
                            </p>
                            <p className="text-xs text-gray-500">
                                Need attention
                            </p>
                            {!isLoading && maintenanceCount > 0 && (
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
            </div>

            {/* Filters Card */}
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
                            {(search || statusFilter || typeFilter) && (
                                <Badge content="Active" className="ml-2" />
                            )}
                        </Button>
                    )}

                    <div
                        className={`${isMobile && !showFilters ? 'hidden' : ''} space-y-4`}
                    >
                        {/* Search and Filters */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="md:col-span-2">
                                <Input
                                    prefix={
                                        <PiMagnifyingGlassDuotone className="text-gray-400" />
                                    }
                                    placeholder="Search by code, QR, or outlet..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <Select
                                placeholder="All Statuses"
                                options={statusOptions}
                                value={statusOptions.find(
                                    (opt) => opt.value === statusFilter,
                                )}
                                onChange={(option) =>
                                    setStatusFilter(option?.value as string)
                                }
                            />
                            <Select
                                placeholder="All Types"
                                options={typeOptions}
                                value={typeOptions.find(
                                    (opt) => opt.value === typeFilter,
                                )}
                                onChange={(option) =>
                                    setTypeFilter(option?.value as string)
                                }
                            />
                        </div>

                        {/* Active Filters Summary */}
                        {(search || statusFilter || typeFilter) && (
                            <div className="flex flex-wrap items-center gap-2 pt-4 border-t">
                                <PiFunnelDuotone className="text-gray-400" />
                                <span className="text-sm text-gray-600">
                                    Active filters:
                                </span>
                                {search && (
                                    <Badge
                                        content={`Search: ${search}`}
                                        innerClass="bg-gray-100 text-gray-700"
                                    />
                                )}
                                {statusFilter && (
                                    <Badge
                                        content={`Status: ${statusFilter}`}
                                        innerClass="bg-gray-100 text-gray-700"
                                    />
                                )}
                                {typeFilter && (
                                    <Badge
                                        content={`Type: ${typeFilter}`}
                                        innerClass="bg-gray-100 text-gray-700"
                                    />
                                )}
                                <Button
                                    size="xs"
                                    variant="plain"
                                    onClick={clearFilters}
                                >
                                    Clear all
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </AdaptiveCard>

            {/* Mobile Card View / Desktop Table View */}
            {isMobile ? (
                <div className="space-y-4">
                    {isLoading ? (
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
                    ) : cylinders.length > 0 ? (
                        cylinders.map((cylinder) => (
                            <CylinderCard
                                key={cylinder.id}
                                cylinder={cylinder}
                                onView={() =>
                                    router.push(
                                        `/admin/cylinders/${cylinder.id}`,
                                    )
                                }
                                onEdit={() =>
                                    router.push(
                                        `/admin/cylinders/${cylinder.id}/edit`,
                                    )
                                }
                            />
                        ))
                    ) : (
                        <AdaptiveCard>
                            <div className="text-center py-12">
                                <PiCubeDuotone className="text-6xl text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 mb-2">
                                    No cylinders found
                                </p>
                                <p className="text-sm text-gray-400">
                                    Try adjusting your filters or search
                                    criteria
                                </p>
                                <Link href="/admin/cylinders/new">
                                    <Button
                                        variant="solid"
                                        icon={<PiPlusDuotone />}
                                        className="mt-4"
                                    >
                                        Add New Cylinder
                                    </Button>
                                </Link>
                            </div>
                        </AdaptiveCard>
                    )}

                    {/* Mobile Pagination */}
                    {cylinders.length > 0 && (
                        <div className="flex justify-between items-center p-4 bg-white rounded-lg shadow-sm">
                            <Button
                                variant="plain"
                                size="sm"
                                onClick={() => setPage(page - 1)}
                                disabled={page === 1}
                            >
                                Previous
                            </Button>
                            <span className="text-sm text-gray-600">
                                Page {page} of{' '}
                                {Math.ceil((data?.meta?.total || 0) / pageSize)}
                            </span>
                            <Button
                                variant="plain"
                                size="sm"
                                onClick={() => setPage(page + 1)}
                                disabled={
                                    page ===
                                    Math.ceil(
                                        (data?.meta?.total || 0) / pageSize,
                                    )
                                }
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </div>
            ) : (
                <AdaptiveCard>
                    <DataTable
                        columns={columns}
                        data={cylinders}
                        loading={isLoading}
                        pagingData={{
                            total: data?.meta?.total || 0,
                            pageIndex: page,  // Pass 1-based directly - DataTable uses 1-based
                            pageSize: pageSize,
                        }}
                        onPaginationChange={(page) =>
                            setPage(page)
                        }
                        onSelectChange={setPageSize}
                        noData={!isLoading && cylinders.length === 0}
                    />
                </AdaptiveCard>
            )}

            {/* Floating Action Button for Mobile */}
            {isMobile && (
                <div className="fixed bottom-6 right-6 z-50">
                    <Link href="/admin/cylinders/new">
                        <Button
                            variant="solid"
                            size="lg"
                            className="rounded-full shadow-lg w-14 h-14 p-0"
                        >
                            <PiPlusDuotone className="text-2xl" />
                        </Button>
                    </Link>
                </div>
            )}
        </Container>
    )
}
