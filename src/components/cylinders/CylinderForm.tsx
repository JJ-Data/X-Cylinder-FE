'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
    PiArrowLeftDuotone,
    PiInfoDuotone,
    PiGasPumpDuotone,
    PiWrenchDuotone,
    PiNoteDuotone,
} from 'react-icons/pi'
import { Form, FormItem } from '@/components/ui/Form'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import DatePicker from '@/components/ui/DatePicker'
import Container from '@/components/shared/Container'
import BottomStickyBar from '@/components/template/BottomStickyBar'
import Loading from '@/components/shared/Loading'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { useCylinder, useCylinderMutations } from '@/hooks/useCylinders'
import { useOutlets } from '@/hooks/useOutlets'
import useWindowSize from '@/components/ui/hooks/useWindowSize'
import { CYLINDER_TYPE_OPTIONS, CYLINDER_TYPE_CAPACITY_KG } from '@/constants/cylinder.constant'
import type { SelectOption } from '@/types/common-ui'

const cylinderSchema = z
    .object({
        cylinderCode: z.string().min(3, 'Code must be at least 3 characters'),
        type: z.string().min(1, 'Type is required'),
        currentOutletId: z.number().min(1, 'Outlet is required'),
        status: z.string().optional(),
        currentGasVolume: z
            .string()
            .optional()
            .refine(
                (val) => !val || !isNaN(Number(val)),
                'Must be a valid number',
            ),
        maxGasVolume: z
            .string()
            .optional()
            .refine(
                (val) => !val || !isNaN(Number(val)),
                'Must be a valid number',
            ),
        manufactureDate: z.date().nullable().optional(),
        lastInspectionDate: z.date().nullable().optional(),
        notes: z.string().optional(),
    })
    .superRefine((data, ctx) => {
        const capacity = CYLINDER_TYPE_CAPACITY_KG[data.type]
        const maxVolume =
            data.maxGasVolume !== undefined && data.maxGasVolume !== ''
                ? Number(data.maxGasVolume)
                : undefined
        const currentVolume =
            data.currentGasVolume !== undefined && data.currentGasVolume !== ''
                ? Number(data.currentGasVolume)
                : undefined

        if (capacity !== undefined && maxVolume !== undefined && maxVolume > capacity) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['maxGasVolume'],
                message: `Cannot exceed ${capacity}kg for a ${data.type} cylinder`,
            })
        }

        if (
            maxVolume !== undefined &&
            currentVolume !== undefined &&
            currentVolume > maxVolume
        ) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['currentGasVolume'],
                message: 'Cannot exceed max gas volume',
            })
        }
    })

type CylinderFormData = {
    cylinderCode: string
    type: string
    currentOutletId: number
    status?: string
    currentGasVolume?: string
    maxGasVolume?: string
    manufactureDate?: Date | null
    lastInspectionDate?: Date | null
    notes?: string
}

const cylinderTypeOptions = CYLINDER_TYPE_OPTIONS

const statusOptions = [
    { value: 'available', label: 'Available' },
    { value: 'leased', label: 'Leased' },
    { value: 'refilling', label: 'Refilling' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'damaged', label: 'Damaged' },
    { value: 'retired', label: 'Retired' },
]

interface CylinderFormProps {
    cylinderId?: number
}

