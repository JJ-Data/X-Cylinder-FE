'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PiArrowLeftDuotone, PiQrCodeDuotone } from 'react-icons/pi'
import { Form, FormItem } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import Container from '@/components/shared/Container'
import BottomStickyBar from '@/components/template/BottomStickyBar'
import QRScanner from '@/components/shared/QRScanner'
import Alert from '@/components/ui/Alert'
import { useRefillMutations } from '@/hooks/useRefills'
import { useCylinder } from '@/hooks/useCylinders'
// import { formatCurrency } from '@/utils/formatCurrency'
import type { ZodType } from 'zod'
import { formatCurrency } from '@/utils/format'
import AdaptiveCard from '@/components/shared/AdaptiveCard'

const refillSchema: ZodType<RefillFormData> = z.object({
    cylinderCode: z.string().min(1, 'Cylinder code is required'),
    volume: z.number().min(0.1, 'Volume must be greater than 0'),
    cost: z.number().min(0, 'Cost must be a positive number'),
    paymentMethod: z.enum(['cash', 'card', 'mobileMoney', 'credit']),
    paymentReference: z.string().optional(),
    notes: z.string().optional(),
})

type RefillFormData = {
    cylinderCode: string
    volume: number
    cost: number
    paymentMethod: 'cash' | 'card' | 'mobileMoney' | 'credit'
    paymentReference?: string
    notes?: string
}

const paymentMethodOptions = [
    { value: 'cash', label: 'Cash' },
    { value: 'card', label: 'Card' },
    { value: 'mobileMoney', label: 'Mobile Money' },
    { value: 'credit', label: 'Credit' },
]

interface RefillFormProps {
    refillId?: number
}

