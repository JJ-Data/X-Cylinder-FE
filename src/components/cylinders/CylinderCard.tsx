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
    const getTypeColor = (type: string) => {
        switch (type.toUpperCase()) {
            case 'SMALL':
                return 'from-blue-50 to-blue-100 border-blue-200'
            case 'MEDIUM':
                return 'from-green-50 to-green-100 border-green-200'
            case 'LARGE':
                return 'from-orange-50 to-orange-100 border-orange-200'
            case 'INDUSTRIAL':
                return 'from-red-50 to-red-100 border-red-200'
            default:
                return 'from-gray-50 to-gray-100 border-gray-200'
        }
    }

    const getTypeIcon = (type: string) => {
        switch (type.toUpperCase()) {
            case 'SMALL':
                return '🔵'
            case 'MEDIUM':
                return '🟢'
            case 'LARGE':
                return '🟠'
            case 'INDUSTRIAL':
                return '🔴'
            default:
                return '⚪'
        }
    }

    return (
        <div className={`bg-gradient-to-br ${getTypeColor(cylinder.type)} hover:shadow-lg transition-all duration-300 p-6 rounded-xl border group cursor-pointer relative overflow-hidden`}>
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gray-900 rounded-full transform translate-x-16 -translate-y-16"></div>
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-gray-900 rounded-full transform -translate-x-10 translate-y-10"></div>
            </div>
            
            {/* Content */}
            <div className="relative">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-xl bg-white shadow-sm flex items-center justify-center group-hover:shadow-md transition-shadow">
                            <span className="text-2xl">{getTypeIcon(cylinder.type)}</span>
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 text-lg mb-1">
                                {cylinder.cylinderCode}
                            </p>
                            <p className="text-xs text-gray-600 flex items-center gap-1 bg-white/60 rounded-full px-2 py-1">
                                <PiQrCodeDuotone className="text-sm" />
                                {cylinder.qrCode}
                            </p>
                        </div>
                    </div>
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${getCylinderStatusClass(cylinder.status)} shadow-sm`}>
                        {getStatusIcon(cylinder.status)}
                        {cylinder.status.charAt(0).toUpperCase() + cylinder.status.slice(1)}
                    </div>
                </div>

                {/* Body */}
                <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/80 rounded-lg px-3 py-1.5">
                                <span className="text-sm font-semibold text-gray-700">
                                    {cylinder.type}
                                </span>
                            </div>
                            {cylinder.currentGasVolume && cylinder.maxGasVolume && (
                                <VolumeGaugeMini
                                    current={parseFloat(cylinder.currentGasVolume)}
                                    max={parseFloat(cylinder.maxGasVolume)}
                                />
                            )}
                        </div>
                    </div>
                    
                    {cylinder.currentOutlet && (
                        <div className="flex items-center gap-2 text-gray-700 bg-white/50 rounded-lg px-3 py-2">
                            <PiBuildingsDuotone className="text-base flex-shrink-0" />
                            <span className="text-sm font-medium truncate">{cylinder.currentOutlet.name}</span>
                        </div>
                    )}
                    
                    <div className="flex items-center gap-2 text-gray-600 bg-white/50 rounded-lg px-3 py-2">
                        <PiCalendarDuotone className="text-base flex-shrink-0" />
                        <span className="text-sm">
                            Last inspection: {formatDate(cylinder.lastInspectionDate)}
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-white/50">
                    <Button
                        size="sm"
                        variant="solid"
                        onClick={onView}
                        className="flex-1 bg-white/90 hover:bg-white text-gray-700 border-white/50 shadow-sm hover:shadow-md transition-all"
                    >
                        <PiEyeDuotone className="mr-2 h-4 w-4" />
                        View Details
                    </Button>
                    <Dropdown
                        renderTitle={
                            <Button
                                size="sm"
                                variant="plain"
                                className="bg-white/70 hover:bg-white/90 text-gray-600 hover:text-gray-700 border-white/50"
                            >
                                <PiDotsThreeVerticalDuotone className="h-4 w-4" />
                            </Button>
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
                        <Dropdown.Item eventKey="qr">
                            <PiQrCodeDuotone className="mr-2" />
                            View QR Code
                        </Dropdown.Item>
                    </Dropdown>
                </div>
            </div>
        </div>
    )
}

// Export the old component for backward compatibility if needed
export { CylinderCard }