export function CylinderForm({ cylinderId }: CylinderFormProps) {
    const router = useRouter()
    const { width } = useWindowSize()
    const isMobile = width ? width < 768 : false
    const isEdit = !!cylinderId
    const [isSubmitting, setIsSubmitting] = useState(false)

    const { data: cylinder, isLoading: cylinderLoading } = useCylinder(
        isEdit ? cylinderId : undefined,
    )
    const { data: outlets } = useOutlets()
    const { createCylinder, updateCylinder } = useCylinderMutations()

    const {
        handleSubmit,
        reset,
        getValues,
        setValue,
        formState: { errors },
        control,
        watch,
    } = useForm<CylinderFormData>({
        defaultValues: {
            cylinderCode: '',
            type: '',
            currentOutletId: 0,
            status: 'available',
            currentGasVolume: '',
            maxGasVolume: '',
            manufactureDate: null,
            lastInspectionDate: null,
            notes: '',
        },
        resolver: zodResolver(cylinderSchema),
    })

    const watchManufactureDate = watch('manufactureDate')
    const watchType = watch('type')

    // Populate form with existing data - only once per cylinder. SWR can hand back a
    // fresh `cylinder` object reference on background revalidation; re-running reset()
    // on every one of those would silently wipe out whatever the admin was mid-editing
    // (e.g. a Status change) back to the last-saved server value.
    const initializedForCylinderId = useRef<number | undefined>(undefined)
    useEffect(() => {
        if (cylinder && initializedForCylinderId.current !== cylinderId) {
            initializedForCylinderId.current = cylinderId
            reset({
                cylinderCode: cylinder.cylinderCode,
                type: cylinder.type,
                currentOutletId: cylinder.currentOutletId,
                status: cylinder.status,
                currentGasVolume: cylinder.currentGasVolume,
                maxGasVolume: cylinder.maxGasVolume,
                manufactureDate: cylinder.manufactureDate
                    ? new Date(cylinder.manufactureDate)
                    : null,
                lastInspectionDate: cylinder.lastInspectionDate
                    ? new Date(cylinder.lastInspectionDate)
                    : null,
                notes: cylinder.notes || '',
            })
        }
    }, [cylinder, cylinderId, reset])

    // Auto-fill/cap the max gas volume to the selected type's capacity, e.g.
    // picking '15kg' fills max volume with 15 and won't let it stay above that.
    useEffect(() => {
        const capacity = CYLINDER_TYPE_CAPACITY_KG[watchType]
        if (capacity === undefined) return

        const currentMax = getValues('maxGasVolume')
        if (!currentMax || Number(currentMax) > capacity) {
            setValue('maxGasVolume', String(capacity), {
                shouldValidate: true,
            })
        }
    }, [watchType, getValues, setValue])

    const onSubmit = async (data: CylinderFormData) => {
        setIsSubmitting(true)
        try {
            // Convert Date objects to ISO strings and gas volumes to numbers for the API
            const formData = {
                ...data,
                currentGasVolume:
                    data.currentGasVolume !== undefined &&
                    data.currentGasVolume !== ''
                        ? Number(data.currentGasVolume)
                        : undefined,
                maxGasVolume:
                    data.maxGasVolume !== undefined && data.maxGasVolume !== ''
                        ? Number(data.maxGasVolume)
                        : undefined,
                manufactureDate: data.manufactureDate
                    ? data.manufactureDate.toISOString()
                    : undefined,
                lastInspectionDate: data.lastInspectionDate
                    ? data.lastInspectionDate.toISOString()
                    : undefined,
            }

            if (isEdit) {
                await updateCylinder(cylinderId, formData)
            } else {
                await createCylinder(formData)
            }
            router.push('/admin/cylinders')
        } catch (error) {
            console.error('Failed to save cylinder:', error)

            const responseData = (error as any)?.response?.data
            const validationErrors = responseData?.errors as
                | Record<string, string[]>
                | undefined
            const message = validationErrors
                ? Object.values(validationErrors).flat().join(', ')
                : responseData?.error ||
                  (error as any)?.message ||
                  'Failed to save cylinder'

            toast.push(
                <Notification title="Error" type="danger">
                    {message}
                </Notification>,
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    // Transform outlets for Select component
    const outletOptions =
        outlets?.outlets?.map((outlet) => ({
            value: outlet.id,
            label: outlet.name,
        })) || []

    if (isEdit && cylinderLoading) {
        return (
            <Container>
                <Loading loading={true} />
            </Container>
        )
    }

    return (
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
                        onClick={() => router.push('/admin/cylinders')}
                    >
                        {isMobile ? 'Back' : 'Back to Cylinders'}
                    </Button>

                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                        {isEdit ? 'Edit Cylinder' : 'Add New Cylinder'}
                    </h3>
                    <p className="text-sm text-gray-500">
                        {isEdit
                            ? 'Update cylinder information'
                            : 'Create a new cylinder in the system'}
                    </p>
                </div>

                <div className="flex flex-col gap-4">
                    {/* Basic Information Section */}
                    <AdaptiveCard>
                        <div className="p-4 md:p-6">
                            <h4 className="text-lg font-semibold mb-4 md:mb-6 flex items-center gap-2">
                                <PiInfoDuotone className="text-xl" />
                                Basic Information
                            </h4>
                            <div className="grid md:grid-cols-2 gap-4">
                                <FormItem
                                    label="Cylinder Code"
                                    invalid={Boolean(errors.cylinderCode)}
                                    errorMessage={errors.cylinderCode?.message}
                                    asterisk
                                >
                                    <Controller
                                        name="cylinderCode"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                placeholder="e.g., CYL-001"
                                                autoComplete="off"
                                            />
                                        )}
                                    />
                                </FormItem>

                                <FormItem
                                    label="Type"
                                    invalid={Boolean(errors.type)}
                                    errorMessage={errors.type?.message}
                                    asterisk
                                >
                                    <Controller
                                        name="type"
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                {...field}
                                                options={cylinderTypeOptions}
                                                placeholder="Select cylinder type"
                                                value={
                                                    field.value
                                                        ? cylinderTypeOptions.find(
                                                              (opt) =>
                                                                  opt.value ===
                                                                  field.value,
                                                          )
                                                        : null
                                                }
                                                onChange={(option: SelectOption | null) => {
                                                    field.onChange(
                                                        option?.value || '',
                                                    )
                                                }}
                                            />
                                        )}
                                    />
                                </FormItem>

                                <FormItem
                                    label="Outlet"
                                    invalid={Boolean(errors.currentOutletId)}
                                    errorMessage={
                                        errors.currentOutletId?.message
                                    }
                                    asterisk
                                >
                                    <Controller
                                        name="currentOutletId"
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                {...field}
                                                options={outletOptions}
                                                placeholder="Select outlet"
                                                value={
                                                    field.value
                                                        ? outletOptions.find(
                                                              (opt) =>
                                                                  opt.value ===
                                                                  field.value,
                                                          )
                                                        : null
                                                }
                                                onChange={(option: any) => {
                                                    field.onChange(
                                                        option?.value || 0,
                                                    )
                                                }}
                                            />
                                        )}
                                    />
                                </FormItem>

                                <FormItem
                                    label="Status"
                                    invalid={Boolean(errors.status)}
                                    errorMessage={errors.status?.message}
                                >
                                    <Controller
                                        name="status"
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                {...field}
                                                options={statusOptions}
                                                placeholder="Select status"
                                                value={
                                                    field.value
                                                        ? statusOptions.find(
                                                              (opt) =>
                                                                  opt.value ===
                                                                  field.value,
                                                          )
                                                        : null
                                                }
                                                onChange={(option: any) => {
                                                    field.onChange(
                                                        option?.value ||
                                                            'available',
                                                    )
                                                }}
                                            />
                                        )}
                                    />
                                </FormItem>
                            </div>
                        </div>
                    </AdaptiveCard>

                    {/* Gas Volume Section */}
                    <AdaptiveCard>
                        <div className="p-4 md:p-6">
                            <h4 className="text-lg font-semibold mb-4 md:mb-6 flex items-center gap-2">
                                <PiGasPumpDuotone className="text-xl" />
                                Gas Volume Information
                            </h4>
                            <div className="grid md:grid-cols-2 gap-4">
                                <FormItem
                                    label="Current Gas Volume (kg)"
                                    invalid={Boolean(errors.currentGasVolume)}
                                    errorMessage={
                                        errors.currentGasVolume?.message
                                    }
                                >
                                    <Controller
                                        name="currentGasVolume"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                placeholder="e.g., 5.5"
                                                autoComplete="off"
                                            />
                                        )}
                                    />
                                </FormItem>

                                <FormItem
                                    label="Max Gas Volume (kg)"
                                    invalid={Boolean(errors.maxGasVolume)}
                                    errorMessage={errors.maxGasVolume?.message}
                                >
                                    <Controller
                                        name="maxGasVolume"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                placeholder="e.g., 10"
                                                autoComplete="off"
                                            />
                                        )}
                                    />
                                </FormItem>
                            </div>
                        </div>
                    </AdaptiveCard>

                    {/* Inspection & Manufacturing Section */}
                    <AdaptiveCard>
                        <div className="p-4 md:p-6">
                            <h4 className="text-lg font-semibold mb-4 md:mb-6 flex items-center gap-2">
                                <PiWrenchDuotone className="text-xl" />
                                Manufacturing & Inspection
                            </h4>
                            <div className="grid md:grid-cols-2 gap-4">
                                <FormItem
                                    label="Manufacturing Date"
                                    invalid={Boolean(errors.manufactureDate)}
                                    errorMessage={
                                        errors.manufactureDate?.message
                                    }
                                >
                                    <Controller
                                        name="manufactureDate"
                                        control={control}
                                        render={({ field }) => (
                                            <DatePicker
                                                value={field.value || undefined}
                                                onChange={field.onChange}
                                                placeholder="Select manufacturing date"
                                                clearable
                                                inputFormat="YYYY-MM-DD"
                                                maxDate={new Date()}
                                            />
                                        )}
                                    />
                                </FormItem>

                                <FormItem
                                    label="Last Inspection Date"
                                    invalid={Boolean(errors.lastInspectionDate)}
                                    errorMessage={
                                        errors.lastInspectionDate?.message
                                    }
                                >
                                    <Controller
                                        name="lastInspectionDate"
                                        control={control}
                                        render={({ field }) => (
                                            <DatePicker
                                                value={field.value || undefined}
                                                onChange={field.onChange}
                                                placeholder="Select last inspection date"
                                                clearable
                                                inputFormat="YYYY-MM-DD"
                                                minDate={
                                                    watchManufactureDate ||
                                                    undefined
                                                }
                                                maxDate={new Date()}
                                            />
                                        )}
                                    />
                                </FormItem>
                            </div>
                        </div>
                    </AdaptiveCard>

                    {/* Additional Information Section */}
                    <AdaptiveCard>
                        <div className="p-4 md:p-6">
                            <h4 className="text-lg font-semibold mb-4 md:mb-6 flex items-center gap-2">
                                <PiNoteDuotone className="text-xl" />
                                Additional Information
                            </h4>
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
                                            placeholder="Optional notes about the cylinder"
                                            autoComplete="off"
                                        />
                                    )}
                                />
                            </FormItem>
                        </div>
                    </AdaptiveCard>
                </div>
            </Container>

            <BottomStickyBar>
                <div className="flex items-center gap-2 md:gap-3">
                    <Button
                        variant="solid"
                        type="submit"
                        loading={isSubmitting}
                        disabled={isSubmitting}
                    >
                        {isMobile
                            ? isEdit
                                ? 'Update'
                                : 'Create'
                            : `${isEdit ? 'Update' : 'Create'} Cylinder`}
                    </Button>
                    <Button
                        variant="plain"
                        onClick={() => router.push('/admin/cylinders')}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                </div>
            </BottomStickyBar>
        </Form>
    )
}

export default CylinderForm
