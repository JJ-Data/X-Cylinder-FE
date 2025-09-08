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
import { handleBackendValidationErrors } from '@/utils/errorHandler'
import { toast } from 'react-hot-toast'
import type { ZodType } from 'zod'
import { formatCurrency } from '@/utils/format'
import AdaptiveCard from '@/components/shared/AdaptiveCard'

const refillSchema: ZodType<RefillFormData> = z.object({
    cylinderCode: z.string().min(1, 'Cylinder code is required'),
    volume: z.number().min(0.1, 'Volume must be greater than 0'),
    cost: z.number().min(0, 'Cost must be a positive number'),
    paymentMethod: z.enum(['cash', 'pos', 'bank_transfer']),
    paymentReference: z.string().optional(),
    notes: z.string().optional(),
})

type RefillFormData = {
    cylinderCode: string
    volume: number
    cost: number
    paymentMethod: 'cash' | 'pos' | 'bank_transfer'
    paymentReference?: string
    notes?: string
}

const paymentMethodOptions = [
    { value: 'cash', label: 'Cash' },
    { value: 'pos', label: 'POS (Card Payment)' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
]

interface RefillFormProps {
    refillId?: number
}

export function RefillForm({}: RefillFormProps) {
    const router = useRouter()
    const [showQRScanner, setShowQRScanner] = useState(false)
    const [cylinderId, setCylinderId] = useState<number | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formError, setFormError] = useState<string | null>(null)

    const { createRefill } = useRefillMutations()
    const { data: cylinder } = useCylinder(cylinderId || undefined)

    const {
        handleSubmit,
        formState: { errors },
        control,
        watch,
        setValue,
        setError,
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
            setFormError(null) // Clear any previous errors
            
            // In real implementation, get cylinderId from cylinder lookup
            const refillData = {
                cylinderId: cylinderId || 1,
                preRefillVolume: data.volume, // Map volume to pre and post refill volumes
                postRefillVolume: data.volume, // This should be calculated based on actual refill
                refillCost: data.cost,
                paymentMethod: data.paymentMethod,
                paymentReference: data.paymentReference || undefined,
                notes: data.notes || undefined, // Convert empty string to undefined
            }
            
            console.log('Submitting refill data:', refillData)
            const result = await createRefill(refillData)
            
            // Navigate to receipt page if successful
            if (result && result.id) {
                toast.success('Refill recorded successfully!')
                // Navigate to receipt page for printing
                router.push(`/refill-operator/refills/${result.id}/receipt`)
            }
        } catch (error: any) {
            // Comprehensive error logging for debugging
            console.error('=== REFILL FORM ERROR DEBUG ===')
            console.error('Full error object:', error)
            console.error('Error type:', typeof error)
            console.error('Is AxiosError?:', error?.isAxiosError)
            console.error('Error response:', error?.response)
            console.error('Error response data:', error?.response?.data)
            console.error('Error response status:', error?.response?.status)
            console.error('Error message:', error?.message)
            console.error('================================')
            
            let errorMessage = 'An error occurred while creating the refill'
            
            // Try multiple error extraction methods
            if (error?.response?.data) {
                // Standard axios error with response
                errorMessage = handleBackendValidationErrors(error, setError)
                console.log('Handled as Axios error, message:', errorMessage)
            } else if (error?.data?.error) {
                // Possibly proxy-wrapped error
                errorMessage = error.data.error
                console.log('Handled as proxy error, message:', errorMessage)
                
                // Also try to set field errors if they exist
                if (error.data.errors && setError) {
                    Object.entries(error.data.errors).forEach(([field, messages]: [string, any]) => {
                        if (Array.isArray(messages) && messages.length > 0) {
                            setError(field as any, {
                                type: 'manual',
                                message: messages[0]
                            })
                        }
                    })
                }
            } else if (error?.message) {
                // Generic error with message
                errorMessage = error.message
                console.log('Handled as generic error, message:', errorMessage)
            }
            
            // Ensure error is displayed
            console.log('Setting form error:', errorMessage)
            setFormError(errorMessage)
            
            // Scroll to top to show the error alert
            window.scrollTo({ top: 0, behavior: 'smooth' })
            
            // Show toast notification
            toast.error(errorMessage, {
                duration: 5000, // Show for 5 seconds
                position: 'top-center'
            })
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

                    {/* Display form-level errors */}
                    {formError && (
                        <Alert type="danger" className="mb-6" showIcon>
                            <div>
                                <p className="font-semibold">Error Creating Refill</p>
                                <p>{formError}</p>
                            </div>
                        </Alert>
                    )}

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
