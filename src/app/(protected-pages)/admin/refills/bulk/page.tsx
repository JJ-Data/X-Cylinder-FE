'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
    PiArrowLeftDuotone,
    PiPlusDuotone,
    PiTrashDuotone,
    PiCheckCircleDuotone,
    PiWarningDuotone,
    PiGasPumpDuotone,
    PiCubeDuotone,
    PiUploadDuotone,
    PiFloppyDiskDuotone,
    PiListBulletsDuotone,
    PiCalculatorDuotone,
} from 'react-icons/pi'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Alert from '@/components/ui/Alert'
import Container from '@/components/shared/Container'
import FormItem from '@/components/ui/Form/FormItem'
import toast from 'react-hot-toast'
import { refillService } from '@/services/api/refill.service'
import { formatCurrency } from '@/utils/format'

// Validation schema
const refillItemSchema = z.object({
    cylinderCode: z.string().min(1, 'Cylinder code is required').max(50),
    preRefillVolume: z.number().min(0, 'Pre-refill volume must be 0 or greater'),
    postRefillVolume: z.number().min(0, 'Post-refill volume must be 0 or greater'),
    refillCost: z.number().min(0, 'Cost must be 0 or greater').optional(),
})

const bulkRefillSchema = z.object({
    batchNumber: z.string().min(1, 'Batch number is required').max(100),
    notes: z.string().max(500).optional(),
    refills: z.array(refillItemSchema).min(1, 'At least one refill is required'),
})

type BulkRefillFormData = z.infer<typeof bulkRefillSchema>

interface RefillResult {
    cylinderCode: string
    success: boolean
    error?: string
}

