import {
    PiArrowsLeftRightDuotone,
    PiMagnifyingGlassDuotone,
    PiTruckDuotone,
    PiCheckCircleDuotone,
    PiScalesDuotone,
    PiUserDuotone,
    PiWrenchDuotone,
    PiSirenDuotone,
    PiStorefrontDuotone,
    PiNotePencilDuotone,
} from 'react-icons/pi'
import type { TransferReasonOption, TransferStep } from './TransferWizard.types'

export const transferReasons: TransferReasonOption[] = [
    {
        value: 'balancing',
        label: 'Stock Balancing',
        icon: <PiScalesDuotone className="text-2xl" />,
    },
    {
        value: 'request',
        label: 'Customer Request',
        icon: <PiUserDuotone className="text-2xl" />,
    },
    {
        value: 'maintenance',
        label: 'Maintenance Required',
        icon: <PiWrenchDuotone className="text-2xl" />,
    },
    {
        value: 'emergency',
        label: 'Emergency Supply',
        icon: <PiSirenDuotone className="text-2xl" />,
    },
    {
        value: 'closure',
        label: 'Outlet Closure',
        icon: <PiStorefrontDuotone className="text-2xl" />,
    },
    {
        value: 'other',
        label: 'Other Reason',
        icon: <PiNotePencilDuotone className="text-2xl" />,
    },
]

export const steps: TransferStep[] = [
    { label: 'Transfer Type', icon: <PiArrowsLeftRightDuotone /> },
    { label: 'Select Cylinders', icon: <PiMagnifyingGlassDuotone /> },
    { label: 'Destination & Reason', icon: <PiTruckDuotone /> },
    { label: 'Review & Confirm', icon: <PiCheckCircleDuotone /> },
]