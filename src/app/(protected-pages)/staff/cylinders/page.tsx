'use client'

import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { Card } from '@/components/ui'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Badge from '@/components/ui/Badge'
import Checkbox from '@/components/ui/Checkbox'
import Dropdown from '@/components/ui/Dropdown'
import DataTable from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { VolumeGaugeMini } from '@/components/shared/VolumeGauge'
import {
    PiGridFourDuotone,
    PiListDuotone,
    PiDownloadDuotone,
    PiTruckDuotone,
    PiArrowsCounterClockwiseDuotone,
    PiQrCodeDuotone,
    PiXDuotone,
    PiWarningCircleDuotone,
    PiCheckCircleDuotone,
    PiClockCountdownDuotone,
    PiUserDuotone,
    PiStorefrontDuotone,
    PiGasPumpDuotone,
    PiFunnelDuotone,
    PiMagnifyingGlassDuotone,
    PiCubeDuotone,
    PiToolboxDuotone,
    PiArrowRightDuotone,
    PiCaretUpDuotone,
    PiCaretDownDuotone,
    PiHouseDuotone,
    PiBellDuotone,
    PiSlidersHorizontalDuotone,
    PiCalendarDuotone,
    PiEyeDuotone,
    PiPencilDuotone,
    PiDotsThreeVerticalDuotone,
    PiWarningDuotone,
    PiClockDuotone,
    PiArchiveDuotone,
    PiArrowsLeftRightDuotone,
    PiCaretRightDuotone,
    PiCaretDownDuotone as PiCaretDownIcon,
    PiColumnsDuotone,
    PiPrinterDuotone,
    PiFileCsvDuotone,
    PiCheckDuotone,
    PiTimerDuotone,
} from 'react-icons/pi'
import { CylinderFilters, type CylinderStatus } from '@/components/cylinders'
import { useAuthStore } from '@/stores'
import { useCylinders } from '@/hooks/useCylinders'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import type { Cylinder, CylinderType } from '@/types/cylinder'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatDate, formatCurrency } from '@/utils/format'
import type { ColumnDef, Row } from '@tanstack/react-table'

interface FilterState {
    status: CylinderStatus | undefined
    type: CylinderType | undefined
    searchTerm?: string
    dateRange?: { start: Date | null; end: Date | null }
    gasLevelRange?: { min: number; max: number }
}

interface QuickFilter {
    id: string
    label: string
    icon: React.ReactNode
    filter: Partial<FilterState>
    color: string
}

const quickFilters: QuickFilter[] = [
    {
        id: 'available',
        label: 'Available Now',
        icon: <PiCheckCircleDuotone />,
        filter: { status: 'AVAILABLE' as CylinderStatus },
        color: 'emerald',
    },
    {
        id: 'needs-refill',
        label: 'Needs Refill',
        icon: <PiGasPumpDuotone />,
        filter: { gasLevelRange: { min: 0, max: 20 } },
        color: 'amber',
    },
    {
        id: 'overdue',
        label: 'Overdue Returns',
        icon: <PiWarningCircleDuotone />,
        filter: { status: 'LEASED' as CylinderStatus },
        color: 'red',
    },
    {
        id: 'maintenance',
        label: 'In Maintenance',
        icon: <PiToolboxDuotone />,
        filter: { status: 'MAINTENANCE' as CylinderStatus },
        color: 'orange',
    },
]

// Status configuration
const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
        case 'available':
            return <PiCheckCircleDuotone className="text-emerald-600" />
        case 'leased':
            return <PiUserDuotone className="text-blue-600" />
        case 'refilling':
        case 'in_refill':
            return <PiGasPumpDuotone className="text-amber-600" />
        case 'maintenance':
            return <PiToolboxDuotone className="text-orange-600" />
        case 'damaged':
            return <PiWarningDuotone className="text-red-600" />
        case 'retired':
            return <PiArchiveDuotone className="text-gray-600" />
        default:
            return <PiCubeDuotone className="text-gray-600" />
    }
}

