'use client'

import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Button from '@/components/ui/Button'
import Tag from '@/components/ui/Tag'
import Dropdown from '@/components/ui/Dropdown'
import { VolumeGaugeMini } from '@/components/shared/VolumeGauge'
import {
    PiEyeDuotone,
    PiPencilDuotone,
    PiDotsThreeVerticalDuotone,
    PiCubeDuotone,
    PiBuildingsDuotone,
    PiCalendarDuotone,
    PiCheckCircleDuotone,
    PiClockDuotone,
    PiWarningDuotone,
    PiToolboxDuotone,
    PiArchiveDuotone,
    PiGasPumpDuotone,
    PiQrCodeDuotone,
    PiArrowsLeftRightDuotone,
} from 'react-icons/pi'
import { formatDate } from '@/utils/formatDate'
import type { Cylinder } from '@/types/cylinder'

interface CylinderCardProps {
    cylinder: Cylinder
    onView?: () => void
    onEdit?: () => void
    onTransfer?: () => void
}

const getStatusIcon = (status: string) => {
    switch (status) {
        case 'available':
            return <PiCheckCircleDuotone />
        case 'leased':
            return <PiClockDuotone />
        case 'refilling':
            return <PiGasPumpDuotone />
        case 'maintenance':
            return <PiToolboxDuotone />
        case 'damaged':
            return <PiWarningDuotone />
        case 'retired':
            return <PiArchiveDuotone />
        default:
            return <PiCubeDuotone />
    }
}

const getCylinderStatusClass = (status: string) => {
    switch (status) {
        case 'available':
            return 'bg-emerald-500 text-white'
        case 'leased':
            return 'bg-blue-500 text-white'
        case 'refilling':
            return 'bg-yellow-500 text-white'
        case 'maintenance':
            return 'bg-orange-500 text-white'
        case 'damaged':
            return 'bg-red-500 text-white'
        case 'retired':
            return 'bg-gray-500 text-white'
        default:
            return 'bg-gray-500 text-white'
    }
}

export default function CylinderCard({ cylinder, onView, onEdit, onTransfer }: CylinderCardProps) {
    return (
        <AdaptiveCard className="hover:shadow-md transition-shadow duration-200 p-4">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                        <PiCubeDuotone className="text-2xl text-gray-600" />
                    </div>
                    <div>
                        <p className="font-semibold text-gray-900">
                            {cylinder.cylinderCode}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <PiQrCodeDuotone className="text-sm" />
                            {cylinder.qrCode}
                        </p>
                    </div>
                </div>
                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getCylinderStatusClass(cylinder.status)}`}>
                    {getStatusIcon(cylinder.status)}
                    {cylinder.status.charAt(0).toUpperCase() + cylinder.status.slice(1)}
                </div>
            </div>

            <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Tag className="bg-blue-100 text-blue-700 border-blue-200 border text-xs">
                            {cylinder.type}
                        </Tag>
                        <VolumeGaugeMini
                            current={parseFloat(cylinder.currentGasVolume)}
                            max={parseFloat(cylinder.maxGasVolume)}
                        />
                    </div>
                </div>
                
                {cylinder.currentOutlet && (
                    <div className="flex items-center gap-2 text-gray-600">
                        <PiBuildingsDuotone className="text-sm" />
                        <span>{cylinder.currentOutlet.name}</span>
                    </div>
                )}
                
                <div className="flex items-center gap-2 text-gray-500">
                    <PiCalendarDuotone className="text-sm" />
                    <span>Last inspection: {formatDate(cylinder.lastInspectionDate)}</span>
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
                <Dropdown
                    renderTitle={
                        <Button
                            size="sm"
                            variant="plain"
                            icon={<PiDotsThreeVerticalDuotone />}
                        />
                    }
                >
                    {onEdit && (
                        <Dropdown.Item eventKey="edit" onClick={onEdit}>
                            <PiPencilDuotone className="mr-2" />
                            Edit Cylinder
                        </Dropdown.Item>
                    )}
                    {onTransfer && (
                        <Dropdown.Item eventKey="transfer" onClick={onTransfer}>
                            <PiArrowsLeftRightDuotone className="mr-2" />
                            Transfer
                        </Dropdown.Item>
                    )}
                </Dropdown>
            </div>
        </AdaptiveCard>
    )
}

// Export the old component for backward compatibility if needed
export { CylinderCard }