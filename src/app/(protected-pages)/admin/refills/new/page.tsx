'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
    PiArrowLeftDuotone,
    PiCheckDuotone,
    PiQrCodeDuotone,
} from 'react-icons/pi'
import Container from '@/components/shared/Container'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Alert from '@/components/ui/Alert'
import { FormItem } from '@/components/ui/Form'
import { useCylinders } from '@/hooks/useCylinders'
import { useRefillMutations } from '@/hooks/useRefills'
import CylinderQRScanner from '@/components/cylinders/CylinderQRScanner'
import { useSession } from 'next-auth/react'
import { toast } from 'react-hot-toast'
import type { CreateRefillDto } from '@/services/api/refill.service'
import { handleBackendValidationErrors } from '@/utils/errorHandler'

const refillSchema = z
    .object({
        cylinderId: z.number().min(1, 'Cylinder is required'),
        preRefillVolume: z
            .number()
            .min(0, 'Pre-refill volume must be 0 or greater'),
        postRefillVolume: z
            .number()
            .min(0.1, 'Post-refill volume must be greater than 0'),
        refillCost: z
            .number()
            .min(0, 'Cost must be a positive number')
            .optional(),
        paymentMethod: z.enum(['cash', 'pos', 'bank_transfer']).default('cash'),
        paymentReference: z.string().optional(),
        notes: z.string().optional(),
        batchNumber: z.string().optional(),
    })
    .refine((data) => data.postRefillVolume > data.preRefillVolume, {
        message: 'Post-refill volume must be greater than pre-refill volume',
        path: ['postRefillVolume'],
    })
    .refine(
        (data) => {
            // Payment reference required for non-cash payments
            if (data.paymentMethod !== 'cash' && !data.paymentReference) {
                return false
            }
            return true
        },
        {
            message: 'Payment reference is required for non-cash payments',
            path: ['paymentReference'],
        }
    )

type RefillFormData = z.infer<typeof refillSchema>

// Price per kg (configurable)
const PRICE_PER_KG = 300

// Generate batch number
const generateBatchNumber = () => {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const random = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, '0')
    return `BATCH-${year}${month}${day}-${random}`
}