const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
        case 'available':
            return 'text-emerald-700 bg-emerald-50 border-emerald-200'
        case 'leased':
            return 'text-blue-700 bg-blue-50 border-blue-200'
        case 'refilling':
        case 'in_refill':
            return 'text-amber-700 bg-amber-50 border-amber-200'
        case 'maintenance':
            return 'text-orange-700 bg-orange-50 border-orange-200'
        case 'damaged':
            return 'text-red-700 bg-red-50 border-red-200'
        case 'retired':
            return 'text-gray-700 bg-gray-50 border-gray-200'
        default:
            return 'text-gray-700 bg-gray-50 border-gray-200'
    }
}

const getTypeColor = (type: string) => {
    const weight = parseInt(type)
    if (weight <= 5) return 'text-blue-700 bg-blue-50 border-blue-200'
    if (weight <= 15) return 'text-green-700 bg-green-50 border-green-200'
    if (weight <= 25) return 'text-amber-700 bg-amber-50 border-amber-200'
    return 'text-red-700 bg-red-50 border-red-200'
}

export default function StaffCylindersPage() {
    const router = useRouter()
    const { outletId } = useAuthStore()
    const [filters, setFilters] = useState<FilterState>({
        status: undefined,
        type: undefined,
        searchTerm: '',
    })
    const [selectedRows, setSelectedRows] = useState<number[]>([])
    const [expandedRows, setExpandedRows] = useState<number[]>([])
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
    const [activeQuickFilter, setActiveQuickFilter] = useState<string | null>(null)
    const [showNotifications, setShowNotifications] = useState(false)
    const [showColumnSettings, setShowColumnSettings] = useState(false)
    const [visibleColumns, setVisibleColumns] = useState<string[]>([
        'expand',
        'cylinderCode',
        'type',
        'status',
        'gasLevel',
        'currentOutlet',
        'customer',
        'lastInspection',
        'actions',
    ])
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(25)

    // Fetch cylinders for the staff's outlet
    const {
        data: cylindersData,
        error,
        isLoading,
        mutate,
    } = useCylinders({
        outletId: outletId ? parseInt(outletId) : undefined,
        status: filters.status,
        type: filters.type,
        page,
        limit: pageSize,
    })

    const cylinders = cylindersData?.data || []
    const totalCount = cylindersData?.meta?.total || 0

    // Calculate statistics with trends
    const stats = useMemo(() => {
        const available = cylinders.filter(c => c.status === 'available').length
        const leased = cylinders.filter(c => c.status === 'leased').length
        const refilling = cylinders.filter(c => c.status === 'refilling' || c.status === 'in_refill').length
        const maintenance = cylinders.filter(c => c.status === 'maintenance' || c.status === 'damaged').length
        
        return {
            total: {
                value: cylinders.length,
                trend: 12,
                trendDirection: 'up' as 'up' | 'down',
            },
            available: {
                value: available,
                percentage: cylinders.length ? (available / cylinders.length * 100) : 0,
                trend: 5,
                trendDirection: 'up' as 'up' | 'down',
            },
            leased: {
                value: leased,
                percentage: cylinders.length ? (leased / cylinders.length * 100) : 0,
                trend: 8,
                trendDirection: 'up' as 'up' | 'down',
            },
            refilling: {
                value: refilling,
                percentage: cylinders.length ? (refilling / cylinders.length * 100) : 0,
                trend: 3,
                trendDirection: 'down' as 'up' | 'down',
            },
            maintenance: {
                value: maintenance,
                percentage: cylinders.length ? (maintenance / cylinders.length * 100) : 0,
                trend: 2,
                trendDirection: 'down' as 'up' | 'down',
            },
        }
    }, [cylinders])

    // Column definitions for DataTable
    const columns: ColumnDef<Cylinder>[] = useMemo(() => [
        {
            id: 'expand',
            header: '',
            cell: ({ row }) => (
                <button
                    onClick={() => {
                        const id = row.original.id
                        setExpandedRows(prev =>
                            prev.includes(id)
                                ? prev.filter(rowId => rowId !== id)
                                : [...prev, id]
                        )
                    }}
                    className="p-0.5 hover:bg-gray-50 rounded"
                >
                    {expandedRows.includes(row.original.id) ? (
                        <PiCaretDownIcon className="h-3 w-3 text-gray-500" />
                    ) : (
                        <PiCaretRightDuotone className="h-3 w-3 text-gray-500" />
                    )}
                </button>
            ),
            enableSorting: false,
            enableHiding: false,
            size: 30,
        },
        {
            accessorKey: 'cylinderCode',
            header: 'Cylinder',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <div className="font-medium text-gray-900">
                        {row.original.code || row.original.cylinderCode || `CYL-${row.original.id}`}
                    </div>
                    <div className="text-xs text-gray-500">
                        {row.original.qrCode}
                    </div>
                </div>
            ),
            size: 150,
        },
        {
            accessorKey: 'type',
            header: 'Type',
            cell: ({ row }) => (
                <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${getTypeColor(row.original.type)}`}>
                    {row.original.type}
                </div>
            ),
            size: 100,
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => (
                <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium border ${getStatusColor(row.original.status)}`}>
                    {getStatusIcon(row.original.status)}
                    <span className="capitalize">
                        {row.original.status?.replace('_', ' ')}
                    </span>
                </div>
            ),
            size: 140,
        },
        {
            id: 'gasLevel',
            accessorKey: 'currentGasVolume',
            header: 'Gas Level',
            cell: ({ row }) => {
                const current = parseFloat(row.original.currentGasVolume || '0')
                const max = parseFloat(row.original.maxGasVolume || '100')
                const percentage = max > 0 ? (current / max) * 100 : 0
                
                return (
                    <div className="flex items-center gap-2">
                        <VolumeGaugeMini current={current} max={max} />
                        <div className="text-xs">
                            <div className="font-medium">{percentage.toFixed(0)}%</div>
                        </div>
                    </div>
                )
            },
            size: 100,
        },
        {
            id: 'currentOutlet',
            accessorKey: 'currentOutlet.name',
            header: 'Outlet',
            cell: ({ row }) => (
                <div className="flex items-center gap-2 text-sm">
                    <PiStorefrontDuotone className="text-gray-400" />
                    <span>{row.original.currentOutlet?.name || 'Not assigned'}</span>
                </div>
            ),
            size: 120,
        },
        {
            id: 'customer',
            header: 'Customer',
            cell: ({ row }) => {
                const lease = row.original.currentLease
                if (!lease) {
                    return <span className="text-gray-400 italic">Available</span>
                }
                
                const dueDate = lease.expectedReturnDate ? new Date(lease.expectedReturnDate) : null
                const isOverdue = dueDate && dueDate < new Date()
                
                return (
                    <div className="space-y-1">
                        <div className="font-medium text-sm">
                            {lease.customer?.firstName} {lease.customer?.lastName}
                        </div>
                        {dueDate && (
                            <div className={`text-xs flex items-center gap-1 ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
                                {isOverdue && <PiWarningCircleDuotone />}
                                Due: {formatDate(dueDate)}
                            </div>
                        )}
                    </div>
                )
            },
            size: 150,
        },
        {
            id: 'lastInspection',
            accessorKey: 'lastInspectionDate',
            header: 'Last Inspection',
            cell: ({ row }) => {
                const date = row.original.lastInspectionDate
                const inspectionDate = date ? new Date(date) : null
                const daysSince = inspectionDate 
                    ? Math.floor((Date.now() - inspectionDate.getTime()) / (1000 * 60 * 60 * 24))
                    : null
                
                return (
                    <div className="flex items-center gap-2 text-sm">
                        <PiCalendarDuotone className="text-gray-400" />
                        <div>
                            <div>{date ? formatDate(date) : 'Never'}</div>
                            {daysSince !== null && (
                                <div className="text-xs text-gray-500">
                                    {daysSince} days ago
                                </div>
                            )}
                        </div>
                    </div>
                )
            },
            size: 120,
        },
        {
            id: 'actions',
            header: () => <div className="text-right">Actions</div>,
            cell: ({ row }) => (
                <div className="flex items-center justify-end gap-0.5">
                    <button
                        onClick={() => router.push(`/staff/cylinders/${row.original.id}`)}
                        className="p-1 hover:bg-gray-50 rounded text-gray-600 hover:text-gray-900"
                        title="View Details"
                    >
                        <PiEyeDuotone className="h-3.5 w-3.5" />
                    </button>
                    <button
                        onClick={() => handleViewQR(row.original)}
                        className="p-1 hover:bg-gray-50 rounded text-gray-600 hover:text-gray-900"
                        title="View QR Code"
                    >
                        <PiQrCodeDuotone className="h-3.5 w-3.5" />
                    </button>
                    <Dropdown
                        renderTitle={
                            <button
                                className="p-1 hover:bg-gray-50 rounded text-gray-600 hover:text-gray-900"
                            >
                                <PiDotsThreeVerticalDuotone className="h-3.5 w-3.5" />
                            </button>
                        }
                    >
                        {row.original.status === 'available' && (
                            <Dropdown.Item
                                eventKey="lease"
                                onClick={() => router.push(`/staff/leasing/new?cylinderId=${row.original.id}`)}
                            >
                                <PiUserDuotone className="mr-2 h-3.5 w-3.5" />
                                Assign Lease
                            </Dropdown.Item>
                        )}
                        <Dropdown.Item
                            eventKey="transfer"
                            onClick={() => handleTransfer(row.original)}
                        >
                            <PiArrowsLeftRightDuotone className="mr-2 h-3.5 w-3.5" />
                            Transfer
                        </Dropdown.Item>
                        <Dropdown.Item
                            eventKey="refill"
                            onClick={() => handleRefill(row.original)}
                        >
                            <PiGasPumpDuotone className="mr-2 h-3.5 w-3.5" />
                            Record Refill
                        </Dropdown.Item>
                        <Dropdown.Item
                            eventKey="maintenance"
                            onClick={() => handleMaintenance(row.original)}
                        >
                            <PiToolboxDuotone className="mr-2 h-3.5 w-3.5" />
                            Maintenance
                        </Dropdown.Item>
                    </Dropdown>
                </div>
            ),
            enableSorting: false,
            size: 100,
        },
    ], [expandedRows, router])

    // Filter columns based on visibility settings
    const visibleColumnsData = useMemo(() => 
        columns.filter(col => visibleColumns.includes(col.id as string)),
        [columns, visibleColumns]
    )

    // Action handlers
    const handleFilterChange = useCallback(
        (newFilters: any) => {
            setFilters({
                status: newFilters.status || undefined,
                type: newFilters.type || undefined,
                searchTerm: filters.searchTerm,
            })
            setActiveQuickFilter(null)
        },
        [filters.searchTerm],
    )

    const handleSearch = useCallback((search: string) => {
        setFilters((prev) => ({ ...prev, searchTerm: search }))
    }, [])

    const handleQuickFilter = useCallback((filter: QuickFilter) => {
        setFilters(prev => ({ ...prev, ...filter.filter }))
        setActiveQuickFilter(filter.id)
    }, [])

    const handleViewQR = useCallback((cylinder: Cylinder) => {
        toast.success(`QR Code: ${cylinder.qrCode}`)
    }, [])

    const handleTransfer = useCallback((cylinder: Cylinder) => {
        toast(`Transfer cylinder ${cylinder.cylinderCode}`)
    }, [])

    const handleRefill = useCallback((cylinder: Cylinder) => {
        router.push(`/staff/refills/new?cylinderId=${cylinder.id}`)
    }, [router])

    const handleMaintenance = useCallback((cylinder: Cylinder) => {
        toast(`Maintenance for cylinder ${cylinder.cylinderCode}`)
    }, [])

    const handleScanQR = useCallback(() => {
        router.push('/staff/cylinders/scan')
    }, [router])

    const handleExport = useCallback(async (format: 'csv' | 'pdf' = 'csv') => {
        try {
            const dataToExport = selectedRows.length > 0 
                ? cylinders.filter(c => selectedRows.includes(c.id))
                : cylinders
            
            toast.success(`Exporting ${dataToExport.length} cylinders as ${format.toUpperCase()}`)
        } catch (error) {
            toast.error('Failed to export data')
        }
    }, [selectedRows, cylinders])

    const handleRefresh = useCallback(() => {
        mutate()
        toast.success('Data refreshed')
    }, [mutate])

    const handleBulkAction = useCallback((action: string) => {
        if (selectedRows.length === 0) {
            toast.error('Please select cylinders first')
            return
        }
        toast.success(`${action} ${selectedRows.length} cylinders`)
        setSelectedRows([])
    }, [selectedRows])

    const handlePrint = useCallback(() => {
        window.print()
    }, [])

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key === '/' && e.ctrlKey) {
                e.preventDefault()
                document.getElementById('cylinder-search')?.focus()
            }
            if (e.key === 'r' && e.ctrlKey) {
                e.preventDefault()
                handleRefresh()
            }
            if (e.key === 'e' && e.ctrlKey) {
                e.preventDefault()
                handleExport()
            }
            if (e.key === 'p' && e.ctrlKey) {
                e.preventDefault()
                handlePrint()
            }
        }
        window.addEventListener('keydown', handleKeyPress)
        return () => window.removeEventListener('keydown', handleKeyPress)
    }, [handleRefresh, handleExport, handlePrint])

    if (error) {
        return (
            <div className="container mx-auto p-6">
                <Card className="p-8 text-center bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <PiWarningCircleDuotone className="h-10 w-10 text-red-600" />
                    </div>
                    <h3 className="text-lg font-medium text-red-900 mb-2">
                        Failed to load cylinders
                    </h3>
                    <p className="text-gray-600 mb-4">
                        {error.message || 'An error occurred while fetching cylinders'}
                    </p>
                    <Button variant="solid" onClick={handleRefresh} className="bg-red-600 hover:bg-red-700">
                        <PiArrowsCounterClockwiseDuotone className="mr-2" />
                        Retry
                    </Button>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="container mx-auto p-6">
                {/* Breadcrumb */}
                <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
                    <Link href="/staff/dashboard" className="flex items-center hover:text-gray-900 transition-colors">
                        <PiHouseDuotone className="mr-1" />
                        Dashboard
                    </Link>
                    <PiArrowRightDuotone className="text-gray-400" />
                    <span className="text-gray-900 font-medium">Cylinder Inventory</span>
                </nav>

                {/* Header with Stats */}
                <div className="mb-8">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                                <PiCubeDuotone className="mr-3 text-blue-600" />
                                Cylinder Inventory
                            </h1>
                            <p className="text-gray-600">
                                Manage and track all cylinders in your outlet
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <Button
                                variant="plain"
                                size="sm"
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative"
                            >
                                <PiBellDuotone className="text-xl" />
                                {showNotifications && (
                                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                )}
                            </Button>
                            <Button
                                variant="solid"
                                onClick={handleScanQR}
                                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md"
                            >
                                <PiQrCodeDuotone className="mr-2" />
                                Scan QR Code
                            </Button>
                        </div>
                    </div>

                    {/* Live Stats Dashboard */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                        {/* Total Cylinders */}
                        <Card className="p-4 bg-white border-blue-200 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-2">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <PiCubeDuotone className="h-5 w-5 text-blue-600" />
                                </div>
                                <div className={`flex items-center text-sm ${stats.total.trendDirection === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                    {stats.total.trendDirection === 'up' ? <PiCaretUpDuotone /> : <PiCaretDownDuotone />}
                                    {stats.total.trend}%
                                </div>
                            </div>
                            <div className="mt-3">
                                <p className="text-2xl font-bold text-gray-900">{stats.total.value}</p>
                                <p className="text-sm text-gray-600">Total Cylinders</p>
                            </div>
                        </Card>

                        {/* Available */}
                        <Card className="p-4 bg-white border-emerald-200 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-2">
                                <div className="p-2 bg-emerald-100 rounded-lg">
                                    <PiCheckCircleDuotone className="h-5 w-5 text-emerald-600" />
                                </div>
                                <div className={`flex items-center text-sm ${stats.available.trendDirection === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                    {stats.available.trendDirection === 'up' ? <PiCaretUpDuotone /> : <PiCaretDownDuotone />}
                                    {stats.available.trend}%
                                </div>
                            </div>
                            <div className="mt-3">
                                <p className="text-2xl font-bold text-gray-900">{stats.available.value}</p>
                                <p className="text-sm text-gray-600">Available</p>
                                <div className="mt-2 h-2 bg-emerald-200 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-emerald-600 rounded-full transition-all"
                                        style={{ width: `${stats.available.percentage}%` }}
                                    />
                                </div>
                            </div>
                        </Card>

                        {/* Leased */}
                        <Card className="p-4 bg-white border-blue-200 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-2">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <PiUserDuotone className="h-5 w-5 text-blue-600" />
                                </div>
                                <div className={`flex items-center text-sm ${stats.leased.trendDirection === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                    {stats.leased.trendDirection === 'up' ? <PiCaretUpDuotone /> : <PiCaretDownDuotone />}
                                    {stats.leased.trend}%
                                </div>
                            </div>
                            <div className="mt-3">
                                <p className="text-2xl font-bold text-gray-900">{stats.leased.value}</p>
                                <p className="text-sm text-gray-600">Leased</p>
                                <div className="mt-2 h-2 bg-blue-200 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-blue-600 rounded-full transition-all"
                                        style={{ width: `${stats.leased.percentage}%` }}
                                    />
                                </div>
                            </div>
                        </Card>

                        {/* In Refill */}
                        <Card className="p-4 bg-white border-amber-200 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-2">
                                <div className="p-2 bg-amber-100 rounded-lg">
                                    <PiGasPumpDuotone className="h-5 w-5 text-amber-600" />
                                </div>
                                <div className={`flex items-center text-sm ${stats.refilling.trendDirection === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                    {stats.refilling.trendDirection === 'up' ? <PiCaretUpDuotone /> : <PiCaretDownDuotone />}
                                    {stats.refilling.trend}%
                                </div>
                            </div>
                            <div className="mt-3">
                                <p className="text-2xl font-bold text-gray-900">{stats.refilling.value}</p>
                                <p className="text-sm text-gray-600">In Refill</p>
                                <div className="mt-2 h-2 bg-amber-200 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-amber-600 rounded-full transition-all"
                                        style={{ width: `${stats.refilling.percentage}%` }}
                                    />
                                </div>
                            </div>
                        </Card>

                        {/* Maintenance */}
                        <Card className="p-4 bg-white border-orange-200 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-2">
                                <div className="p-2 bg-orange-100 rounded-lg">
                                    <PiToolboxDuotone className="h-5 w-5 text-orange-600" />
                                </div>
                                <div className={`flex items-center text-sm ${stats.maintenance.trendDirection === 'up' ? 'text-red-600' : 'text-green-600'}`}>
                                    {stats.maintenance.trendDirection === 'up' ? <PiCaretUpDuotone /> : <PiCaretDownDuotone />}
                                    {stats.maintenance.trend}%
                                </div>
                            </div>
                            <div className="mt-3">
                                <p className="text-2xl font-bold text-gray-900">{stats.maintenance.value}</p>
                                <p className="text-sm text-gray-600">Issues</p>
                                <div className="mt-2 h-2 bg-orange-200 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-orange-600 rounded-full transition-all"
                                        style={{ width: `${stats.maintenance.percentage}%` }}
                                    />
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Quick Filters */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        {quickFilters.map((filter) => (
                            <Button
                                key={filter.id}
                                variant={activeQuickFilter === filter.id ? 'solid' : 'plain'}
                                size="sm"
                                onClick={() => handleQuickFilter(filter)}
                                className={`
                                    ${activeQuickFilter === filter.id 
                                        ? `bg-${filter.color}-600 hover:bg-${filter.color}-700 text-white` 
                                        : `hover:bg-${filter.color}-50 text-gray-700`
                                    } transition-all
                                `}
                            >
                                {filter.icon}
                                <span className="ml-2">{filter.label}</span>
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Action Bar */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        <div className="flex-1 w-full lg:w-auto">
                            <div className="relative">
                                <Input
                                    id="cylinder-search"
                                    placeholder="Search cylinders... (Ctrl+/)"
                                    value={filters.searchTerm}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="pl-12 pr-12 h-12 text-base w-full"
                                />
                                <PiMagnifyingGlassDuotone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                {filters.searchTerm && (
                                    <button
                                        onClick={() => handleSearch('')}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        <PiXDuotone className="h-5 w-5" />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            {/* Bulk Actions */}
                            {selectedRows.length > 0 && (
                                <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg animate-fadeIn">
                                    <span className="text-sm font-medium text-blue-700">
                                        {selectedRows.length} selected
                                    </span>
                                    <Button
                                        variant="plain"
                                        size="sm"
                                        onClick={() => handleBulkAction('transfer')}
                                        className="text-blue-600"
                                    >
                                        Transfer
                                    </Button>
                                    <Button
                                        variant="plain"
                                        size="sm"
                                        onClick={() => handleExport('csv')}
                                        className="text-blue-600"
                                    >
                                        Export
                                    </Button>
                                    <button
                                        onClick={() => setSelectedRows([])}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <PiXDuotone />
                                    </button>
                                </div>
                            )}

                            {/* Column Settings */}
                            <Dropdown
                                renderTitle={
                                    <Button
                                        variant="plain"
                                        size="sm"
                                        className="relative"
                                    >
                                        <PiColumnsDuotone className="mr-2" />
                                        Columns
                                    </Button>
                                }
                            >
                                <div className="p-2 min-w-[200px]">
                                    <div className="font-medium text-sm mb-2 px-2">Visible Columns</div>
                                    {columns.filter(col => col.id !== 'expand' && col.id !== 'actions').map(col => (
                                        <label key={col.id} className="flex items-center px-2 py-1 hover:bg-gray-50 rounded cursor-pointer">
                                            <Checkbox
                                                checked={visibleColumns.includes(col.id as string)}
                                                onChange={(checked) => {
                                                    if (checked) {
                                                        setVisibleColumns([...visibleColumns, col.id as string])
                                                    } else {
                                                        setVisibleColumns(visibleColumns.filter(id => id !== col.id))
                                                    }
                                                }}
                                                className="mb-0 mr-2"
                                            />
                                            <span className="text-sm">{col.header as string}</span>
                                        </label>
                                    ))}
                                </div>
                            </Dropdown>

                            {/* Advanced Filters Toggle */}
                            <Button
                                variant="plain"
                                size="sm"
                                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                className="relative"
                            >
                                <PiSlidersHorizontalDuotone className="mr-2" />
                                Filters
                                {(filters.status || filters.type) && (
                                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-600 rounded-full"></span>
                                )}
                            </Button>

                            {/* Actions */}
                            <Button
                                variant="plain"
                                size="sm"
                                onClick={handleRefresh}
                                disabled={isLoading}
                            >
                                <PiArrowsCounterClockwiseDuotone
                                    className={`mr-2 ${isLoading ? 'animate-spin' : ''}`}
                                />
                                Refresh
                            </Button>

                            <Dropdown
                                renderTitle={
                                    <Button variant="plain" size="sm">
                                        <PiDownloadDuotone className="mr-2" />
                                        Export
                                    </Button>
                                }
                            >
                                <Dropdown.Item eventKey="csv" onClick={() => handleExport('csv')}>
                                    <PiFileCsvDuotone className="mr-2" />
                                    Export as CSV
                                </Dropdown.Item>
                                <Dropdown.Item eventKey="pdf" onClick={() => handleExport('pdf')}>
                                    <PiPrinterDuotone className="mr-2" />
                                    Export as PDF
                                </Dropdown.Item>
                                <Dropdown.Item eventKey="print" onClick={handlePrint}>
                                    <PiPrinterDuotone className="mr-2" />
                                    Print
                                </Dropdown.Item>
                            </Dropdown>
                        </div>
                    </div>

                    {/* Active Filters Display */}
                    {(filters.status || filters.type || activeQuickFilter) && (
                        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                            <span className="text-sm text-gray-600">Active filters:</span>
                            {filters.status && (
                                <div className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                                    <span>Status: {filters.status}</span>
                                    <button 
                                        onClick={() => setFilters(prev => ({ ...prev, status: undefined }))}
                                        className="ml-1 hover:text-blue-900"
                                    >
                                        <PiXDuotone className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                            {filters.type && (
                                <div className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                                    <span>Type: {filters.type}</span>
                                    <button 
                                        onClick={() => setFilters(prev => ({ ...prev, type: undefined }))}
                                        className="ml-1 hover:text-green-900"
                                    >
                                        <PiXDuotone className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                            <button
                                onClick={() => {
                                    setFilters({ status: undefined, type: undefined, searchTerm: '' })
                                    setActiveQuickFilter(null)
                                }}
                                className="text-sm text-red-600 hover:text-red-700"
                            >
                                Clear all
                            </button>
                        </div>
                    )}
                </div>

                {/* Advanced Filters Panel */}
                {showAdvancedFilters && (
                    <div className="animate-slideDown mb-6">
                        <CylinderFilters
                            onFilterChange={handleFilterChange}
                            onSearch={handleSearch}
                        />
                    </div>
                )}

                {/* Professional DataTable */}
                <Card className="overflow-hidden bg-white shadow-sm">
                    <DataTable
                        columns={visibleColumnsData}
                        data={cylinders}
                        loading={isLoading}
                        selectable={true}
                        onCheckBoxChange={(checked, row) => {
                            if (checked) {
                                setSelectedRows([...selectedRows, row.id])
                            } else {
                                setSelectedRows(selectedRows.filter(id => id !== row.id))
                            }
                        }}
                        onIndeterminateCheckBoxChange={(checked, rows) => {
                            if (checked) {
                                setSelectedRows(rows.map(r => r.original.id))
                            } else {
                                setSelectedRows([])
                            }
                        }}
                        pagingData={{
                            total: totalCount,
                            pageIndex: page,
                            pageSize: pageSize,
                        }}
                        onPaginationChange={setPage}
                        onSelectChange={setPageSize}
                        pageSizes={[10, 25, 50, 100]}
                        noData={!isLoading && cylinders.length === 0}
                        customNoDataIcon={
                            <div className="text-center py-16">
                                <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <PiTruckDuotone className="h-12 w-12 text-gray-400" />
                                </div>
                                <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                                    No cylinders found
                                </h3>
                                <p className="text-gray-600 mb-8 leading-relaxed max-w-md mx-auto">
                                    {filters.status || filters.type || filters.searchTerm
                                        ? 'No cylinders match your current filters. Try adjusting your search criteria.'
                                        : 'No cylinders are currently assigned to your outlet.'}
                                </p>
                                {(filters.status || filters.type || filters.searchTerm) ? (
                                    <Button
                                        variant="solid"
                                        onClick={() => {
                                            setFilters({
                                                status: undefined,
                                                type: undefined,
                                                searchTerm: '',
                                            })
                                            setActiveQuickFilter(null)
                                        }}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        <PiXDuotone className="mr-2 h-4 w-4" />
                                        Clear All Filters
                                    </Button>
                                ) : (
                                    <Button
                                        variant="solid"
                                        onClick={handleScanQR}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        <PiQrCodeDuotone className="mr-2 h-4 w-4" />
                                        Scan QR to Add
                                    </Button>
                                )}
                            </div>
                        }
                    />

                    {/* Expandable Row Content */}
                    {expandedRows.map(rowId => {
                        const cylinder = cylinders.find(c => c.id === rowId)
                        if (!cylinder) return null
                        
                        return (
                            <div key={rowId} className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-2">Additional Details</h4>
                                        <dl className="space-y-1 text-sm">
                                            <div className="flex justify-between">
                                                <dt className="text-gray-600">Manufacture Date:</dt>
                                                <dd className="font-medium">{cylinder.manufactureDate ? formatDate(cylinder.manufactureDate) : 'N/A'}</dd>
                                            </div>
                                        </dl>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-2">Maintenance History</h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center gap-2">
                                                <PiCheckDuotone className="text-green-600" />
                                                <span>Last inspection passed</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <PiTimerDuotone className="text-amber-600" />
                                                <span>Next inspection due in 30 days</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-2">Notes</h4>
                                        <p className="text-sm text-gray-600">
                                            {cylinder.notes || 'No notes available'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </Card>

                {/* Keyboard Shortcuts Hint */}
                <div className="mt-8 text-center text-sm text-gray-500">
                    <span className="inline-flex items-center gap-4">
                        <span>
                            <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl</kbd> + 
                            <kbd className="px-2 py-1 bg-gray-100 rounded text-xs ml-1">/</kbd> Search
                        </span>
                        <span>
                            <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl</kbd> + 
                            <kbd className="px-2 py-1 bg-gray-100 rounded text-xs ml-1">R</kbd> Refresh
                        </span>
                        <span>
                            <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl</kbd> + 
                            <kbd className="px-2 py-1 bg-gray-100 rounded text-xs ml-1">E</kbd> Export
                        </span>
                        <span>
                            <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl</kbd> + 
                            <kbd className="px-2 py-1 bg-gray-100 rounded text-xs ml-1">P</kbd> Print
                        </span>
                    </span>
                </div>
            </div>
        </div>
    )
}