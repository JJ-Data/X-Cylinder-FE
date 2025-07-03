'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import OutletTable from '@/components/outlets/OutletTable'
import OutletCard from '@/components/outlets/OutletCard'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Button from '@/components/ui/Button'
import Skeleton from '@/components/ui/Skeleton'
import { PiHouseDuotone, PiPlusDuotone } from 'react-icons/pi'
import { useOutletStore } from '@/stores/useOutletStore'
import { useRouter } from 'next/navigation'

type OutletListContentProps = {
    searchTerm?: string
    statusFilter?: string
    locationFilter?: string
    isMobile?: boolean
}

const OutletListContent = ({
    searchTerm = '',
    statusFilter = '',
    locationFilter = '',
    isMobile = false,
}: OutletListContentProps) => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { outlets, fetchOutlets, totalOutlets, isLoading } = useOutletStore()

    const pageIndex = Number(searchParams.get('pageIndex')) || 1
    const pageSize = Number(searchParams.get('pageSize')) || 10

    useEffect(() => {
        const filters = {
            page: pageIndex,
            limit: pageSize,
            ...(statusFilter && {
                status: statusFilter as 'active' | 'inactive',
            }),
            ...(searchTerm && { search: searchTerm }),
            ...(locationFilter && { location: locationFilter }),
        }

        fetchOutlets(filters)
    }, [
        pageIndex,
        pageSize,
        statusFilter,
        searchTerm,
        locationFilter,
        fetchOutlets,
    ])

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('pageIndex', page.toString())
        router.push(`?${params.toString()}`)
    }

    // Desktop Table View
    if (!isMobile) {
        return (
            <AdaptiveCard>
                <OutletTable
                    outletsTotal={totalOutlets}
                    pageIndex={pageIndex}
                    pageSize={pageSize}
                />
            </AdaptiveCard>
        )
    }

    // Mobile Card View
    return (
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
            ) : outlets && outlets.length > 0 ? (
                outlets.map((outlet) => (
                    <OutletCard
                        key={outlet.id}
                        outlet={outlet}
                        onView={() =>
                            router.push(`/admin/outlets/${outlet.id}`)
                        }
                        onEdit={() =>
                            router.push(`/admin/outlets/${outlet.id}/edit`)
                        }
                        isMobileView={true}
                    />
                ))
            ) : (
                // Empty state
                <AdaptiveCard>
                    <div className="text-center py-12">
                        <PiHouseDuotone className="text-6xl text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 mb-2">No outlets found</p>
                        <p className="text-sm text-gray-400">
                            Try adjusting your filters or search criteria
                        </p>
                        <Button
                            variant="solid"
                            icon={<PiPlusDuotone />}
                            onClick={() => router.push('/admin/outlets/new')}
                            className="mt-4"
                        >
                            Create New Outlet
                        </Button>
                    </div>
                </AdaptiveCard>
            )}

            {/* Mobile Pagination */}
            {outlets && outlets.length > 0 && (
                <div className="flex justify-between items-center p-4 bg-white rounded-lg shadow-sm">
                    <Button
                        variant="plain"
                        size="sm"
                        onClick={() => handlePageChange(pageIndex - 1)}
                        disabled={pageIndex === 1}
                    >
                        Previous
                    </Button>
                    <span className="text-sm text-gray-600">
                        Page {pageIndex} of {Math.ceil(totalOutlets / pageSize)}
                    </span>
                    <Button
                        variant="plain"
                        size="sm"
                        onClick={() => handlePageChange(pageIndex + 1)}
                        disabled={
                            pageIndex === Math.ceil(totalOutlets / pageSize)
                        }
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    )
}

export default OutletListContent