export default function NewRefillPage() {
    const router = useRouter()
    const { data: session } = useSession()
    const [searchCylinder, setSearchCylinder] = useState('')
    const [scanDialogOpen, setScanDialogOpen] = useState(false)
    const [scannedCylinder, setScannedCylinder] = useState<any>(null)
    const [formError, setFormError] = useState<string | null>(null)

    // API hooks - add outletId for proper filtering
    const { data: cylindersData, isLoading: loadingCylinders } = useCylinders({
        code: searchCylinder,
        limit: 10,
        outletId: 1, // Default to outlet 1 - should use user's outlet in production
    })

    const { createRefill } = useRefillMutations()

    const {
        handleSubmit,
        control,
        formState: { errors, isSubmitting },
        watch,
        setValue,
        reset,
        setError,
    } = useForm<RefillFormData>({
        resolver: zodResolver(refillSchema),
        defaultValues: {
            cylinderId: 0,
            preRefillVolume: 0,
            postRefillVolume: 0,
            refillCost: 0,
            paymentMethod: 'cash',
            paymentReference: '',
            notes: '',
            batchNumber: generateBatchNumber(),
        },
    })

    const watchedValues = watch()
    const selectedCylinderId = watchedValues.cylinderId
    const preRefillVolume = watchedValues.preRefillVolume
    const postRefillVolume = watchedValues.postRefillVolume
    const volumeAdded = postRefillVolume - preRefillVolume

    // Find selected cylinder details - check scanned cylinder first
    const selectedCylinder =
        scannedCylinder?.id === selectedCylinderId
            ? scannedCylinder
            : cylindersData?.data?.find((c) => c.id === selectedCylinderId)

    // Set pre-refill volume when cylinder is selected
    useEffect(() => {
        if (selectedCylinder && selectedCylinder.currentGasVolume) {
            const currentVolume = parseFloat(selectedCylinder.currentGasVolume)
            setValue('preRefillVolume', currentVolume)
        }
    }, [selectedCylinder, setValue])

    // Auto-calculate cost when volume changes
    const handlePostVolumeChange = (newVolume: number) => {
        setValue('postRefillVolume', newVolume)
        const volumeDiff = newVolume - preRefillVolume
        if (volumeDiff > 0) {
            setValue('refillCost', volumeDiff * PRICE_PER_KG)
        }
    }

    const onSubmit = async (data: RefillFormData) => {
        try {
            setFormError(null) // Clear any previous errors
            
            const refillData: CreateRefillDto = {
                cylinderId: data.cylinderId,
                preRefillVolume: data.preRefillVolume,
                postRefillVolume: data.postRefillVolume,
                refillCost: data.refillCost,
                paymentMethod: data.paymentMethod,
                paymentReference: data.paymentReference || undefined,
                notes: data.notes,
                batchNumber: data.batchNumber,
            }

            const result = await createRefill(refillData)
            toast.success('Refill recorded successfully')
            // Navigate to receipt page for printing
            if (result && result.id) {
                router.push(`/admin/refills/${result.id}/receipt`)
            } else {
                router.push('/admin/refills')
            }
        } catch (error: any) {
            console.error('Refill creation error:', error)
            
            // Extract error message using the error handler utility
            const errorMessage = handleBackendValidationErrors(error, setError)
            setFormError(errorMessage)
            
            // Scroll to top to show the error alert
            window.scrollTo({ top: 0, behavior: 'smooth' })
            
            // Also show toast for immediate feedback
            toast.error(errorMessage)
        }
    }

    const handleScanQR = () => {
        setScanDialogOpen(true)
    }

    const handleCylinderScanned = (cylinder: any) => {
        setValue('cylinderId', cylinder.id)
        setValue(
            'preRefillVolume',
            parseFloat(cylinder.currentGasVolume || '0'),
        )
        setSearchCylinder(cylinder.cylinderCode) // Update search field
        setScannedCylinder(cylinder) // Store the scanned cylinder
        toast.success(`Cylinder ${cylinder.cylinderCode} selected`)
    }

    // Cylinder options for select - show current volume
    const cylinderOptions = (() => {
        const options =
            cylindersData?.data?.map((cylinder) => ({
                value: cylinder.id,
                label: `${cylinder.cylinderCode} - ${cylinder.type} (${parseFloat(cylinder.currentGasVolume || '0').toFixed(1)}kg)`,
            })) || []

        // Add scanned cylinder if it's not already in the options
        if (
            scannedCylinder &&
            !options.find((opt) => opt.value === scannedCylinder.id)
        ) {
            options.unshift({
                value: scannedCylinder.id,
                label: `${scannedCylinder.cylinderCode} - ${scannedCylinder.type} (${parseFloat(scannedCylinder.currentGasVolume || '0').toFixed(1)}kg)`,
            })
        }

        return options
    })()

    return (
        <Container>
            <div className="mb-6">
                <Button
                    size="sm"
                    variant="plain"
                    icon={<PiArrowLeftDuotone />}
                    onClick={() => router.push('/admin/refills')}
                >
                    Back to Refills
                </Button>

                <h3 className="mb-2 mt-4">Record Cylinder Refill</h3>
                <p className="text-sm text-gray-500">
                    Log a new gas refill operation
                </p>
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

            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Cylinder Selection */}
                    <Card>
                        <h4 className="mb-4">Cylinder Information</h4>

                        <FormItem
                            label="Select Cylinder"
                            invalid={Boolean(errors.cylinderId)}
                            errorMessage={errors.cylinderId?.message}
                            asterisk
                        >
                            <div className="flex gap-2">
                                <Controller
                                    name="cylinderId"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            {...field}
                                            className="flex-1"
                                            options={cylinderOptions}
                                            placeholder="Search by code..."
                                            isLoading={loadingCylinders}
                                            value={
                                                cylinderOptions.find(
                                                    (opt) =>
                                                        opt.value ===
                                                        field.value,
                                                ) || null
                                            }
                                            onChange={(option) =>
                                                field.onChange(
                                                    option?.value || 0,
                                                )
                                            }
                                            onInputChange={setSearchCylinder}
                                        />
                                    )}
                                />
                                <Button
                                    type="button"
                                    variant="solid"
                                    icon={<PiQrCodeDuotone />}
                                    onClick={handleScanQR}
                                >
                                    Scan QR
                                </Button>
                            </div>
                        </FormItem>

                        {selectedCylinder && (
                            <Alert showIcon className="mt-4">
                                <div className="space-y-1">
                                    <p className="font-semibold">
                                        Code: {selectedCylinder.cylinderCode}
                                    </p>
                                    <p className="text-sm">
                                        Type: {selectedCylinder.type}
                                    </p>
                                    <p className="text-sm">
                                        Status:{' '}
                                        <span className="font-medium">
                                            {selectedCylinder.status}
                                        </span>
                                    </p>
                                    <div className="mt-2 pt-2 border-t">
                                        <p className="text-sm">
                                            Current Volume:{' '}
                                            <span className="font-medium">
                                                {parseFloat(
                                                    selectedCylinder.currentGasVolume ||
                                                        '0',
                                                ).toFixed(2)}{' '}
                                                kg
                                            </span>
                                        </p>
                                        <p className="text-sm">
                                            Max Capacity:{' '}
                                            <span className="font-medium">
                                                {parseFloat(
                                                    selectedCylinder.maxGasVolume ||
                                                        '0',
                                                ).toFixed(2)}{' '}
                                                kg
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </Alert>
                        )}
                    </Card>

                    {/* Refill Details */}
                    <Card>
                        <h4 className="mb-4">Refill Details</h4>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <FormItem
                                    label="Pre-Refill Volume (kg)"
                                    invalid={Boolean(errors.preRefillVolume)}
                                    errorMessage={
                                        errors.preRefillVolume?.message
                                    }
                                    asterisk
                                >
                                    <Controller
                                        name="preRefillVolume"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                type="number"
                                                step="0.01"
                                                placeholder="Current volume"
                                                suffix="kg"
                                                onChange={(e) =>
                                                    field.onChange(
                                                        Number(e.target.value),
                                                    )
                                                }
                                            />
                                        )}
                                    />
                                </FormItem>

                                <FormItem
                                    label="Post-Refill Volume (kg)"
                                    invalid={Boolean(errors.postRefillVolume)}
                                    errorMessage={
                                        errors.postRefillVolume?.message
                                    }
                                    asterisk
                                >
                                    <Controller
                                        name="postRefillVolume"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                type="number"
                                                step="0.01"
                                                placeholder="After refill"
                                                suffix="kg"
                                                onChange={(e) =>
                                                    handlePostVolumeChange(
                                                        Number(e.target.value),
                                                    )
                                                }
                                            />
                                        )}
                                    />
                                </FormItem>
                            </div>

                            {volumeAdded > 0 && (
                                <Alert type="info" showIcon>
                                    <p className="text-sm">
                                        Volume to be added:{' '}
                                        <span className="font-semibold">
                                            {volumeAdded.toFixed(2)} kg
                                        </span>
                                    </p>
                                </Alert>
                            )}

                            <FormItem
                                label="Cost (₦)"
                                invalid={Boolean(errors.refillCost)}
                                errorMessage={errors.refillCost?.message}
                                extra={
                                    <span className="text-xs text-gray-500">
                                        Auto-calculated based on volume added
                                    </span>
                                }
                            >
                                <Controller
                                    name="refillCost"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            type="number"
                                            placeholder="Enter cost"
                                            prefix="₦"
                                            onChange={(e) =>
                                                field.onChange(
                                                    Number(e.target.value),
                                                )
                                            }
                                        />
                                    )}
                                />
                            </FormItem>

                            <FormItem
                                label="Batch Number"
                                invalid={Boolean(errors.batchNumber)}
                                errorMessage={errors.batchNumber?.message}
                                extra={
                                    <span className="text-xs text-gray-500">
                                        Auto-generated batch number for tracking
                                    </span>
                                }
                            >
                                <Controller
                                    name="batchNumber"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            placeholder="BATCH-YYYYMMDD-XXX"
                                            className="font-mono"
                                        />
                                    )}
                                />
                            </FormItem>
                        </div>
                    </Card>
                </div>

                {/* Payment Information */}
                <Card className="mt-6">
                    <h4 className="mb-4">Payment Information</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                        <FormItem
                            label="Payment Method"
                            invalid={Boolean(errors.paymentMethod)}
                            errorMessage={errors.paymentMethod?.message}
                            asterisk
                        >
                            <Controller
                                name="paymentMethod"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        {...field}
                                        options={[
                                            { value: 'cash', label: 'Cash' },
                                            { value: 'pos', label: 'POS (Card Payment)' },
                                            { value: 'bank_transfer', label: 'Bank Transfer' },
                                        ]}
                                        placeholder="Select payment method"
                                        value={
                                            [
                                                { value: 'cash', label: 'Cash' },
                                                { value: 'pos', label: 'POS (Card Payment)' },
                                                { value: 'bank_transfer', label: 'Bank Transfer' },
                                            ].find((opt) => opt.value === field.value) || null
                                        }
                                        onChange={(option) =>
                                            field.onChange(option?.value || 'cash')
                                        }
                                    />
                                )}
                            />
                        </FormItem>

                        {watchedValues.paymentMethod !== 'cash' && (
                            <FormItem
                                label="Payment Reference"
                                invalid={Boolean(errors.paymentReference)}
                                errorMessage={errors.paymentReference?.message}
                                asterisk
                            >
                                <Controller
                                    name="paymentReference"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            placeholder="Enter transaction reference"
                                        />
                                    )}
                                />
                            </FormItem>
                        )}
                    </div>
                </Card>

                {/* Notes */}
                <Card className="mt-6">
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
                                    placeholder="Optional notes about this refill..."
                                />
                            )}
                        />
                    </FormItem>
                </Card>

                {/* Summary */}
                {selectedCylinder && volumeAdded > 0 && (
                    <Card className="mt-6">
                        <h5 className="font-semibold mb-3">Refill Summary</h5>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                            <div>
                                <span className="text-gray-600">Cylinder:</span>{' '}
                                <span className="font-medium">
                                    {selectedCylinder.cylinderCode}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-600">Type:</span>{' '}
                                <span className="font-medium">
                                    {selectedCylinder.type}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-600">
                                    Batch Number:
                                </span>{' '}
                                <span className="font-medium font-mono text-xs">
                                    {watchedValues.batchNumber}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-600">
                                    Pre-Refill Volume:
                                </span>{' '}
                                <span className="font-medium">
                                    {preRefillVolume.toFixed(2)} kg
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-600">
                                    Post-Refill Volume:
                                </span>{' '}
                                <span className="font-medium">
                                    {postRefillVolume.toFixed(2)} kg
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-600">
                                    Volume Added:
                                </span>{' '}
                                <span className="font-medium text-green-600">
                                    +{volumeAdded.toFixed(2)} kg
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-600">
                                    Total Cost:
                                </span>{' '}
                                <span className="font-medium">
                                    ₦
                                    {(
                                        watchedValues.refillCost || 0
                                    ).toLocaleString()}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-600">
                                    Price per kg:
                                </span>{' '}
                                <span className="font-medium">
                                    ₦{PRICE_PER_KG}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-600">Operator:</span>{' '}
                                <span className="font-medium">
                                    {session?.user?.name ||
                                        session?.user?.email ||
                                        'Current User'}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-600">Payment Method:</span>{' '}
                                <span className="font-medium">
                                    {watchedValues.paymentMethod === 'cash' ? 'Cash' :
                                     watchedValues.paymentMethod === 'pos' ? 'POS (Card Payment)' :
                                     'Bank Transfer'}
                                </span>
                            </div>
                            {watchedValues.paymentReference && (
                                <div>
                                    <span className="text-gray-600">Reference:</span>{' '}
                                    <span className="font-medium">
                                        {watchedValues.paymentReference}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Capacity check */}
                        {selectedCylinder.maxGasVolume &&
                            postRefillVolume >
                                parseFloat(selectedCylinder.maxGasVolume) && (
                                <Alert type="danger" showIcon className="mt-4">
                                    <p className="text-sm">
                                        Warning: Post-refill volume exceeds
                                        cylinder capacity (
                                        {parseFloat(
                                            selectedCylinder.maxGasVolume,
                                        ).toFixed(2)}{' '}
                                        kg)
                                    </p>
                                </Alert>
                            )}
                    </Card>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3 mt-6">
                    <Button
                        type="button"
                        variant="plain"
                        onClick={() => router.push('/admin/refills')}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="solid"
                        loading={isSubmitting}
                        disabled={
                            !selectedCylinder ||
                            volumeAdded <= 0 ||
                            isSubmitting
                        }
                        icon={<PiCheckDuotone />}
                    >
                        Record Refill
                    </Button>
                </div>
            </form>

            {/* QR Scanner Component */}
            <CylinderQRScanner
                isOpen={scanDialogOpen}
                onClose={() => setScanDialogOpen(false)}
                onCylinderScanned={handleCylinderScanned}
                validateForRefill={true}
                title="Scan Cylinder QR Code"
                description="Position the cylinder QR code within the camera view to select it for refill"
            />
        </Container>
    )
}
