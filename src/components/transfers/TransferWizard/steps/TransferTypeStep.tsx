'use client'

import { Controller } from 'react-hook-form'
import {
    PiMagnifyingGlassDuotone,
    PiArrowsLeftRightDuotone,
} from 'react-icons/pi'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Radio from '@/components/ui/Radio'
import type { Control } from 'react-hook-form'
import type { TransferFormData } from '../TransferWizard.types'

interface TransferTypeStepProps {
    control: Control<TransferFormData>
    onTypeChange: (type: 'single' | 'bulk') => void
}

export const TransferTypeStep: React.FC<TransferTypeStepProps> = ({
    control,
    onTypeChange,
}) => {
    return (
        <AdaptiveCard>
            <div className="p-4 md:p-6">
                <h4 className="text-lg font-semibold mb-4 md:mb-6">
                    Select Transfer Type
                </h4>
                <Controller
                    name="transferType"
                    control={control}
                    render={({ field }) => (
                        <Radio.Group
                            {...field}
                            value={field.value}
                            onChange={(value) => {
                                field.onChange(value)
                                onTypeChange(value as 'single' | 'bulk')
                            }}
                        >
                            <div className="grid md:grid-cols-2 gap-4">
                                <Radio value="single">
                                    <AdaptiveCard className="p-4 md:p-6 cursor-pointer hover:border-blue-500 transition-colors">
                                        <div className="text-center">
                                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <PiMagnifyingGlassDuotone className="h-8 w-8 text-blue-600" />
                                            </div>
                                            <h5 className="font-medium text-base mb-2">
                                                Single Cylinder Transfer
                                            </h5>
                                            <p className="text-sm text-gray-600">
                                                Search for a specific
                                                cylinder by code or scan QR
                                            </p>
                                        </div>
                                    </AdaptiveCard>
                                </Radio>

                                <Radio value="bulk">
                                    <AdaptiveCard className="p-4 md:p-6 cursor-pointer hover:border-blue-500 transition-colors">
                                        <div className="text-center">
                                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <PiArrowsLeftRightDuotone className="h-8 w-8 text-blue-600" />
                                            </div>
                                            <h5 className="font-medium text-base mb-2">
                                                Bulk Transfer
                                            </h5>
                                            <p className="text-sm text-gray-600">
                                                Transfer multiple cylinders
                                                from one outlet to another
                                            </p>
                                        </div>
                                    </AdaptiveCard>
                                </Radio>
                            </div>
                        </Radio.Group>
                    )}
                />
            </div>
        </AdaptiveCard>
    )
}