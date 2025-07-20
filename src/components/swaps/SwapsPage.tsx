'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  PiPlusDuotone, 
  PiArrowsCounterClockwiseDuotone, 
  PiEyeDuotone,
  PiReceiptDuotone,
  PiMagnifyingGlassDuotone
} from 'react-icons/pi'
import { PiSliders } from 'react-icons/pi' // Using PiSliders instead of PiSliders
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Badge from '@/components/ui/Badge'
import DataTable from '@/components/shared/DataTable'
import { useSwaps, useSwapStatistics } from '@/hooks/useSwap'
import { format } from 'date-fns'
import type { SwapFilters, SwapRecord } from '@/types/swap'
import { ColumnDef } from '@tanstack/react-table'

// Safe formatting utilities
const formatCurrency = (value: string | number | undefined | null): string => {
  if (value === undefined || value === null) return '₦0'
  const numValue = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(numValue)) return '₦0'
  return `₦${Math.abs(numValue).toLocaleString()}`
}

const formatNumber = (value: string | number | undefined | null, decimals: number = 0): string => {
  if (value === undefined || value === null) return '0'
  const numValue = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(numValue)) return '0'
  return decimals > 0 ? numValue.toFixed(decimals) : numValue.toLocaleString()
}

const formatWeight = (value: string | number | undefined | null): string => {
  if (value === undefined || value === null) return '-'
  const numValue = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(numValue)) return '-'
  return `${numValue} kg`
}

const formatSafeDate = (dateValue: any): string => {
  if (!dateValue) return 'N/A'
  
  const date = new Date(dateValue)
  if (isNaN(date.getTime())) return 'Invalid Date'
  
  return format(date, 'MMM dd, yyyy')
}

const conditionColors = {
  good: 'green',
  poor: 'amber',
  damaged: 'red'
} as const

const conditionLabels = {
  good: 'Good',
  poor: 'Poor', 
  damaged: 'Damaged'
} as const

