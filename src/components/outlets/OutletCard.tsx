'use client'

import Card from '@/components/ui/Card'
import Tag from '@/components/ui/Tag'
import Button from '@/components/ui/Button'
import Dropdown from '@/components/ui/Dropdown'
import { 
    PiMapPinDuotone, 
    PiPhoneDuotone, 
    PiEnvelopeDuotone, 
    PiUserGearDuotone,
    PiEyeDuotone,
    PiPencilDuotone,
    PiDotsThreeVerticalDuotone,
    PiCheckCircleDuotone,
    PiXCircleDuotone
} from 'react-icons/pi'
import type { Outlet } from '@/types/outlet'

type OutletCardProps = {
    outlet: Outlet
    onView?: () => void
    onEdit?: () => void
    isMobileView?: boolean
}

const getStatusStyle = (status: string) => {
    switch (status) {
        case 'active':
            return {
                color: 'text-green-700',
                bgColor: 'bg-green-100',
                borderColor: 'border-green-200',
                icon: <PiCheckCircleDuotone className="text-green-600" />
            }
        case 'inactive':
            return {
                color: 'text-red-700',
                bgColor: 'bg-red-100',
                borderColor: 'border-red-200',
                icon: <PiXCircleDuotone className="text-red-600" />
            }
        default:
            return {
                color: 'text-gray-700',
                bgColor: 'bg-gray-100',
                borderColor: 'border-gray-200',
                icon: null
            }
    }
}

const OutletCard = ({ outlet, onView, onEdit, isMobileView = false }: OutletCardProps) => {
    const statusStyle = getStatusStyle(outlet.status)
    
    // Mobile card view
    if (isMobileView) {
        return (
            <Card className="hover:shadow-md transition-shadow duration-200 p-4">
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <p className="text-sm font-semibold text-gray-900">
                            {outlet.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <PiMapPinDuotone className="text-sm" />
                            {outlet.location}
                        </p>
                    </div>
                    <Tag className={`${statusStyle.color} ${statusStyle.bgColor} ${statusStyle.borderColor} border text-xs`}>
                        {outlet.status}
                    </Tag>
                </div>
                
                <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                        <PiPhoneDuotone className="text-gray-400" />
                        <span>{outlet.contactPhone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <PiUserGearDuotone className="text-gray-400" />
                        <span>
                            {outlet.manager 
                                ? `${outlet.manager.firstName} ${outlet.manager.lastName}`
                                : 'No manager'
                            }
                        </span>
                    </div>
                </div>
                
                <div className="flex gap-2 mt-4 pt-3 border-t">
                    <Button
                        size="sm"
                        variant="plain"
                        icon={<PiEyeDuotone />}
                        onClick={onView}
                        className="flex-1"
                    >
                        View Details
                    </Button>
                    {outlet.status === 'active' && (
                        <Dropdown
                            renderTitle={
                                <Button
                                    size="sm"
                                    variant="plain"
                                    icon={<PiDotsThreeVerticalDuotone />}
                                />
                            }
                        >
                                <Dropdown.Item
                                    eventKey="edit"
                                    onClick={onEdit}
                                >
                                    <PiPencilDuotone className="mr-2" />
                                    Edit Outlet
                                </Dropdown.Item>
                        </Dropdown>
                    )}
                </div>
            </Card>
        )
    }
    
    // Desktop detail card view
    return (
        <Card>
            <div className="flex items-start justify-between mb-6">
                <h4 className="text-xl font-semibold">{outlet.name}</h4>
                <Tag className={`${statusStyle.color} ${statusStyle.bgColor} ${statusStyle.borderColor} border`}>
                    <span className="capitalize flex items-center gap-1">
                        {statusStyle.icon}
                        {outlet.status}
                    </span>
                </Tag>
            </div>

            <div className="space-y-4">
                {/* Location */}
                <div className="flex items-start gap-3">
                    <div className="mt-1">
                        <PiMapPinDuotone className="text-gray-500 text-lg" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Location
                        </p>
                        <p className="text-gray-900 dark:text-gray-100">{outlet.location}</p>
                    </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-3">
                    <div className="mt-1">
                        <PiPhoneDuotone className="text-gray-500 text-lg" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Contact Phone
                        </p>
                        <a
                            href={`tel:${outlet.contactPhone}`}
                            className="text-gray-900 dark:text-gray-100 hover:text-primary"
                        >
                            {outlet.contactPhone}
                        </a>
                    </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-3">
                    <div className="mt-1">
                        <PiEnvelopeDuotone className="text-gray-500 text-lg" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Contact Email
                        </p>
                        <a
                            href={`mailto:${outlet.contactEmail}`}
                            className="text-gray-900 dark:text-gray-100 hover:text-primary"
                        >
                            {outlet.contactEmail}
                        </a>
                    </div>
                </div>

                {/* Manager */}
                <div className="flex items-start gap-3">
                    <div className="mt-1">
                        <PiUserGearDuotone className="text-gray-500 text-lg" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Manager
                        </p>
                        {outlet.manager ? (
                            <p className="text-gray-900 dark:text-gray-100">
                                {outlet.manager.firstName} {outlet.manager.lastName}
                            </p>
                        ) : (
                            <p className="text-gray-500">No manager assigned</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Timestamps */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between text-sm">
                    <div>
                        <p className="text-gray-600 dark:text-gray-400">Created</p>
                        <p className="font-medium">
                            {new Date(outlet.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-gray-600 dark:text-gray-400">Last Updated</p>
                        <p className="font-medium">
                            {new Date(outlet.updatedAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>
            </div>
        </Card>
    )
}

export default OutletCard