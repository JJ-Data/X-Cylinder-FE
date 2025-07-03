import React from 'react'
import classNames from '@/utils/classNames'

export type CylinderStatus =
    | 'AVAILABLE'
    | 'LEASED'
    | 'REFILLING'
    | 'MAINTENANCE'
    | 'RETIRED'
export type LeaseStatus = 'ACTIVE' | 'RETURNED' | 'OVERDUE' | 'CANCELLED'
export type PaymentStatus = 'PAID' | 'PENDING' | 'OVERDUE' | 'PARTIAL'

type StatusType = CylinderStatus | LeaseStatus | PaymentStatus

interface StatusBadgeProps {
    status: StatusType
    type?: 'cylinder' | 'lease' | 'payment'
    className?: string
}

const statusConfig: Record<StatusType, { color: string; label: string }> = {
    // Cylinder statuses
    AVAILABLE: { color: 'green', label: 'Available' },
    LEASED: { color: 'blue', label: 'Leased' },
    REFILLING: { color: 'yellow', label: 'Refilling' },
    MAINTENANCE: { color: 'orange', label: 'Maintenance' },
    RETIRED: { color: 'gray', label: 'Retired' },

    // Lease statuses
    ACTIVE: { color: 'blue', label: 'Active' },
    RETURNED: { color: 'green', label: 'Returned' },
    OVERDUE: { color: 'red', label: 'Overdue' },
    CANCELLED: { color: 'gray', label: 'Cancelled' },

    // Payment statuses
    PAID: { color: 'green', label: 'Paid' },
    PENDING: { color: 'yellow', label: 'Pending' },
    PARTIAL: { color: 'orange', label: 'Partial' },
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
    status,
    className = '',
}) => {
    const config = statusConfig[status]

    if (!config) {
        return (
            <span
                className={classNames(
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
                    className,
                )}
            >
                {status}
            </span>
        )
    }

    const colorVariants: Record<string, string> = {
        green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
        red: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        gray: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
    }

    return (
        <span
            className={classNames(
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                colorVariants[config.color],
                className,
            )}
        >
            {config.label}
        </span>
    )
}
