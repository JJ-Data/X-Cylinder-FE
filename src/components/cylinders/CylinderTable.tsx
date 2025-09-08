import React from 'react'
import { Table } from '@/components/ui'
import Button from '@/components/ui/Button'
import { StatusBadge, CylinderStatus } from '../shared/StatusBadge'
import { FiEdit, FiTruck, FiEye } from 'react-icons/fi'
import { BiQr } from 'react-icons/bi'

type CylinderType = string // Accept any string value from API

interface Cylinder {
    id: number
    code?: string
    cylinderCode?: string // API might use this instead of code
    type: string // Accept any string value from API
    capacity?: number
    status: string // Accept any string value from API  
    qrCode?: string
    outletId?: number
    outletName?: string
    currentOutletId?: number // API might use this
    currentLease?: {
        id: number
        customerId: number
        customerName: string
        startDate: string
        dueDate?: string
    }
    lastRefill?: {
        date: string
        volume: number
        cost: number
    }
}

type UserRole = 'ADMIN' | 'STAFF' | 'REFILL_OP' | 'CUSTOMER'

interface CylinderTableProps {
    cylinders: Cylinder[]
    onView?: (cylinder: Cylinder) => void
    onEdit?: (cylinder: Cylinder) => void
    onViewQR?: (cylinder: Cylinder) => void
    onAssignLease?: (cylinder: Cylinder) => void
    onRefill?: (cylinder: Cylinder) => void
    onTransfer?: (cylinder: Cylinder) => void
    role?: UserRole
    loading?: boolean
}

type SortDirection = 'asc' | 'desc' | null

interface SortConfig {
    field: keyof Cylinder | null
    direction: SortDirection
}

const cylinderTypeConfig: Record<string, { label: string; capacity: string }> = {
    // Handle actual API values (weight-based)
    '5kg': { label: 'Small', capacity: '5kg' },
    '10kg': { label: 'Medium', capacity: '10kg' },
    '12kg': { label: 'Medium', capacity: '12kg' },
    '15kg': { label: 'Medium', capacity: '15kg' },
    '20kg': { label: 'Large', capacity: '20kg' },
    '25kg': { label: 'Large', capacity: '25kg' },
    '45kg': { label: 'Industrial', capacity: '45kg' },
    '50kg': { label: 'Industrial', capacity: '50kg' },
    // Fallback for enum values (backward compatibility)
    'SMALL': { label: 'Small', capacity: '5kg' },
    'MEDIUM': { label: 'Medium', capacity: '12kg' },
    'LARGE': { label: 'Large', capacity: '25kg' },
    'INDUSTRIAL': { label: 'Industrial', capacity: '50kg' },
}

