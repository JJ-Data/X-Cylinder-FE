'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    PiPlusDuotone,
    PiDownloadDuotone,
    PiMagnifyingGlassDuotone,
    PiEyeDuotone,
    PiGasPumpDuotone,
    PiUserDuotone,
    PiCalendarDuotone,
    PiFunnelDuotone,
    PiCubeDuotone,
    PiCurrencyCircleDollarDuotone,
    PiChartLineDuotone,
    PiDotsThreeVerticalDuotone,
    PiNoteDuotone,
    PiTrendUpDuotone,
    PiListBulletsDuotone,
    PiPackageDuotone,
    PiArrowRightDuotone,
} from 'react-icons/pi'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Container from '@/components/shared/Container'
import DataTable from '@/components/shared/DataTable'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import DatePicker from '@/components/ui/DatePicker'
import Badge from '@/components/ui/Badge'
import Dropdown from '@/components/ui/Dropdown'
import Skeleton from '@/components/ui/Skeleton'
import useWindowSize from '@/components/ui/hooks/useWindowSize'
import { useRefills } from '@/hooks/useRefills'
import { useOutlets } from '@/hooks/useOutlets'
import type { RefillRecord, RefillFilters } from '@/services/api/refill.service'
import { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'

// Removed payment method options since API doesn't provide this field

// RefillCard Component for Mobile View
const RefillCard = ({ refill }: { refill: RefillRecord }) => {
    const router = useRouter()
    
    return (
        <AdaptiveCard className="hover:shadow-lg transition-shadow duration-200">
            <div className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <PiGasPumpDuotone className="text-blue-600 text-lg" />
                            <span className="font-medium">#{refill.id}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <PiCalendarDuotone />
                            {refill.refillDate ? format(new Date(refill.refillDate), 'MMM dd, yyyy') : '-'}
                        </div>
                    </div>
                    <Badge content={`${refill.volumeAdded?.toFixed(1)} kg`} innerClass="bg-blue-100 text-blue-700" />
                </div>

                {/* Cylinder Info */}
                <div className="mb-3">
                    <div className="flex items-center gap-2 text-sm">
                        <PiCubeDuotone className="text-gray-400" />
                        <span className="font-medium">{refill.cylinder?.cylinderCode || 'Unknown'}</span>
                        <span className="text-gray-500">({refill.cylinder?.type || 'N/A'})</span>
                    </div>
                </div>

                {/* Operator */}
                <div className="mb-3">
                    <div className="flex items-center gap-2 text-sm">
                        <PiUserDuotone className="text-gray-400" />
                        <span>{refill.operator?.firstName} {refill.operator?.lastName}</span>
                    </div>
                </div>

                {/* Volume & Cost */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-gray-50 rounded-lg p-2">
                        <p className="text-xs text-gray-500">Volume Change</p>
                        <p className="text-sm font-medium">
                            {parseFloat(refill.preRefillVolume || '0').toFixed(1)} → {parseFloat(refill.postRefillVolume || '0').toFixed(1)} kg
                        </p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-2">
                        <p className="text-xs text-gray-500">Cost</p>
                        <p className="text-sm font-medium text-green-700">
                            ₦{parseFloat(refill.refillCost || '0').toLocaleString()}
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <Button
                    variant="plain"
                    size="sm"
                    className="w-full"
                    icon={<PiEyeDuotone />}
                    onClick={() => router.push(`/admin/refills/${refill.id}`)}
                >
                    View Details
                </Button>
            </div>
        </AdaptiveCard>
    )
}

export default function RefillsPage() {
    const router = useRouter()
    const { width } = useWindowSize()
    const isMobile = width ? width < 768 : false
    
    const [filters, setFilters] = useState<RefillFilters>({
        page: 1,
        pageSize: 10,
        outletId: 1, // Default to outlet 1 for now - should be updated to use user's outlet
    })
    const [searchTerm, setSearchTerm] = useState('')
    const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
        null,
        null,
    ])
    const [showFilters, setShowFilters] = useState(false)

    const { data: refillsData, isLoading } = useRefills(filters)
    const { data: outletsData } = useOutlets()

    const refills = refillsData?.data || []
    const _totalPages = refillsData?.meta?.totalPages || 1
    const currentPage = refillsData?.meta?.page || filters.page || 1
    const pageSize = refillsData?.meta?.limit || filters.pageSize || 10
    const totalItems = refillsData?.meta?.total || 0
    const outlets = outletsData?.outlets ?? []

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

    const handleFilterChange = (key: keyof RefillFilters, value: any) => {
        setFilters({ ...filters, [key]: value, page: 1 })
    }

    const handlePageChange = (page: number) => {
        setFilters({ ...filters, page })
    }

    const handleExport = () => {
        // TODO: Implement export functionality
        console.log('Export refills')
    }

    const columns: ColumnDef<RefillRecord>[] = [
        {
            header: 'Refill',
            accessorKey: 'id',
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                        <PiGasPumpDuotone className="text-xl text-gray-600" />
                    </div>
                    <div className="flex flex-col">
                        <div className="font-medium text-gray-900">
                            #{row.original?.id || ''}
                        </div>
                        <div className="text-xs text-gray-500">
                            {row.original?.batchNumber || 'No batch'}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            header: 'Cylinder',
            accessorKey: 'cylinder',
            cell: ({ row }) => {
                const cylinder = row.original?.cylinder
                return cylinder ? (
                    <div className="flex items-center gap-2">
                        <PiCubeDuotone className="text-gray-400" />
                        <div>
                            <div className="font-medium">
                                {cylinder.cylinderCode || 'Unknown'}
                            </div>
                            <div className="text-xs text-gray-500">
                                {cylinder.type || 'N/A'}
                            </div>
                        </div>
                    </div>
                ) : (
                    <span className="text-gray-400">N/A</span>
                )
            },
        },
        {
            header: 'Operator',
            accessorKey: 'operator',
            cell: ({ row }) => {
                const operator = row.original?.operator
                return operator ? (
                    <div className="flex items-center gap-2">
                        <PiUserDuotone className="text-gray-400" />
                        <div>
                            <div className="text-sm">
                                {operator.firstName || ''} {operator.lastName || ''}
                            </div>
                            <div className="text-xs text-gray-500">
                                {operator.email || ''}
                            </div>
                        </div>
                    </div>
                ) : (
                    <span className="text-gray-400">N/A</span>
                )
            },
        },
        {
            header: 'Date',
            accessorKey: 'refillDate',
            cell: ({ row }) => {
                const date = row.original?.refillDate
                return (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <PiCalendarDuotone className="text-gray-400" />
                        {date ? format(new Date(date), 'MMM dd, yyyy') : '-'}
                    </div>
                )
            },
        },
        {
            header: 'Volume Added',
            accessorKey: 'volumeAdded',
            cell: ({ row }) => (
                <Badge 
                    content={`${row.original?.volumeAdded?.toFixed(1) || '0.0'} kg`}
                    innerClass="bg-blue-500 text-white"
                />
            ),
        },
        {
            header: 'Pre/Post Volume',
            accessorKey: 'volumes',
            cell: ({ row }) => {
                const pre = parseFloat(row.original?.preRefillVolume || '0')
                const post = parseFloat(row.original?.postRefillVolume || '0')
                return (
                    <div className="flex items-center gap-1 text-sm">
                        <span className="text-gray-500">{pre.toFixed(1)}</span>
                        <PiArrowRightDuotone className="text-gray-400" />
                        <span className="font-medium">{post.toFixed(1)} kg</span>
                    </div>
                )
            },
        },
        {
            header: 'Cost',
            accessorKey: 'refillCost',
            cell: ({ row }) => {
                const cost = parseFloat(row.original?.refillCost || '0')
                return (
                    <div className="flex items-center gap-1">
                        <PiCurrencyCircleDollarDuotone className="text-green-600" />
                        <span className="font-medium">
                            ₦{cost.toLocaleString()}
                        </span>
                    </div>
                )
            },
        },
        {
            id: 'actions',
            header: () => <div className="text-right">Actions</div>,
            cell: ({ row }) => {
                const refill = row.original
                return refill?.id ? (
                    <div className="flex items-center justify-end gap-2">
                        <Button
                            size="sm"
                            variant="plain"
                            icon={<PiEyeDuotone />}
                            onClick={() =>
                                router.push(`/admin/refills/${refill.id}`)
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
                                eventKey="view"
                                onClick={() =>
                                    router.push(`/admin/refills/${refill.id}`)
                                }
                            >
                                <PiEyeDuotone className="mr-2" />
                                View Details
                            </Dropdown.Item>
                            <Dropdown.Item
                                eventKey="receipt"
                                onClick={() =>
                                    router.push(`/admin/refills/${refill.id}/receipt`)
                                }
                            >
                                <PiNoteDuotone className="mr-2" />
                                Print Receipt
                            </Dropdown.Item>
                        </Dropdown>
                    </div>
                ) : null
            },
        },
    ]

    const outletOptions = [
        { value: '', label: 'All Outlets' },
        ...(outlets && Array.isArray(outlets)
            ? outlets.map((outlet) => ({
                  value: outlet.id.toString(),
                  label: outlet.name,
              }))
            : []),
    ]

    // Calculate statistics safely
    const totalVolume = Array.isArray(refills)
        ? refills.reduce((sum, refill) => sum + (refill?.volumeAdded || 0), 0)
        : 0
    const totalRevenue = Array.isArray(refills)
        ? refills.reduce(
              (sum, refill) => sum + parseFloat(refill?.refillCost || '0'),
              0,
          )
        : 0
    const averageVolume = refills.length > 0 ? totalVolume / refills.length : 0
    const _averageCost = refills.length > 0 ? totalRevenue / refills.length : 0

    return (
        <Container>
            {/* Header */}
            <div className="mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
                            Refill Management
                        </h3>
                        <p className="text-sm text-gray-500">
                            Track and manage all cylinder refills
                        </p>
                    </div>
                    {!isMobile && (
                        <div className="flex gap-2">
                            <Button
                                variant="plain"
                                size="md"
                                icon={<PiListBulletsDuotone />}
                                onClick={() => router.push('/admin/refills/bulk')}
                            >
                                Bulk Refill
                            </Button>
                            <Button
                                variant="solid"
                                size="md"
                                icon={<PiPlusDuotone />}
                                onClick={() => router.push('/admin/refills/new')}
                            >
                                Record Refill
                            </Button>
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
                                Total Refills
                            </p>
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <PiGasPumpDuotone className="text-lg md:text-xl text-blue-600" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            {isLoading ? (
                                <Skeleton className="w-16 h-7" />
                            ) : (
                                <p className="text-xl md:text-2xl font-bold text-gray-900">
                                    {refills.length}
                                </p>
                            )}
                            <p className="text-xs text-gray-500">
                                All time refills
                            </p>
                        </div>
                    </div>
                </AdaptiveCard>

                <AdaptiveCard className="hover:shadow-lg transition-shadow duration-200">
                    <div className="p-4 md:p-5">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-xs md:text-sm font-medium text-gray-600">
                                Total Volume
                            </p>
                            <div className="p-2 bg-purple-50 rounded-lg">
                                <PiPackageDuotone className="text-lg md:text-xl text-purple-600" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            {isLoading ? (
                                <Skeleton className="w-20 h-7" />
                            ) : (
                                <p className="text-xl md:text-2xl font-bold text-gray-900">
                                    {totalVolume.toFixed(1)} kg
                                </p>
                            )}
                            <p className="text-xs text-gray-500">
                                Total gas refilled
                            </p>
                        </div>
                    </div>
                </AdaptiveCard>

                <AdaptiveCard className="hover:shadow-lg transition-shadow duration-200">
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
                            {isLoading ? (
                                <Skeleton className="w-24 h-7" />
                            ) : (
                                <p className="text-xl md:text-2xl font-bold text-gray-900">
                                    ₦{totalRevenue.toLocaleString()}
                                </p>
                            )}
                            <div className="flex items-center gap-1 text-xs">
                                <PiTrendUpDuotone className="text-green-500" />
                                <span className="text-green-600">Revenue</span>
                            </div>
                        </div>
                    </div>
                </AdaptiveCard>

                <AdaptiveCard className="hover:shadow-lg transition-shadow duration-200">
                    <div className="p-4 md:p-5">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-xs md:text-sm font-medium text-gray-600">
                                Average Volume
                            </p>
                            <div className="p-2 bg-orange-50 rounded-lg">
                                <PiChartLineDuotone className="text-lg md:text-xl text-orange-600" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            {isLoading ? (
                                <Skeleton className="w-16 h-7" />
                            ) : (
                                <p className="text-xl md:text-2xl font-bold text-gray-900">
                                    {averageVolume.toFixed(1)} kg
                                </p>
                            )}
                            <p className="text-xs text-gray-500">
                                Per refill average
                            </p>
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
                            {(searchTerm || dateRange[0] || dateRange[1]) && (
                                <Badge content="Active" className="ml-2" />
                            )}
                        </Button>
                    )}

                    <div
                        className={`${isMobile && !showFilters ? 'hidden' : ''} space-y-4`}
                    >
                        {/* Search and Filters */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="md:col-span-2">
                                <Input
                                    prefix={
                                        <PiMagnifyingGlassDuotone className="text-gray-400" />
                                    }
                                    placeholder="Search by cylinder, operator..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={(e) =>
                                        e.key === 'Enter' && handleSearch()
                                    }
                                />
                            </div>
                            <DatePicker.DatePickerRange
                                placeholder="Select date range"
                                value={dateRange}
                                onChange={setDateRange}
                            />
                            <Select
                                placeholder="Select outlet"
                                options={outletOptions}
                                value={outletOptions.find(
                                    (opt) =>
                                        opt.value ===
                                        (filters.outletId?.toString() || '1'),
                                )}
                                onChange={(option) =>
                                    handleFilterChange(
                                        'outletId',
                                        option?.value ? parseInt(option.value) : 1,
                                    )
                                }
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-2">
                            <Button onClick={handleSearch} variant="solid" className="flex-1 sm:flex-initial">
                                Apply Filters
                            </Button>
                            {!isMobile && (
                                <Button
                                    variant="plain"
                                    icon={<PiDownloadDuotone />}
                                    onClick={handleExport}
                                >
                                    Export
                                </Button>
                            )}
                        </div>

                        {/* Active Filters Summary */}
                        {(searchTerm || dateRange[0] || dateRange[1] || filters.outletId !== 1) && (
                            <div className="flex flex-wrap items-center gap-2 pt-4 border-t">
                                <PiFunnelDuotone className="text-gray-400" />
                                <span className="text-sm text-gray-600">
                                    Active filters:
                                </span>
                                {searchTerm && (
                                    <Badge
                                        content={`Search: ${searchTerm}`}
                                        innerClass="bg-gray-100 text-gray-700"
                                    />
                                )}
                                {(dateRange[0] || dateRange[1]) && (
                                    <Badge
                                        content={`Date: ${dateRange[0] ? format(dateRange[0], 'MMM dd') : ''} - ${dateRange[1] ? format(dateRange[1], 'MMM dd') : ''}`}
                                        innerClass="bg-gray-100 text-gray-700"
                                    />
                                )}
                                {filters.outletId !== 1 && (
                                    <Badge
                                        content={`Outlet: ${outlets.find(o => o.id === filters.outletId)?.name || ''}`}
                                        innerClass="bg-gray-100 text-gray-700"
                                    />
                                )}
                                <Button
                                    size="xs"
                                    variant="plain"
                                    onClick={() => {
                                        setSearchTerm('')
                                        setDateRange([null, null])
                                        setFilters({ ...filters, outletId: 1, page: 1 })
                                    }}
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
                    ) : refills.length > 0 ? (
                        refills.map((refill) => (
                            <RefillCard key={refill.id} refill={refill} />
                        ))
                    ) : (
                        <AdaptiveCard>
                            <div className="text-center py-12">
                                <PiGasPumpDuotone className="text-6xl text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 mb-2">
                                    No refills found
                                </p>
                                <p className="text-sm text-gray-400">
                                    Try adjusting your filters or search criteria
                                </p>
                                <Button
                                    variant="solid"
                                    icon={<PiPlusDuotone />}
                                    onClick={() => router.push('/admin/refills/new')}
                                    className="mt-4"
                                >
                                    Record New Refill
                                </Button>
                            </div>
                        </AdaptiveCard>
                    )}

                    {/* Mobile Pagination */}
                    {refills.length > 0 && (
                        <div className="flex justify-between items-center p-4 bg-white rounded-lg shadow-sm">
                            <Button
                                variant="plain"
                                size="sm"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </Button>
                            <span className="text-sm text-gray-600">
                                Page {currentPage} of {_totalPages}
                            </span>
                            <Button
                                variant="plain"
                                size="sm"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === _totalPages}
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
                        data={refills}
                        loading={isLoading}
                        noData={!isLoading && refills.length === 0}
                        onPaginationChange={(page) => handlePageChange(page)}
                        pagingData={{
                            total: totalItems,
                            pageIndex: currentPage,
                            pageSize: pageSize,
                        }}
                    />
                </AdaptiveCard>
            )}

            {/* Floating Action Button for Mobile */}
            {isMobile && (
                <div className="fixed bottom-6 right-6 z-50">
                    <Button
                        variant="solid"
                        size="lg"
                        className="rounded-full shadow-lg w-14 h-14 p-0"
                        onClick={() => router.push('/admin/refills/new')}
                    >
                        <PiPlusDuotone className="text-2xl" />
                    </Button>
                </div>
            )}
        </Container>
    )
}