export function RefillForm({}: RefillFormProps) {
    const router = useRouter()
    const [showQRScanner, setShowQRScanner] = useState(false)
    const [cylinderId, setCylinderId] = useState<number | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const { createRefill } = useRefillMutations()
    const { data: cylinder } = useCylinder(cylinderId || undefined)

    const {
        handleSubmit,
        formState: { errors },
        control,
        watch,
        setValue,
    } = useForm<RefillFormData>({
        defaultValues: {
            cylinderCode: '',
            volume: 0,
            cost: 0,
            paymentMethod: 'cash',
            paymentReference: '',
            notes: '',
        },
        resolver: zodResolver(refillSchema),
    })

    const watchedValues = watch()
    const watchedPaymentMethod = watch('paymentMethod')

    // Calculate cost based on volume (example: $10 per kg)
    useEffect(() => {
        const pricePerKg = 10
        const calculatedCost = watchedValues.volume * pricePerKg
        setValue('cost', calculatedCost)
    }, [watchedValues.volume, setValue])

    const handleQRScan = (code: string) => {
        setValue('cylinderCode', code)
        setShowQRScanner(false)
        // In real implementation, fetch cylinder by code
        // For now, simulate with a fixed ID
        setCylinderId(1)
    }

    const onSubmit = async (data: RefillFormData) => {
        setIsSubmitting(true)
        try {
            // In real implementation, get cylinderId from cylinder lookup
            const refillData = {
                ...data,
                cylinderId: cylinderId || 1,
            }
            await createRefill(refillData)
            router.push('/refill-operator/refills')
        } catch (error) {
            console.error('Failed to create refill:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <>
            <Form
                className="flex w-full h-full"
                containerClassName="flex flex-col w-full justify-between"
                onSubmit={handleSubmit(onSubmit)}
            >
                <Container>
                    {/* Header */}
                    <div className="mb-8">
                        <Button
                            size="sm"
                            variant="plain"
                            icon={<PiArrowLeftDuotone />}
                            onClick={() =>
                                router.push('/refill-operator/refills')
                            }
                        >
                            Back to Refills
                        </Button>

                        <h3 className="mb-2">Process Refill</h3>
                    </div>

                    <div className="flex flex-col gap-4">
                        {/* Cylinder Selection Section */}
                        <AdaptiveCard>
                            <div className="p-4 md:p-6">
                                <h4 className="mb-6">Cylinder Information</h4>
                                <div className="grid gap-4">
                                    <FormItem
                                        label="Cylinder Code"
                                        invalid={Boolean(errors.cylinderCode)}
                                        errorMessage={
                                            errors.cylinderCode?.message
                                        }
                                        asterisk
                                    >
                                        <div className="flex gap-2">
                                            <Controller
                                                name="cylinderCode"
                                                control={control}
                                                render={({ field }) => (
                                                    <Input
                                                        {...field}
                                                        placeholder="Enter cylinder code or scan QR"
                                                        autoComplete="off"
                                                        className="flex-1"
                                                    />
                                                )}
                                            />
                                            <Button
                                                variant="solid"
                                                icon={<PiQrCodeDuotone />}
                                                onClick={() =>
                                                    setShowQRScanner(true)
                                                }
                                            >
                                                Scan QR
                                            </Button>
                                        </div>
                                    </FormItem>

                                    {cylinder && (
                                        <Alert showIcon className="mt-4">
                                            <div>
                                                <p className="font-semibold">
                                                    Cylinder:{' '}
                                                    {cylinder.cylinderCode}
                                                </p>
                                                <p className="text-sm">
                                                    Type: {cylinder.type}
                                                </p>
                                                <p className="text-sm">
                                                    Current Gas Level:{' '}
                                                    {cylinder.currentGasVolume}/
                                                    {cylinder.maxGasVolume} kg
                                                </p>
                                                <p className="text-sm">
                                                    Status: {cylinder.status}
                                                </p>
                                                {cylinder.status !==
                                                    'refilling' && (
                                                    <p className="text-sm text-amber-600 mt-2">
                                                        Warning: Cylinder is not
                                                        in refilling status
                                                    </p>
                                                )}
                                            </div>
                                        </Alert>
                                    )}
                                </div>
                            </div>
                        </AdaptiveCard>

                        {/* Refill Details Section */}
                        <AdaptiveCard>
                            <div className="p-4 md:p-6">
                                <h4 className="mb-6">Refill Details</h4>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <FormItem
                                        label="Gas Volume (kg)"
                                        invalid={Boolean(errors.volume)}
                                        errorMessage={errors.volume?.message}
                                        asterisk
                                    >
                                        <Controller
                                            name="volume"
                                            control={control}
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    type="number"
                                                    step="0.1"
                                                    placeholder="Enter volume filled"
                                                    autoComplete="off"
                                                    onChange={(e) =>
                                                        field.onChange(
                                                            Number(
                                                                e.target.value,
                                                            ),
                                                        )
                                                    }
                                                />
                                            )}
                                        />
                                    </FormItem>

                                    <FormItem
                                        label="Cost"
                                        invalid={Boolean(errors.cost)}
                                        errorMessage={errors.cost?.message}
                                        asterisk
                                    >
                                        <Controller
                                            name="cost"
                                            control={control}
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="Calculated automatically"
                                                    autoComplete="off"
                                                    onChange={(e) =>
                                                        field.onChange(
                                                            Number(
                                                                e.target.value,
                                                            ),
                                                        )
                                                    }
                                                />
                                            )}
                                        />
                                    </FormItem>
                                </div>
                            </div>
                        </AdaptiveCard>

                        {/* Payment Section */}
                        <AdaptiveCard>
                            <div className="p-4 md:p-6">
                                <h4 className="mb-6">Payment Information</h4>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <FormItem
                                        label="Payment Method"
                                        invalid={Boolean(errors.paymentMethod)}
                                        errorMessage={
                                            errors.paymentMethod?.message
                                        }
                                        asterisk
                                    >
                                        <Controller
                                            name="paymentMethod"
                                            control={control}
                                            render={({ field }) => (
                                                <Select
                                                    {...field}
                                                    options={
                                                        paymentMethodOptions
                                                    }
                                                    placeholder="Select payment method"
                                                    value={
                                                        field.value
                                                            ? paymentMethodOptions.find(
                                                                  (opt) =>
                                                                      opt.value ===
                                                                      field.value,
                                                              )
                                                            : null
                                                    }
                                                    onChange={(option: any) => {
                                                        field.onChange(
                                                            option?.value ||
                                                                'cash',
                                                        )
                                                    }}
                                                />
                                            )}
                                        />
                                    </FormItem>

                                    {watchedPaymentMethod !== 'cash' && (
                                        <FormItem
                                            label="Payment Reference"
                                            invalid={Boolean(
                                                errors.paymentReference,
                                            )}
                                            errorMessage={
                                                errors.paymentReference?.message
                                            }
                                        >
                                            <Controller
                                                name="paymentReference"
                                                control={control}
                                                render={({ field }) => (
                                                    <Input
                                                        {...field}
                                                        placeholder="Enter transaction reference"
                                                        autoComplete="off"
                                                    />
                                                )}
                                            />
                                        </FormItem>
                                    )}
                                </div>
                            </div>
                        </AdaptiveCard>

                        {/* Additional Information Section */}
                        <AdaptiveCard>
                            <div className="p-4 md:p-6">
                                <h4 className="mb-6">Additional Information</h4>
                                <FormItem
                                    label="Notes"
                                    invalid={Boolean(errors.notes)}
                                    errorMessage={errors.notes?.message}
                                >
                                    <Controller
                                        name="notes"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                textArea
                                                rows={3}
                                                placeholder="Optional notes about the refill"
                                                autoComplete="off"
                                            />
                                        )}
                                    />
                                </FormItem>
                            </div>
                        </AdaptiveCard>

                        {/* Summary */}
                        {watchedValues.volume > 0 && (
                            <Alert showIcon>
                                <div className="flex justify-between items-center">
                                    <span>Total Amount:</span>
                                    <span className="font-bold text-lg">
                                        {formatCurrency(watchedValues.cost)}
                                    </span>
                                </div>
                            </Alert>
                        )}
                    </div>
                </Container>

                <BottomStickyBar>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="solid"
                            type="submit"
                            loading={isSubmitting}
                            disabled={isSubmitting || !cylinderId}
                        >
                            Process Refill
                        </Button>
                        <Button
                            variant="plain"
                            onClick={() =>
                                router.push('/refill-operator/refills')
                            }
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                    </div>
                </BottomStickyBar>
            </Form>

            {/* QR Scanner Dialog */}
            <QRScanner
                isOpen={showQRScanner}
                onClose={() => setShowQRScanner(false)}
                onScan={handleQRScan}
                title="Scan Cylinder QR Code"
                description="Position the QR code within the camera view to scan"
            />
        </>
    )
}

export default RefillForm