export const CylinderTable: React.FC<CylinderTableProps> = ({
    cylinders,
    onView,
    onEdit,
    onViewQR,
    onAssignLease,
    onRefill,
    onTransfer,
    role = 'STAFF',
    loading = false,
}) => {
    const [sortConfig, setSortConfig] = React.useState<SortConfig>({
        field: null,
        direction: null,
    })

    // Handle sorting
    const handleSort = (field: keyof Cylinder) => {
        setSortConfig((prev) => ({
            field,
            direction:
                prev.field === field && prev.direction === 'asc'
                    ? 'desc'
                    : 'asc',
        }))
    }

    // Sort cylinders based on current sort config
    const sortedCylinders = React.useMemo(() => {
        if (!sortConfig.field || !sortConfig.direction) {
            return cylinders
        }

        return [...cylinders].sort((a, b) => {
            const aValue = a[sortConfig.field!]
            const bValue = b[sortConfig.field!]

            // Handle undefined/null values
            if (aValue == null && bValue == null) return 0
            if (aValue == null) return 1
            if (bValue == null) return -1

            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
            return 0
        })
    }, [cylinders, sortConfig])

    // Render action buttons based on role
    const renderActionButtons = (cylinder: Cylinder) => (
        <div className="flex items-center gap-2">
            <Button
                variant="plain"
                size="xs"
                onClick={() => onView?.(cylinder)}
                aria-label="View details"
            >
                <FiEye />
            </Button>

            {(role === 'ADMIN' || role === 'STAFF') && (
                <Button
                    variant="plain"
                    size="xs"
                    onClick={() => onViewQR?.(cylinder)}
                    aria-label="View QR code"
                >
                    <BiQr />
                </Button>
            )}

            {(role === 'STAFF' || role === 'ADMIN') &&
                cylinder.status === 'AVAILABLE' && (
                    <Button
                        variant="plain"
                        size="xs"
                        onClick={() => onAssignLease?.(cylinder)}
                        aria-label="Assign lease"
                    >
                        <FiEdit />
                    </Button>
                )}

            {role === 'REFILL_OP' && cylinder.status === 'AVAILABLE' && (
                <Button
                    variant="plain"
                    size="xs"
                    onClick={() => onRefill?.(cylinder)}
                    aria-label="Record refill"
                >
                    <FiEdit />
                </Button>
            )}

            {role === 'ADMIN' && (
                <>
                    <Button
                        variant="plain"
                        size="xs"
                        onClick={() => onTransfer?.(cylinder)}
                        aria-label="Transfer"
                    >
                        <FiTruck />
                    </Button>
                    <Button
                        variant="plain"
                        size="xs"
                        onClick={() => onEdit?.(cylinder)}
                        aria-label="Edit"
                    >
                        <FiEdit />
                    </Button>
                </>
            )}
        </div>
    )

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <Table hoverable cellBorder overflow>
            <Table.THead>
                <Table.Tr>
                    <Table.Th
                        className="cursor-pointer"
                        onClick={() => handleSort('code')}
                    >
                        Code
                        <Table.Sorter
                            sort={
                                sortConfig.field === 'code'
                                    ? sortConfig.direction || true
                                    : false
                            }
                        />
                    </Table.Th>
                    <Table.Th
                        className="cursor-pointer"
                        onClick={() => handleSort('type')}
                    >
                        Type
                        <Table.Sorter
                            sort={
                                sortConfig.field === 'type'
                                    ? sortConfig.direction || true
                                    : false
                            }
                        />
                    </Table.Th>
                    <Table.Th
                        className="cursor-pointer"
                        onClick={() => handleSort('status')}
                    >
                        Status
                        <Table.Sorter
                            sort={
                                sortConfig.field === 'status'
                                    ? sortConfig.direction || true
                                    : false
                            }
                        />
                    </Table.Th>
                    {role === 'ADMIN' && <Table.Th>Outlet</Table.Th>}
                    <Table.Th>Customer</Table.Th>
                    {(role === 'STAFF' ||
                        role === 'REFILL_OP' ||
                        role === 'ADMIN') && <Table.Th>Last Refill</Table.Th>}
                    <Table.Th>Actions</Table.Th>
                </Table.Tr>
            </Table.THead>
            <Table.TBody>
                {sortedCylinders.map((cylinder) => (
                    <Table.Tr key={cylinder.id}>
                        <Table.Td>
                            <span className="font-medium">
                                {cylinder.code || cylinder.cylinderCode || `ID-${cylinder.id}`}
                            </span>
                        </Table.Td>
                        <Table.Td>
                            {(() => {
                                const config = cylinderTypeConfig[cylinder.type]
                                if (!config) {
                                    // Fallback for unknown types
                                    console.warn(`Unknown cylinder type: ${cylinder.type}`)
                                    return `${cylinder.type} (Unknown)`
                                }
                                return `${config.label} (${config.capacity})`
                            })()}
                        </Table.Td>
                        <Table.Td>
                            <StatusBadge
                                status={cylinder.status?.toUpperCase() as any}
                                type="cylinder"
                            />
                        </Table.Td>
                        {role === 'ADMIN' && (
                            <Table.Td>
                                {cylinder.outletName ||
                                    `Outlet ${cylinder.outletId || cylinder.currentOutletId || 'Unknown'}`}
                            </Table.Td>
                        )}
                        <Table.Td>
                            {cylinder.currentLease ? (
                                <div>
                                    <p className="font-medium">
                                        {cylinder.currentLease.customerName}
                                    </p>
                                    {cylinder.currentLease.dueDate && (
                                        <p className="text-xs text-gray-500">
                                            Due:{' '}
                                            {new Date(
                                                cylinder.currentLease.dueDate,
                                            ).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <span className="text-gray-400">-</span>
                            )}
                        </Table.Td>
                        {(role === 'STAFF' ||
                            role === 'REFILL_OP' ||
                            role === 'ADMIN') && (
                            <Table.Td>
                                {cylinder.lastRefill ? (
                                    <div>
                                        <p className="font-medium">
                                            {new Date(
                                                cylinder.lastRefill.date,
                                            ).toLocaleDateString()}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {cylinder.lastRefill.volume}L
                                        </p>
                                    </div>
                                ) : (
                                    <span className="text-gray-400">-</span>
                                )}
                            </Table.Td>
                        )}
                        <Table.Td>{renderActionButtons(cylinder)}</Table.Td>
                    </Table.Tr>
                ))}
            </Table.TBody>
        </Table>
    )
}

