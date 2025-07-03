'use client'

import { PiCheckCircleDuotone } from 'react-icons/pi'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import type { Outlet } from '@/types/outlet'
import type { Cylinder } from '@/types/cylinder'
import { transferReasons } from '../TransferWizard.constants'
import type { TransferReason, TransferType } from '../TransferWizard.types'

interface TransferSuccessProps {
    transferType: TransferType
    selectedCylinder: Cylinder | null
    selectedCylindersCount: number
    destinationOutlet: Outlet | undefined
    reason: TransferReason
    customReason?: string
}

export const TransferSuccess: React.FC<TransferSuccessProps> = ({
    transferType,
    selectedCylinder,
    selectedCylindersCount,
    destinationOutlet,
    reason,
    customReason,
}) => {
    return (
        <Container>
            <AdaptiveCard className="max-w-2xl mx-auto mt-20 p-8 text-center">
                <div className="flex justify-center mb-4">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                        <PiCheckCircleDuotone className="h-12 w-12 text-green-500" />
                    </div>
                </div>
                <h3 className="text-2xl font-semibold mb-2">
                    Transfer Completed!
                </h3>
                <p className="text-gray-600 mb-6">
                    {transferType === 'single'
                        ? `Cylinder ${selectedCylinder?.cylinderCode} has been successfully transferred.`
                        : `${selectedCylindersCount} cylinders have been successfully transferred.`}
                </p>
                <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                    <p className="mb-1">
                        To:{' '}
                        <span className="font-medium text-gray-900">
                            {destinationOutlet?.name}
                        </span>
                    </p>
                    <p>
                        Reason:{' '}
                        <span className="font-medium text-gray-900">
                            {reason === 'other'
                                ? customReason
                                : transferReasons.find(
                                      (r) => r.value === reason,
                                  )?.label}
                        </span>
                    </p>
                </div>
            </AdaptiveCard>
        </Container>
    )
}