export default function BulkRefillPage() {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [results, setResults] = useState<RefillResult[]>([])
    const [showResults, setShowResults] = useState(false)
    const [defaultUnitPrice, setDefaultUnitPrice] = useState<number>(0)

    const {
        control,
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<BulkRefillFormData>({
        resolver: zodResolver(bulkRefillSchema),
        defaultValues: {
            batchNumber: `BATCH-${Date.now()}`,
            notes: '',
            refills: [
                {
                    cylinderCode: '',
                    preRefillVolume: 0,
                    postRefillVolume: 0,
                    refillCost: 0,
                },
            ],
        },
    })

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'refills',
    })

    const watchRefills = watch('refills')

    // Calculate volume added and cost for each refill
    const calculateRefillDetails = (index: number) => {
        const refill = watchRefills[index]
        if (!refill) return { volumeAdded: 0, cost: 0 }

        const volumeAdded = Math.max(0, refill.postRefillVolume - refill.preRefillVolume)
        const cost = refill.refillCost || (volumeAdded * defaultUnitPrice)

        return { volumeAdded, cost }
    }

    // Calculate totals
    const calculateTotals = () => {
        return watchRefills.reduce(
            (acc, refill, index) => {
                const { volumeAdded, cost } = calculateRefillDetails(index)
                return {
                    totalVolume: acc.totalVolume + volumeAdded,
                    totalCost: acc.totalCost + cost,
                    count: acc.count + 1,
                }
            },
            { totalVolume: 0, totalCost: 0, count: 0 }
        )
    }

    const { totalVolume, totalCost, count } = calculateTotals()

    const handleAddRow = () => {
        append({
            cylinderCode: '',
            preRefillVolume: 0,
            postRefillVolume: 0,
            refillCost: 0,
        })
    }

    const handleRemoveRow = (index: number) => {
        if (fields.length > 1) {
            remove(index)
        } else {
            toast.error('At least one refill entry is required')
        }
    }

    const handleApplyDefaultPrice = () => {
        watchRefills.forEach((refill, index) => {
            const { volumeAdded } = calculateRefillDetails(index)
            setValue(`refills.${index}.refillCost`, volumeAdded * defaultUnitPrice)
        })
        toast.success('Default price applied to all entries')
    }

    const onSubmit = async (data: BulkRefillFormData) => {
        setIsSubmitting(true)
        setResults([])
        
        try {
            const response = await refillService.createBulkRefills({
                batchNumber: data.batchNumber,
                notes: data.notes,
                refills: data.refills.map(refill => ({
                    cylinderCode: refill.cylinderCode,
                    preRefillVolume: refill.preRefillVolume,
                    postRefillVolume: refill.postRefillVolume,
                    refillCost: refill.refillCost,
                })),
            })

            const { successful, failed } = response

            // Create results array
            const allResults: RefillResult[] = [
                ...data.refills
                    .filter(refill => !failed.some(f => f.cylinderCode === refill.cylinderCode))
                    .map(refill => ({
                        cylinderCode: refill.cylinderCode,
                        success: true,
                    })),
                ...failed.map(f => ({
                    cylinderCode: f.cylinderCode,
                    success: false,
                    error: f.error,
                })),
            ]

            setResults(allResults)
            setShowResults(true)

            if (successful > 0) {
                toast.success(`Successfully processed ${successful} refill(s)`)
            }
            if (failed.length > 0) {
                toast.error(`Failed to process ${failed.length} refill(s)`)
            }

            // If all successful, redirect after a delay
            if (failed.length === 0) {
                setTimeout(() => {
                    router.push('/admin/refills')
                }, 2000)
            }
        } catch (error) {
            console.error('Bulk refill error:', error)
            toast.error('Failed to process bulk refills')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleImportCSV = () => {
        // TODO: Implement CSV import
        toast('CSV import feature coming soon', {
            icon: '📋',
            duration: 3000,
        })
    }

    return (
        <Container>
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <Button
                            size="sm"
                            variant="plain"
                            icon={<PiArrowLeftDuotone />}
                            onClick={() => router.push('/admin/refills')}
                            className="mb-2"
                        >
                            Back to Refills
                        </Button>
                        <h3 className="mb-1">Bulk Refill Entry</h3>
                        <p className="text-sm text-gray-500">
                            Process multiple cylinder refills at once
                        </p>
                    </div>
                    <Button
                        variant="plain"
                        icon={<PiUploadDuotone />}
                        onClick={handleImportCSV}
                    >
                        Import CSV
                    </Button>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
                {/* Batch Information */}
                <Card className="mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <PiListBulletsDuotone className="text-xl text-gray-600" />
                        <h4>Batch Information</h4>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <FormItem
                            label="Batch Number"
                            invalid={Boolean(errors.batchNumber)}
                            errorMessage={errors.batchNumber?.message}
                        >
                            <Input
                                {...register('batchNumber')}
                                placeholder="Enter batch number"
                            />
                        </FormItem>
                        <FormItem label="Notes (Optional)">
                            <Input
                                {...register('notes')}
                                placeholder="Add any notes about this batch"
                            />
                        </FormItem>
                    </div>
                </Card>

                {/* Default Pricing */}
                <Card className="mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h5 className="flex items-center gap-2">
                                <PiCalculatorDuotone />
                                Default Pricing
                            </h5>
                            <p className="text-sm text-gray-500 mt-1">
                                Set a default price per kg for all entries
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Input
                                type="number"
                                value={defaultUnitPrice}
                                onChange={(e) => setDefaultUnitPrice(Number(e.target.value))}
                                placeholder="Price per kg"
                                className="w-32"
                                prefix="₦"
                            />
                            <Button
                                type="button"
                                variant="plain"
                                size="sm"
                                onClick={handleApplyDefaultPrice}
                                disabled={defaultUnitPrice <= 0}
                            >
                                Apply
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Refill Entries */}
                <Card className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <PiGasPumpDuotone className="text-xl text-gray-600" />
                            <h4>Refill Entries</h4>
                            <Badge content={`${count} items`} />
                        </div>
                        <Button
                            type="button"
                            variant="plain"
                            size="sm"
                            icon={<PiPlusDuotone />}
                            onClick={handleAddRow}
                        >
                            Add Row
                        </Button>
                    </div>

                    {/* Table Header */}
                    <div className="hidden md:grid md:grid-cols-12 gap-2 mb-2 px-2 py-3 bg-gray-50 rounded-lg text-sm font-medium text-gray-700">
                        <div className="col-span-3">Cylinder Code</div>
                        <div className="col-span-2">Pre-Refill (kg)</div>
                        <div className="col-span-2">Post-Refill (kg)</div>
                        <div className="col-span-2">Volume Added</div>
                        <div className="col-span-2">Cost (₦)</div>
                        <div className="col-span-1"></div>
                    </div>

                    {/* Refill Rows */}
                    <div className="space-y-2">
                        {fields.map((field, index) => {
                            const { volumeAdded } = calculateRefillDetails(index)
                            return (
                                <div
                                    key={field.id}
                                    className="grid grid-cols-1 md:grid-cols-12 gap-2 p-2 border rounded-lg hover:bg-gray-50"
                                >
                                    <div className="md:col-span-3">
                                        <FormItem
                                            invalid={Boolean(errors.refills?.[index]?.cylinderCode)}
                                            errorMessage={errors.refills?.[index]?.cylinderCode?.message}
                                        >
                                            <Input
                                                {...register(`refills.${index}.cylinderCode`)}
                                                placeholder="Cylinder code"
                                                prefix={<PiCubeDuotone />}
                                            />
                                        </FormItem>
                                    </div>
                                    <div className="md:col-span-2">
                                        <FormItem
                                            invalid={Boolean(errors.refills?.[index]?.preRefillVolume)}
                                            errorMessage={errors.refills?.[index]?.preRefillVolume?.message}
                                        >
                                            <Input
                                                type="number"
                                                step="0.1"
                                                {...register(`refills.${index}.preRefillVolume`, {
                                                    valueAsNumber: true,
                                                })}
                                                placeholder="0.0"
                                            />
                                        </FormItem>
                                    </div>
                                    <div className="md:col-span-2">
                                        <FormItem
                                            invalid={Boolean(errors.refills?.[index]?.postRefillVolume)}
                                            errorMessage={errors.refills?.[index]?.postRefillVolume?.message}
                                        >
                                            <Input
                                                type="number"
                                                step="0.1"
                                                {...register(`refills.${index}.postRefillVolume`, {
                                                    valueAsNumber: true,
                                                })}
                                                placeholder="0.0"
                                            />
                                        </FormItem>
                                    </div>
                                    <div className="md:col-span-2 flex items-center">
                                        <div className="w-full px-3 py-2 bg-gray-100 rounded text-center font-medium">
                                            {volumeAdded.toFixed(1)} kg
                                        </div>
                                    </div>
                                    <div className="md:col-span-2">
                                        <FormItem
                                            invalid={Boolean(errors.refills?.[index]?.refillCost)}
                                            errorMessage={errors.refills?.[index]?.refillCost?.message}
                                        >
                                            <Input
                                                type="number"
                                                step="0.01"
                                                {...register(`refills.${index}.refillCost`, {
                                                    valueAsNumber: true,
                                                })}
                                                placeholder="0.00"
                                                prefix="₦"
                                            />
                                        </FormItem>
                                    </div>
                                    <div className="md:col-span-1 flex items-center justify-center">
                                        <Button
                                            type="button"
                                            variant="plain"
                                            size="sm"
                                            icon={<PiTrashDuotone />}
                                            onClick={() => handleRemoveRow(index)}
                                            disabled={fields.length === 1}
                                            className="text-red-500 hover:text-red-700"
                                        />
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Mobile View Note */}
                    <div className="md:hidden mt-4">
                        <Alert type="info" showIcon>
                            <p className="text-sm">
                                For better experience with bulk entry, please use a desktop device
                            </p>
                        </Alert>
                    </div>
                </Card>

                {/* Summary */}
                <Card className="mb-6">
                    <h4 className="mb-4">Summary</h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-500 mb-1">Total Entries</p>
                            <p className="text-2xl font-bold">{count}</p>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm text-gray-500 mb-1">Total Volume</p>
                            <p className="text-2xl font-bold text-blue-600">
                                {totalVolume.toFixed(1)} kg
                            </p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg">
                            <p className="text-sm text-gray-500 mb-1">Total Cost</p>
                            <p className="text-2xl font-bold text-green-600">
                                {formatCurrency(totalCost)}
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Results */}
                {showResults && results.length > 0 && (
                    <Card className="mb-6">
                        <h4 className="mb-4">Processing Results</h4>
                        <div className="space-y-2">
                            {results.map((result, index) => (
                                <div
                                    key={index}
                                    className={`flex items-center justify-between p-3 rounded-lg ${
                                        result.success ? 'bg-green-50' : 'bg-red-50'
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        {result.success ? (
                                            <PiCheckCircleDuotone className="text-green-600" />
                                        ) : (
                                            <PiWarningDuotone className="text-red-600" />
                                        )}
                                        <span className="font-medium">{result.cylinderCode}</span>
                                    </div>
                                    {result.error && (
                                        <span className="text-sm text-red-600">{result.error}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </Card>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end gap-3">
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
                        icon={<PiFloppyDiskDuotone />}
                        loading={isSubmitting}
                        disabled={isSubmitting || fields.length === 0}
                    >
                        Process Refills ({count})
                    </Button>
                </div>
            </form>
        </Container>
    )
}