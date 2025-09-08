import React from 'react'
import Select from '@/components/ui/Select'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { 
    PiMagnifyingGlassDuotone, 
    PiFunnelDuotone, 
    PiXDuotone,
    PiSlidersHorizontalDuotone,
    PiCheckCircleDuotone,
    PiClockDuotone,
    PiGasPumpDuotone,
    PiToolboxDuotone,
    PiWarningCircleDuotone
} from 'react-icons/pi'
import { CylinderStatus } from '../shared/StatusBadge'

interface CylinderFiltersProps {
    onFilterChange: (filters: CylinderFilterValues) => void
    onSearch: (searchTerm: string) => void
    showOutletFilter?: boolean
}

export interface CylinderFilterValues {
    status?: CylinderStatus | ''
    type?: string
    outlet?: number
    capacity?: string
}

interface SelectOption {
    value: string | number
    label: string
}

const cylinderStatusOptions: SelectOption[] = [
    { value: '', label: 'All Statuses' },
    { value: 'AVAILABLE', label: '✅ Available' },
    { value: 'LEASED', label: '👤 Leased' },
    { value: 'IN_REFILL', label: '⛽ In Refill' },
    { value: 'MAINTENANCE', label: '🔧 Maintenance' },
    { value: 'DAMAGED', label: '⚠️ Damaged' },
]

const cylinderTypeOptions: SelectOption[] = [
    { value: '', label: 'All Types' },
    { value: 'SMALL', label: '🔵 Small (5kg)' },
    { value: 'MEDIUM', label: '🟢 Medium (12kg)' },
    { value: 'LARGE', label: '🟠 Large (25kg)' },
    { value: 'INDUSTRIAL', label: '🔴 Industrial (50kg)' },
]

const capacityOptions: SelectOption[] = [
    { value: '', label: 'All Capacities' },
    { value: '5kg', label: '5kg' },
    { value: '10kg', label: '10kg' },
    { value: '12kg', label: '12kg' },
    { value: '15kg', label: '15kg' },
    { value: '20kg', label: '20kg' },
    { value: '25kg', label: '25kg' },
    { value: '45kg', label: '45kg' },
    { value: '50kg', label: '50kg' },
]

export const CylinderFilters: React.FC<CylinderFiltersProps> = ({
    onFilterChange,
    onSearch,
    showOutletFilter = false,
}) => {
    const [filters, setFilters] = React.useState<CylinderFilterValues>({
        status: '',
        type: '',
        outlet: undefined,
        capacity: '',
    })
    const [searchTerm, setSearchTerm] = React.useState('')
    const [showAdvanced, setShowAdvanced] = React.useState(false)

    const handleFilterChange = (
        key: keyof CylinderFilterValues,
        value: string | number | undefined,
    ) => {
        const newFilters = { ...filters, [key]: value }
        setFilters(newFilters)
        onFilterChange(newFilters)
    }

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSearch(searchTerm)
    }

    const handleClearFilters = () => {
        const clearedFilters: CylinderFilterValues = {
            status: '',
            type: '',
            outlet: undefined,
            capacity: '',
        }
        setFilters(clearedFilters)
        setSearchTerm('')
        onFilterChange(clearedFilters)
        onSearch('')
    }

    const activeFiltersCount = Object.values(filters).filter(
        value => value !== '' && value !== undefined
    ).length + (searchTerm ? 1 : 0)

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <PiFunnelDuotone className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            Search & Filter
                        </h3>
                        <p className="text-sm text-gray-600">
                            {activeFiltersCount > 0 ? `${activeFiltersCount} active filter${activeFiltersCount > 1 ? 's' : ''}` : 'No filters applied'}
                        </p>
                    </div>
                </div>
                <Button
                    variant="plain"
                    size="sm"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center gap-2"
                >
                    <PiSlidersHorizontalDuotone className="h-4 w-4" />
                    {showAdvanced ? 'Simple' : 'Advanced'}
                </Button>
            </div>
            
            <div className="space-y-4">
                {/* Search Bar */}
                <form onSubmit={handleSearchSubmit}>
                    <div className="relative">
                        <Input
                            placeholder="Search by cylinder code, QR code, or notes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-12 h-12 text-base"
                        />
                        <PiMagnifyingGlassDuotone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        {searchTerm && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchTerm('')
                                    onSearch('')
                                }}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <PiXDuotone className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                </form>

                {/* Basic Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status
                        </label>
                        <Select
                            value={cylinderStatusOptions.find(
                                (opt) => opt.value === filters.status,
                            )}
                            onChange={(option: SelectOption | null) =>
                                handleFilterChange(
                                    'status',
                                    option?.value as CylinderStatus | '',
                                )
                            }
                            options={cylinderStatusOptions}
                            placeholder="All Statuses"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Type
                        </label>
                        <Select
                            value={cylinderTypeOptions.find(
                                (opt) => opt.value === filters.type,
                            )}
                            onChange={(option: SelectOption | null) =>
                                handleFilterChange('type', option?.value as string)
                            }
                            options={cylinderTypeOptions}
                            placeholder="All Types"
                        />
                    </div>

                    {showAdvanced && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Capacity
                            </label>
                            <Select
                                value={capacityOptions.find(
                                    (opt) => opt.value === filters.capacity,
                                )}
                                onChange={(option: SelectOption | null) =>
                                    handleFilterChange('capacity', option?.value as string)
                                }
                                options={capacityOptions}
                                placeholder="All Capacities"
                            />
                        </div>
                    )}

                    {showOutletFilter && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Outlet
                            </label>
                            <Select
                                value={
                                    filters.outlet
                                        ? {
                                              value: filters.outlet,
                                              label: `Outlet ${filters.outlet}`,
                                          }
                                        : null
                                }
                                onChange={(option: SelectOption | null) =>
                                    handleFilterChange(
                                        'outlet',
                                        option ? Number(option.value) : undefined,
                                    )
                                }
                                options={[]} // Would be populated from store
                                placeholder="All Outlets"
                            />
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                {activeFiltersCount > 0 && (
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <span className="text-sm text-gray-600">
                            {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} applied
                        </span>
                        <Button
                            variant="plain"
                            size="sm"
                            onClick={handleClearFilters}
                            className="flex items-center gap-2 text-red-600 hover:text-red-700"
                        >
                            <PiXDuotone className="h-4 w-4" />
                            Clear All Filters
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
