import React from 'react'
import Select from '@/components/ui/Select'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { FiSearch, FiFilter } from 'react-icons/fi'
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
    { value: 'AVAILABLE', label: 'Available' },
    { value: 'LEASED', label: 'Leased' },
    { value: 'REFILLING', label: 'Refilling' },
    { value: 'MAINTENANCE', label: 'Maintenance' },
    { value: 'RETIRED', label: 'Retired' },
]

const cylinderTypeOptions: SelectOption[] = [
    { value: '', label: 'All Types' },
    { value: 'SMALL', label: 'Small (12kg)' },
    { value: 'MEDIUM', label: 'Medium (25kg)' },
    { value: 'LARGE', label: 'Large (50kg)' },
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

    return (
        <Card className="p-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
                {/* Search Bar */}
                <form onSubmit={handleSearchSubmit} className="flex-1">
                    <div className="relative">
                        <Input
                            placeholder="Search by cylinder code or QR..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                </form>

                {/* Filters */}
                <div className="flex flex-wrap gap-3">
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
                        className="min-w-[150px]"
                        placeholder="All Statuses"
                    />

                    <Select
                        value={cylinderTypeOptions.find(
                            (opt) => opt.value === filters.type,
                        )}
                        onChange={(option: SelectOption | null) =>
                            handleFilterChange('type', option?.value as string)
                        }
                        options={cylinderTypeOptions}
                        className="min-w-[150px]"
                        placeholder="All Types"
                    />

                    {showOutletFilter && (
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
                            className="min-w-[150px]"
                            placeholder="All Outlets"
                        />
                    )}

                    <Button
                        variant="plain"
                        size="sm"
                        onClick={handleClearFilters}
                        className="flex items-center gap-2"
                    >
                        <FiFilter />
                        Clear
                    </Button>
                </div>
            </div>
        </Card>
    )
}
