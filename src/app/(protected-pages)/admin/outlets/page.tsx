'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
    PiPlusDuotone,
    PiHouseDuotone,
    PiCheckCircleDuotone,
    PiXCircleDuotone,
    PiUsersDuotone,
    PiTrendUpDuotone,
    PiMagnifyingGlassDuotone,
    PiFunnelDuotone,
    PiDownloadDuotone,
} from 'react-icons/pi'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Badge from '@/components/ui/Badge'
import Skeleton from '@/components/ui/Skeleton'
import OutletListContent from './_components/OutletListContent'
import { useOutletStore } from '@/stores/useOutletStore'
import useWindowSize from '@/components/ui/hooks/useWindowSize'
import { Suspense } from 'react'

const OutletsPage = () => {
    const router = useRouter()
    const { width } = useWindowSize()
    const isMobile = width ? width < 768 : false
    const [showFilters, setShowFilters] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [locationFilter, setLocationFilter] = useState('')

    const { outlets, fetchOutlets, isLoading } = useOutletStore()

    // Calculate statistics
    const totalOutlets = outlets?.length || 0
    const activeOutlets =
        outlets?.filter((o) => o.status === 'active').length || 0
    const inactiveOutlets =
        outlets?.filter((o) => o.status === 'inactive').length || 0
    const staffAssigned = outlets?.filter((o) => o.manager).length || 0

    useEffect(() => {
        fetchOutlets({})
    }, [fetchOutlets])

    const handleSearch = () => {
        const filters = {
            ...(searchTerm && { search: searchTerm }),
            ...(statusFilter && {
                status: statusFilter as 'active' | 'inactive',
            }),
            ...(locationFilter && { location: locationFilter }),
        }
        fetchOutlets(filters)
    }

    const clearFilters = () => {
        setSearchTerm('')
        setStatusFilter('')
        setLocationFilter('')
        fetchOutlets({})
    }

    const handleExport = () => {
        // TODO: Implement export functionality
        console.log('Export outlets')
    }

    const statusOptions = [
        { value: '', label: 'All Status' },
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
    ]

    // Get unique locations for filter
    const locationOptions = [
        { value: '', label: 'All Locations' },
        ...Array.from(new Set(outlets?.map((o) => o.location) || [])).map(
            (loc) => ({
                value: loc,
                label: loc,
            }),
        ),
    ]

    return (
        <Container>
            <div className="mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
                            Outlet Management
                        </h3>
                        <p className="text-sm text-gray-500">
                            Manage your gas cylinder distribution outlets
                        </p>
                    </div>
                    {!isMobile && (
                        <Button
                            variant="solid"
                            icon={<PiPlusDuotone />}
                            onClick={() => router.push('/admin/outlets/new')}
                            size="md"
                        >
                            New Outlet
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
                                Total Outlets
                            </p>
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <PiHouseDuotone className="text-lg md:text-xl text-blue-600" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xl md:text-2xl font-bold text-gray-900">
                                {isLoading ? (
                                    <Skeleton className="w-16 h-7" />
                                ) : (
                                    totalOutlets
                                )}
                            </p>
                            <p className="text-xs text-gray-500">
                                Distribution points
                            </p>
                            {!isLoading && (
                                <div className="flex items-center gap-1 text-xs">
                                    <PiTrendUpDuotone className="text-green-500" />
                                    <span className="text-green-600">+2</span>
                                    <span className="text-gray-400">
                                        this month
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
                                Active
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
                                    activeOutlets
                                )}
                            </p>
                            <p className="text-xs text-gray-500">
                                Operational outlets
                            </p>
                            {!isLoading && (
                                <div className="flex items-center gap-1 text-xs">
                                    <span className="text-gray-600">
                                        {Math.round(
                                            (activeOutlets / totalOutlets) *
                                                100,
                                        ) || 0}
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
                                Inactive
                            </p>
                            <div className="p-2 bg-red-50 rounded-lg">
                                <PiXCircleDuotone className="text-lg md:text-xl text-red-600" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xl md:text-2xl font-bold text-red-600">
                                {isLoading ? (
                                    <Skeleton className="w-16 h-7" />
                                ) : (
                                    inactiveOutlets
                                )}
                            </p>
                            <p className="text-xs text-gray-500">
                                Need attention
                            </p>
                            {!isLoading && inactiveOutlets > 0 && (
                                <div className="flex items-center gap-1 text-xs">
                                    <span className="text-orange-600">
                                        Action required
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
                                Managed
                            </p>
                            <div className="p-2 bg-purple-50 rounded-lg">
                                <PiUsersDuotone className="text-lg md:text-xl text-purple-600" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xl md:text-2xl font-bold text-gray-900">
                                {isLoading ? (
                                    <Skeleton className="w-16 h-7" />
                                ) : (
                                    staffAssigned
                                )}
                            </p>
                            <p className="text-xs text-gray-500">
                                With managers
                            </p>
                            {!isLoading && (
                                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                                    <div
                                        className="bg-purple-600 h-1.5 rounded-full"
                                        style={{
                                            width: `${(staffAssigned / totalOutlets) * 100 || 0}%`,
                                        }}
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
                            {(statusFilter || locationFilter) && (
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
                                    placeholder="Search outlets by name or location..."
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
                                        (opt) => opt.value === statusFilter,
                                    )}
                                    onChange={(option) =>
                                        setStatusFilter(option?.value || '')
                                    }
                                    className="w-full md:w-40"
                                />
                                <Select
                                    placeholder="Filter by location"
                                    options={locationOptions}
                                    value={locationOptions.find(
                                        (opt) => opt.value === locationFilter,
                                    )}
                                    onChange={(option) =>
                                        setLocationFilter(option?.value || '')
                                    }
                                    className="w-full md:w-48"
                                />
                            </div>
                            <div className="flex gap-3">
                                {(statusFilter ||
                                    locationFilter ||
                                    searchTerm) && (
                                    <Button
                                        variant="plain"
                                        size="sm"
                                        onClick={clearFilters}
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

            {/* Outlet List */}
            <Suspense
                fallback={
                    <AdaptiveCard>
                        <div className="h-[400px] flex items-center justify-center">
                            <Skeleton className="w-32 h-4" />
                        </div>
                    </AdaptiveCard>
                }
            >
                <OutletListContent
                    searchTerm={searchTerm}
                    statusFilter={statusFilter}
                    locationFilter={locationFilter}
                    isMobile={isMobile}
                />
            </Suspense>

            {/* Floating Action Button for Mobile */}
            {isMobile && (
                <div className="fixed bottom-6 right-6 z-50">
                    <Button
                        variant="solid"
                        size="lg"
                        className="rounded-full shadow-lg w-14 h-14 p-0"
                        onClick={() => router.push('/admin/outlets/new')}
                    >
                        <PiPlusDuotone className="text-2xl" />
                    </Button>
                </div>
            )}
        </Container>
    )
}

export default OutletsPage
