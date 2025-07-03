'use client'

import { useState, useEffect } from 'react'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import DatePicker from '@/components/ui/DatePicker'
import Button from '@/components/ui/Button'
import { useOutlets } from '@/hooks/useOutlets'
import { 
  PiCalendarDuotone, 
  PiBuildingsDuotone, 
  PiMagnifyingGlassDuotone,
  PiXDuotone 
} from 'react-icons/pi'
import type { TransferFilters } from '@/types/transfer'

interface TransferHistoryFiltersProps {
  filters: TransferFilters
  onFilterChange: (filters: Partial<TransferFilters>) => void
}

export default function TransferHistoryFilters({
  filters,
  onFilterChange
}: TransferHistoryFiltersProps) {
  const { data: outletsData } = useOutlets()
  const [localFilters, setLocalFilters] = useState({
    fromDate: filters.fromDate || '',
    toDate: filters.toDate || '',
    fromOutletId: filters.fromOutletId?.toString() || '',
    toOutletId: filters.toOutletId?.toString() || '',
    cylinderCode: filters.cylinderCode || '',
    status: filters.status || ''
  })

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
    { value: 'rejected', label: 'Rejected' }
  ]

  const outletOptions = [
    { value: '', label: 'All Outlets' },
    ...(outletsData?.outlets?.map(outlet => ({
      value: outlet.id.toString(),
      label: outlet.name
    })) || [])
  ]

  const handleApplyFilters = () => {
    const appliedFilters: Partial<TransferFilters> = {}
    
    if (localFilters.fromDate) appliedFilters.fromDate = localFilters.fromDate
    if (localFilters.toDate) appliedFilters.toDate = localFilters.toDate
    if (localFilters.fromOutletId) appliedFilters.fromOutletId = Number(localFilters.fromOutletId)
    if (localFilters.toOutletId) appliedFilters.toOutletId = Number(localFilters.toOutletId)
    if (localFilters.cylinderCode) appliedFilters.cylinderCode = localFilters.cylinderCode
    if (localFilters.status) appliedFilters.status = localFilters.status
    
    onFilterChange(appliedFilters)
  }

  const handleClearFilters = () => {
    const clearedFilters = {
      fromDate: '',
      toDate: '',
      fromOutletId: '',
      toOutletId: '',
      cylinderCode: '',
      status: ''
    }
    setLocalFilters(clearedFilters)
    onFilterChange({
      fromDate: undefined,
      toDate: undefined,
      fromOutletId: undefined,
      toOutletId: undefined,
      cylinderCode: undefined,
      status: undefined
    })
  }

  const hasActiveFilters = Object.values(localFilters).some(value => value !== '')

  return (
    <AdaptiveCard>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">From Date</label>
          <DatePicker
            value={localFilters.fromDate ? new Date(localFilters.fromDate) : undefined}
            onChange={(date) => setLocalFilters(prev => ({ 
              ...prev, 
              fromDate: date ? date.toISOString().split('T')[0] : '' 
            }))}
            placeholder="Select from date"
            inputPrefix={<PiCalendarDuotone className="text-gray-400" />}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">To Date</label>
          <DatePicker
            value={localFilters.toDate ? new Date(localFilters.toDate) : undefined}
            onChange={(date) => setLocalFilters(prev => ({ 
              ...prev, 
              toDate: date ? date.toISOString().split('T')[0] : '' 
            }))}
            placeholder="Select to date"
            inputPrefix={<PiCalendarDuotone className="text-gray-400" />}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Cylinder Code</label>
          <Input
            value={localFilters.cylinderCode}
            onChange={(e) => setLocalFilters(prev => ({ ...prev, cylinderCode: e.target.value }))}
            placeholder="Search by cylinder code"
            prefix={<PiMagnifyingGlassDuotone className="text-gray-400" />}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">From Outlet</label>
          <Select
            value={outletOptions.find(opt => opt.value === localFilters.fromOutletId)}
            onChange={(option) => setLocalFilters(prev => ({ ...prev, fromOutletId: option?.value || '' }))}
            options={outletOptions}
            placeholder="Select from outlet"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">To Outlet</label>
          <Select
            value={outletOptions.find(opt => opt.value === localFilters.toOutletId)}
            onChange={(option) => setLocalFilters(prev => ({ ...prev, toOutletId: option?.value || '' }))}
            options={outletOptions}
            placeholder="Select to outlet"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <Select
            value={statusOptions.find(opt => opt.value === localFilters.status)}
            onChange={(option) => setLocalFilters(prev => ({ ...prev, status: option?.value || '' }))}
            options={statusOptions}
            placeholder="Select status"
          />
        </div>
      </div>

      <div className="flex gap-3 mt-4">
        <Button
          variant="solid"
          onClick={handleApplyFilters}
        >
          Apply Filters
        </Button>
        {hasActiveFilters && (
          <Button
            variant="plain"
            icon={<PiXDuotone />}
            onClick={handleClearFilters}
          >
            Clear Filters
          </Button>
        )}
      </div>
    </AdaptiveCard>
  )
}