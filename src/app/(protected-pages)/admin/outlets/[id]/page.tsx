'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Button from '@/components/ui/Button'
import Alert from '@/components/ui/Alert'
import Spinner from '@/components/ui/Spinner'
import Skeleton from '@/components/ui/Skeleton'
import Badge from '@/components/ui/Badge'
import OutletCard from '@/components/outlets/OutletCard'
import OutletInventory from '@/components/outlets/OutletInventory'
import { useOutletStore } from '@/stores/useOutletStore'
import {
    PiPencilDuotone,
    PiArrowLeftDuotone,
    PiPackageDuotone,
    PiCalendarDuotone,
    PiCurrencyCircleDollarDuotone,
    PiUsersDuotone,
    PiTrendUpDuotone,
    PiChartLineDuotone,
} from 'react-icons/pi'
import useWindowSize from '@/components/ui/hooks/useWindowSize'

const OutletDetailsPage = () => {
    const params = useParams()
    const router = useRouter()
    const { width } = useWindowSize()
    const _isMobile = width ? width < 768 : false
    const outletId = Number(params.id)

    const selectedOutlet = useOutletStore((state) => state.selectedOutlet)
    const inventory = useOutletStore((state) => state.inventory)
    const fetchOutletById = useOutletStore((state) => state.fetchOutletById)
    const fetchOutletInventory = useOutletStore(
        (state) => state.fetchOutletInventory,
    )
    const isLoading = useOutletStore((state) => state.isLoading)
    const error = useOutletStore((state) => state.error)

    useEffect(() => {
        if (outletId) {
            fetchOutletById(outletId)
            fetchOutletInventory(outletId)
        }
    }, [outletId, fetchOutletById, fetchOutletInventory])

    if (isLoading && !selectedOutlet) {
        return (
            <Container>
                <div className="flex items-center justify-center h-[400px]">
                    <Spinner size={40} />
                </div>
            </Container>
        )
    }

    if (error) {
        return (
            <Container>
                <Alert type="danger">{error}</Alert>
            </Container>
        )
    }

    if (!selectedOutlet) {
        return (
            <Container>
                <Alert type="danger">Outlet not found</Alert>
            </Container>
        )
    }

    // Mock statistics (would be from API in real app)
    const totalCylinders = inventory?.totalCylinders || 0
    const activeLeases = inventory?.leasedCylinders || 0 // TODO: Get from API
    const monthlyRevenue = 0 // TODO: Get from API
    const staffCount = selectedOutlet.manager ? 1 : 0 // TODO: Get from API

    return (
        <Container>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="plain"
                                size="sm"
                                icon={<PiArrowLeftDuotone />}
                                onClick={() => router.push('/admin/outlets')}
                            >
                                Back to Outlets
                            </Button>
                            <div className="hidden md:block">
                                <nav className="flex items-center gap-2 text-sm">
                                    <span className="text-gray-500">
                                        Outlets
                                    </span>
                                    <span className="text-gray-400">/</span>
                                    <span className="font-medium">
                                        {selectedOutlet.name}
                                    </span>
                                </nav>
                            </div>
                        </div>
                        <Button
                            variant="solid"
                            size="sm"
                            icon={<PiPencilDuotone />}
                            onClick={() =>
                                router.push(`/admin/outlets/${outletId}/edit`)
                            }
                        >
                            Edit Outlet
                        </Button>
                    </div>
                </div>

                {/* Statistics s */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
                    <AdaptiveCard className="hover:shadow-lg transition-shadow duration-200">
                        <div className="p-4 md:p-5">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-xs md:text-sm font-medium text-gray-600">
                                    Total Cylinders
                                </p>
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    <PiPackageDuotone className="text-lg md:text-xl text-blue-600" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xl md:text-2xl font-bold text-gray-900">
                                    {isLoading ? (
                                        <Skeleton className="w-16 h-7" />
                                    ) : (
                                        totalCylinders
                                    )}
                                </p>
                                <p className="text-xs text-gray-500">
                                    In inventory
                                </p>
                            </div>
                        </div>
                    </AdaptiveCard>

                    <AdaptiveCard className="hover:shadow-lg transition-shadow duration-200">
                        <div className="p-4 md:p-5">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-xs md:text-sm font-medium text-gray-600">
                                    Active Leases
                                </p>
                                <div className="p-2 bg-green-50 rounded-lg">
                                    <PiCalendarDuotone className="text-lg md:text-xl text-green-600" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xl md:text-2xl font-bold text-gray-900">
                                    {isLoading ? (
                                        <Skeleton className="w-16 h-7" />
                                    ) : (
                                        activeLeases
                                    )}
                                </p>
                                <p className="text-xs text-gray-500">
                                    Current leases
                                </p>
                            </div>
                        </div>
                    </AdaptiveCard>

                    <AdaptiveCard className="hover:shadow-lg transition-shadow duration-200">
                        <div className="p-4 md:p-5">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-xs md:text-sm font-medium text-gray-600">
                                    Monthly Revenue
                                </p>
                                <div className="p-2 bg-emerald-50 rounded-lg">
                                    <PiCurrencyCircleDollarDuotone className="text-lg md:text-xl text-emerald-600" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xl md:text-2xl font-bold text-gray-900">
                                    {isLoading ? (
                                        <Skeleton className="w-24 h-7" />
                                    ) : (
                                        `₦${monthlyRevenue.toLocaleString()}`
                                    )}
                                </p>
                                <p className="text-xs text-gray-500">
                                    This month
                                </p>
                                {!isLoading && (
                                    <div className="flex items-center gap-1 text-xs">
                                        <PiTrendUpDuotone className="text-green-500" />
                                        <span className="text-green-600">
                                            +15%
                                        </span>
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
                                    Staff Count
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
                                        staffCount
                                    )}
                                </p>
                                <p className="text-xs text-gray-500">
                                    Active staff
                                </p>
                            </div>
                        </div>
                    </AdaptiveCard>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    <div className="lg:col-span-1">
                        <OutletCard outlet={selectedOutlet} />
                    </div>
                    <div className="lg:col-span-2">
                        <AdaptiveCard>
                            <div className="p-4 md:p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-lg font-semibold">
                                        Inventory Overview
                                    </h4>
                                    <Badge
                                        content="Live"
                                        className="bg-green-100 text-green-700"
                                    />
                                </div>
                                {inventory ? (
                                    <OutletInventory inventory={inventory} />
                                ) : (
                                    <div className="flex items-center justify-center h-32">
                                        <Spinner size={30} />
                                    </div>
                                )}
                            </div>
                        </AdaptiveCard>
                    </div>
                </div>

                {/* Recent Activities Section */}
                <AdaptiveCard>
                    <div className="p-4 md:p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-semibold flex items-center gap-2">
                                <PiChartLineDuotone className="text-xl" />
                                Recent Activities
                            </h4>
                            <Button variant="plain" size="sm">
                                View All
                            </Button>
                        </div>
                        <div className="text-center py-12 text-gray-500">
                            <PiChartLineDuotone className="text-6xl text-gray-300 mx-auto mb-4" />
                            <p className="mb-2">No recent activities</p>
                            <p className="text-sm text-gray-400">
                                Activity tracking will be available soon
                            </p>
                        </div>
                    </div>
                </AdaptiveCard>
            </div>
        </Container>
    )
}

export default OutletDetailsPage
