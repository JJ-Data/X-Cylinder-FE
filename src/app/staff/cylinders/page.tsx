'use client'

import React, { useState, useCallback } from 'react'
import { Card } from '@/components/ui'
import Button from '@/components/ui/Button'
import {
    FiGrid,
    FiList,
    FiDownload,
    FiTruck,
    FiRefreshCw,
} from 'react-icons/fi'
import { BiQrScan } from 'react-icons/bi'
import {
    CylinderTable,
    CylinderFilters,
    CylinderCard,
    type CylinderStatus,
} from '@/components/cylinders'
import { useAuthStore } from '@/stores'
import { useCylinders } from '@/hooks/useCylinders'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import type { Cylinder, CylinderType } from '@/types/cylinder'
import { Skeleton } from '@/components/ui/Skeleton'

interface FilterState {
    status: CylinderStatus | undefined
    type: CylinderType | undefined
    searchTerm?: string
}

export default function StaffCylindersPage() {
    const router = useRouter()
    const { outletId } = useAuthStore()
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
    const [filters, setFilters] = useState<FilterState>({
        status: undefined,
        type: undefined,
        searchTerm: '',
    })

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
    })

    const cylinders = cylindersData?.data || []

    const handleFilterChange = useCallback(
        (newFilters: any) => {
            setFilters({
                status: newFilters.status || undefined,
                type: newFilters.type || undefined,
                searchTerm: filters.searchTerm,
            })
        },
        [filters.searchTerm],
    )

    const handleSearch = useCallback((search: string) => {
        setFilters((prev) => ({ ...prev, searchTerm: search }))
    }, [])

    const handleViewDetails = useCallback(
        (cylinder: Cylinder) => {
            router.push(`/staff/cylinders/${cylinder.id}`)
        },
        [router],
    )

    const handleAssignLease = useCallback(
        (cylinder: Cylinder) => {
            // Pass cylinder ID to the lease creation page
            router.push(`/staff/leasing/new?cylinderId=${cylinder.id}`)
        },
        [router],
    )

    const handleViewQR = useCallback((cylinder: Cylinder) => {
        // TODO: Show QR code modal
        toast.success(`QR Code: ${cylinder.qrCode}`)
    }, [])

    const handleScanQR = useCallback(() => {
        // Navigate to QR scanner page
        router.push('/staff/cylinders/scan')
    }, [router])

    const handleExport = useCallback(async () => {
        try {
            // TODO: Implement export functionality
            toast.success('Export functionality coming soon!')
        } catch (error) {
            toast.error('Failed to export data')
        }
    }, [])

    const handleRefresh = useCallback(() => {
        mutate()
        toast.success('Data refreshed')
    }, [mutate])

    if (error) {
        return (
            <div className="container mx-auto p-6">
                <Card className="p-8 text-center">
                    <h3 className="text-lg font-medium text-red-900 mb-2">
                        Failed to load cylinders
                    </h3>
                    <p className="text-gray-600 mb-4">
                        {error.message ||
                            'An error occurred while fetching cylinders'}
                    </p>
                    <Button variant="solid" onClick={handleRefresh}>
                        <FiRefreshCw className="mr-2" />
                        Retry
                    </Button>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Cylinder Inventory
                    </h1>
                    <p className="text-gray-600">
                        Outlet inventory ({cylinders.length} cylinders)
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {/* View Mode Toggle */}
                    <div className="flex rounded-lg border border-gray-300">
                        <Button
                            variant={viewMode === 'table' ? 'solid' : 'plain'}
                            size="sm"
                            onClick={() => setViewMode('table')}
                            className="rounded-r-none"
                        >
                            <FiList />
                        </Button>
                        <Button
                            variant={viewMode === 'grid' ? 'solid' : 'plain'}
                            size="sm"
                            onClick={() => setViewMode('grid')}
                            className="rounded-l-none"
                        >
                            <FiGrid />
                        </Button>
                    </div>

                    {/* Actions */}
                    <Button
                        variant="plain"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={isLoading}
                    >
                        <FiRefreshCw
                            className={`mr-2 ${isLoading ? 'animate-spin' : ''}`}
                        />
                        Refresh
                    </Button>

                    <Button variant="plain" size="sm" onClick={handleExport}>
                        <FiDownload className="mr-2" />
                        Export
                    </Button>

                    <Button
                        variant="solid"
                        size="sm"
                        onClick={handleScanQR}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        <BiQrScan className="mr-2" />
                        Scan QR
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card className="p-4 mb-6">
                <CylinderFilters
                    onFilterChange={handleFilterChange}
                    onSearch={handleSearch}
                />
            </Card>

            {/* Content */}
            {isLoading ? (
                <div className="space-y-4">
                    {viewMode === 'table' ? (
                        <Card className="p-4">
                            <div className="space-y-3">
                                {[...Array(5)].map((_, i) => (
                                    <Skeleton key={i} className="h-12 w-full" />
                                ))}
                            </div>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {[...Array(8)].map((_, i) => (
                                <Card key={i} className="p-4">
                                    <Skeleton className="h-32 w-full mb-2" />
                                    <Skeleton className="h-4 w-3/4 mb-2" />
                                    <Skeleton className="h-4 w-1/2" />
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <>
                    {viewMode === 'table' ? (
                        <Card className="overflow-hidden">
                            <CylinderTable
                                cylinders={cylinders as any}
                                onView={handleViewDetails as any}
                                onViewQR={handleViewQR as any}
                                onAssignLease={handleAssignLease as any}
                                role="STAFF"
                                loading={false}
                            />
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {cylinders.map((cylinder) => (
                                <CylinderCard
                                    key={cylinder.id}
                                    cylinder={cylinder as any}
                                    onView={handleViewDetails as any}
                                />
                            ))}
                        </div>
                    )}

                    {cylinders.length === 0 && !isLoading && (
                        <Card className="p-8 text-center">
                            <div className="max-w-sm mx-auto">
                                <FiTruck className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    No cylinders found
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    {filters.status ||
                                    filters.type ||
                                    filters.searchTerm
                                        ? 'Try adjusting your filters to see more results.'
                                        : 'No cylinders are currently assigned to your outlet.'}
                                </p>
                                {(filters.status ||
                                    filters.type ||
                                    filters.searchTerm) && (
                                    <Button
                                        variant="solid"
                                        onClick={() =>
                                            setFilters({
                                                status: undefined,
                                                type: undefined,
                                                searchTerm: '',
                                            })
                                        }
                                    >
                                        Clear Filters
                                    </Button>
                                )}
                            </div>
                        </Card>
                    )}
                </>
            )}

            {/* Quick Stats */}
            {cylinders.length > 0 && (
                <Card className="mt-6 p-4">
                    <h3 className="text-lg font-medium mb-4">
                        Quick Statistics
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-green-600">
                                {
                                    cylinders.filter(
                                        (c) => c.status === 'available',
                                    ).length
                                }
                            </p>
                            <p className="text-sm text-gray-600">Available</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-blue-600">
                                {
                                    cylinders.filter(
                                        (c) => c.status === 'leased',
                                    ).length
                                }
                            </p>
                            <p className="text-sm text-gray-600">Leased</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-yellow-600">
                                {
                                    cylinders.filter(
                                        (c) => c.status === 'refilling',
                                    ).length
                                }
                            </p>
                            <p className="text-sm text-gray-600">Refilling</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-red-600">
                                {
                                    cylinders.filter(
                                        (c) => c.status === 'damaged',
                                    ).length
                                }
                            </p>
                            <p className="text-sm text-gray-600">Damaged</p>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    )
}