export default function SwapsPage() {
  const router = useRouter()
  const [filters, setFilters] = useState<SwapFilters>({
    page: 1,
    limit: 20
  })
  const [showFilters, setShowFilters] = useState(false)
  
  // API hooks
  const { data: swapsData, isLoading } = useSwaps(filters)
  const { data: statistics, isLoading: isLoadingStatistics } = useSwapStatistics()
  
  const handleFilterChange = (key: keyof SwapFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }))
  }
  
  const handlePageChange = (page: number) => {
    setFilters(prev => ({
      ...prev,
      page
    }))
  }
  
  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 20
    })
  }
  
  const columns: ColumnDef<SwapRecord>[] = [
    {
      header: 'Swap ID',
      accessorKey: 'id',
      size: 100,
      cell: ({ row }) => {
        const swap = row.original
        return <span className="font-mono text-sm">#{swap.id}</span>
      }
    },
    {
      header: 'Customer',
      accessorKey: 'lease.customer',
      cell: ({ row }) => {
        const swap = row.original
        return (
          <div>
            <div className="font-medium">
              {swap.lease?.customer?.firstName} {swap.lease?.customer?.lastName}
            </div>
            <div className="text-xs text-gray-500">
              {swap.lease?.customer?.email}
            </div>
          </div>
        )
      }
    },
    {
      header: 'Cylinders',
      accessorKey: 'oldCylinder.cylinderCode',
      cell: ({ row }) => {
        const swap = row.original
        return (
          <div className="space-y-1">
            <div className="text-xs">
              <span className="text-gray-500">From:</span> {swap.oldCylinder?.cylinderCode}
            </div>
            <div className="text-xs">
              <span className="text-gray-500">To:</span> {swap.newCylinder?.cylinderCode}
            </div>
          </div>
        )
      }
    },
    {
      header: 'Condition',
      accessorKey: 'condition',
      size: 100,
      cell: ({ row }) => {
        const swap = row.original
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
            swap.condition === 'good' ? 'bg-green-100 text-green-800' :
            swap.condition === 'poor' ? 'bg-amber-100 text-amber-800' :
            'bg-red-100 text-red-800'
          }`}>
            {conditionLabels[swap.condition as keyof typeof conditionLabels]}
          </span>
        )
      }
    },
    {
      header: 'Weight',
      accessorKey: 'weightRecorded',
      size: 80,
      cell: ({ row }) => {
        const swap = row.original
        return (
          <span className="text-sm">
            {formatWeight(swap.weightRecorded)}
          </span>
        )
      }
    },
    {
      header: 'Fee',
      accessorKey: 'swapFee',
      size: 100,
      cell: ({ row }) => {
        const swap = row.original
        return (
          <span className="font-medium">
            {formatCurrency(swap.swapFee)}
          </span>
        )
      }
    },
    {
      header: 'Staff',
      accessorKey: 'staff.firstName',
      cell: ({ row }) => {
        const swap = row.original
        return (
          <div className="text-sm">
            {swap.staff?.firstName} {swap.staff?.lastName}
          </div>
        )
      }
    },
    {
      header: 'Date',
      accessorKey: 'swapDate',
      size: 120,
      cell: ({ row }) => {
        const swap = row.original
        return (
          <div className="text-sm">
            {formatSafeDate(swap.swapDate)}
          </div>
        )
      }
    },
    {
      id: 'actions',
      header: 'Actions',
      size: 120,
      cell: ({ row }) => {
        const swap = row.original
        return (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="solid"
              icon={<PiEyeDuotone />}
              onClick={() => router.push(`/admin/swaps/${swap.id}`)}
            >
              View
            </Button>
            <Button
              size="sm"
              variant="plain"
              icon={<PiReceiptDuotone />}
              onClick={() => router.push(`/admin/swaps/${swap.id}/receipt`)}
            >
              Receipt
            </Button>
          </div>
        )
      }
    }
  ]
  
  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Cylinder Swaps</h1>
          <p className="text-gray-600">
            Manage cylinder swap operations and view swap history
          </p>
        </div>
        <Button
          variant="solid"
          icon={<PiPlusDuotone />}
          onClick={() => router.push('/admin/swaps/new')}
        >
          New Swap
        </Button>
      </div>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Swaps</p>
              {isLoadingStatistics ? (
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
              ) : (
                <p className="text-2xl font-bold">{formatNumber(statistics?.totalSwaps)}</p>
              )}
            </div>
            <PiArrowsCounterClockwiseDuotone className="text-3xl text-blue-500" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Fees</p>
              {isLoadingStatistics ? (
                <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
              ) : (
                <p className="text-2xl font-bold">{formatCurrency(statistics?.totalFees)}</p>
              )}
            </div>
            <PiReceiptDuotone className="text-3xl text-green-500" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Average Fee</p>
              {isLoadingStatistics ? (
                <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
              ) : (
                <p className="text-2xl font-bold">{formatCurrency(statistics?.averageSwapFee)}</p>
              )}
            </div>
            <PiSliders className="text-3xl text-amber-500" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Weight</p>
              {isLoadingStatistics ? (
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
              ) : (
                <p className="text-2xl font-bold">{formatNumber(statistics?.averageWeight, 1)} kg</p>
              )}
            </div>
            <div className="text-3xl text-purple-500">⚖️</div>
          </div>
        </Card>
      </div>
      
      {/* Filters */}
      <Card className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Filters</h3>
          <Button
            variant="plain"
            size="sm"
            icon={<PiSliders />}
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? 'Hide' : 'Show'} Filters
          </Button>
        </div>
        
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <Input
              placeholder="Search by customer name, cylinder code..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              prefix={<PiMagnifyingGlassDuotone />}
            />
          </div>
          <Select
            placeholder="Condition"
            options={[
              { value: 'good', label: 'Good' },
              { value: 'poor', label: 'Poor' },
              { value: 'damaged', label: 'Damaged' }
            ]}
            value={filters.condition ? { value: filters.condition, label: conditionLabels[filters.condition] } : null}
            onChange={(option) => handleFilterChange('condition', option?.value)}
            isClearable
          />
          <Button
            variant="plain"
            onClick={clearFilters}
          >
            Clear
          </Button>
        </div>
        
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
            <Input
              type="date"
              placeholder="From Date"
              value={filters.dateFrom || ''}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            />
            <Input
              type="date"
              placeholder="To Date"
              value={filters.dateTo || ''}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            />
            <Input
              type="number"
              placeholder="Lease ID"
              value={filters.leaseId || ''}
              onChange={(e) => handleFilterChange('leaseId', parseInt(e.target.value) || undefined)}
            />
            <Input
              type="number"
              placeholder="Staff ID"
              value={filters.staffId || ''}
              onChange={(e) => handleFilterChange('staffId', parseInt(e.target.value) || undefined)}
            />
          </div>
        )}
      </Card>
      
      {/* Data Table */}
      <Card>
        <DataTable
          columns={columns}
          data={swapsData?.swaps || []}
          loading={isLoading}
          compact={true}
          pagingData={{
            total: swapsData?.total || 0,
            pageIndex: (swapsData?.page || 1) - 1,
            pageSize: filters.limit || 20
          }}
          onPaginationChange={(page) => handlePageChange(page + 1)}
          className="min-h-[400px]"
        />
      </Card>
    </div>
  )
}