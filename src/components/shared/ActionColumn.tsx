'use client'

import Button from '@/components/ui/Button'
import Dropdown from '@/components/ui/Dropdown'
import { FiMoreVertical } from 'react-icons/fi'
import type { ReactNode } from 'react'

export interface ActionItem {
    label: string
    onClick: () => void
    icon?: ReactNode
    className?: string
    disabled?: boolean
    divider?: boolean
}

interface ActionColumnProps<T = any> {
    row: { original: T }
    actions: ActionItem[]
    className?: string
}

export default function ActionColumn<T = any>({
    row: _row,
    actions,
    className,
}: ActionColumnProps<T>) {
    // Filter out disabled actions
    const visibleActions = actions.filter((action) => !action.disabled)

    if (visibleActions.length === 0) {
        return null
    }

    // If only one or two actions, show them as inline buttons
    if (visibleActions.length <= 2) {
        return (
            <div
                className={`flex items-center justify-end gap-2 ${className || ''}`}
            >
                {visibleActions.map((action, index) => (
                    <Button
                        key={index}
                        size="xs"
                        variant="plain"
                        icon={action.icon}
                        onClick={action.onClick}
                        className={action.className}
                    />
                ))}
            </div>
        )
    }

    // For more actions, use a dropdown menu
    return (
        <div className={`flex items-center justify-end ${className || ''}`}>
            <Dropdown
                renderTitle={
                    <Button
                        variant="plain"
                        size="sm"
                        className="p-1 hover:bg-gray-100 rounded"
                    >
                        <FiMoreVertical className="text-lg" />
                    </Button>
                }
                placement="bottom-end"
            >
                {visibleActions.map((action, index) => (
                    <div key={index}>
                        {action.divider && index > 0 && (
                            <div className="border-t border-gray-200 my-1" />
                        )}
                        <Dropdown.Item
                            onClick={action.onClick}
                            className={action.className}
                        >
                            {action.icon && (
                                <span className="mr-2">{action.icon}</span>
                            )}
                            {action.label}
                        </Dropdown.Item>
                    </div>
                ))}
            </Dropdown>
        </div>
    )
}
