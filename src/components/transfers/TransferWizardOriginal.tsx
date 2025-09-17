'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
    PiArrowLeftDuotone,
    PiArrowRightDuotone,
    PiArrowsLeftRightDuotone,
    PiMagnifyingGlassDuotone,
    PiQrCodeDuotone,
    PiTruckDuotone,
    PiCheckCircleDuotone,
    PiWarningCircleDuotone,
    PiCheckDuotone,
    PiInfoDuotone,
    PiScalesDuotone,
    PiUserDuotone,
    PiWrenchDuotone,
    PiSirenDuotone,
    PiStorefrontDuotone,
    PiNotePencilDuotone,
} from 'react-icons/pi'
import { Form, FormItem } from '@/components/ui/Form'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import Steps from '@/components/ui/Steps'
import Radio from '@/components/ui/Radio'
import Checkbox from '@/components/ui/Checkbox'
import Badge from '@/components/ui/Badge'
import Tag from '@/components/ui/Tag'
import Alert from '@/components/ui/Alert'
import Skeleton from '@/components/ui/Skeleton'
import Container from '@/components/shared/Container'
import BottomStickyBar from '@/components/template/BottomStickyBar'
import { VolumeGaugeMini } from '@/components/shared/VolumeGauge'
import QRScanner from '@/components/shared/QRScanner'
import { useOutlets } from '@/hooks/useOutlets'
import { useCylinders, useCylinderMutations } from '@/hooks/useCylinders'
import { useTransferMutations } from '@/hooks/useTransfers'
import useWindowSize from '@/components/ui/hooks/useWindowSize'
import { toast } from 'react-hot-toast'
import type { Cylinder } from '@/types/cylinder'
import type { Outlet } from '@/types/outlet'
import type { ZodType } from 'zod'

// Transfer types
type TransferType = 'single' | 'bulk'

// Form schema
const transferSchema: ZodType<TransferFormData> = z
    .object({
        transferType: z.enum(['single', 'bulk']),
        cylinderCode: z.string().optional(),
        cylinderIds: z.array(z.number()).optional(),
        sourceOutletId: z.number().optional(),
        destinationOutletId: z
            .number()
            .min(1, 'Destination outlet is required'),
        reason: z.enum([
            'balancing',
            'request',
            'maintenance',
            'emergency',
            'closure',
            'other',
        ]),
        customReason: z.string().optional(),
        notes: z.string().optional(),
    })
    .refine(
        (data) => {
            // Validate based on transfer type
            if (data.transferType === 'single') {
                return !!data.cylinderCode
            } else {
                return data.cylinderIds && data.cylinderIds.length > 0
            }
        },
        {
            message: 'Please select cylinders to transfer',
            path: ['cylinderIds'],
        },
    )

type TransferFormData = {
    transferType: TransferType
    cylinderCode?: string
    cylinderIds?: number[]
    sourceOutletId?: number
    destinationOutletId: number
    reason:
        | 'balancing'
        | 'request'
        | 'maintenance'
        | 'emergency'
        | 'closure'
        | 'other'
    customReason?: string
    notes?: string
}

const transferReasons = [
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

interface TransferWizardProps {
    preselectedCylinderId?: number
}

export function TransferWizard({ preselectedCylinderId }: TransferWizardProps) {
    const router = useRouter()
    const { width } = useWindowSize()
    const isMobile = width ? width < 768 : false
    const [currentStep, setCurrentStep] = useState(0)
    const [selectedCylinder, setSelectedCylinder] = useState<Cylinder | null>(
        null,
    )
    const [selectedCylinders, setSelectedCylinders] = useState<number[]>([])
    const [cylinderSearch, setCylinderSearch] = useState('')
    const [isSearching, setIsSearching] = useState(false)
    const [showQRScanner, setShowQRScanner] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)

    const { data: outletsData, isLoading: loadingOutlets } = useOutlets()
    const { transferCylinder } = useCylinderMutations()
    const { createTransfer } = useTransferMutations()

    const outlets = outletsData?.outlets || []

    const {
        handleSubmit,
        formState: { errors },
        control,
        watch,
        setValue,
        trigger,
    } = useForm<TransferFormData>({
        defaultValues: {
            transferType: 'single',
            cylinderCode: '',
            cylinderIds: [],
            sourceOutletId: undefined,
            destinationOutletId: 0,
            reason: 'balancing',
            customReason: '',
            notes: '',
        },
        resolver: zodResolver(transferSchema),
    })

    const watchedTransferType = watch('transferType')
    const watchedSourceOutlet = watch('sourceOutletId')
    const watchedDestinationOutlet = watch('destinationOutletId')
    const watchedReason = watch('reason')

    // Fetch cylinders for bulk transfer
    const { data: cylindersResponse, isLoading: loadingCylinders } =
        useCylinders({
            outletId: watchedSourceOutlet || undefined,
            status: 'available',
            page: 1,
            limit: 100,
        })
    const cylinders = cylindersResponse?.data || []

    // Preload cylinder if provided
    useEffect(() => {
        if (preselectedCylinderId) {
            fetchCylinder(preselectedCylinderId.toString())
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [preselectedCylinderId])

    // Update form when cylinders are selected
    useEffect(() => {
        setValue('cylinderIds', selectedCylinders)
    }, [selectedCylinders, setValue])

    const fetchCylinder = async (searchValue: string) => {
        setIsSearching(true)
        try {
            const response = await fetch(
                `/api/proxy/cylinders/code/${searchValue}`,
            )

            if (response.ok) {
                const data = await response.json()
                const cylinder = data.data

                if (cylinder.status === 'leased') {
                    toast.error('Cannot transfer a leased cylinder')
                    return
                }

                if (cylinder.status === 'damaged') {
                    toast.error('Cannot transfer a damaged cylinder')
                    return
                }

                setSelectedCylinder(cylinder)
                setValue('cylinderCode', cylinder.cylinderCode)
                setValue('sourceOutletId', cylinder.currentOutletId)
            } else {
                toast.error('Cylinder not found')
            }
        } catch {
            toast.error('Error searching for cylinder')
        } finally {
            setIsSearching(false)
        }
    }

    const handleSearch = () => {
        if (!cylinderSearch.trim()) {
            toast.error('Please enter a cylinder code')
            return
        }
        fetchCylinder(cylinderSearch)
    }

    const handleStepChange = async (nextStep: number) => {
        // Validate current step before moving forward
        if (nextStep > currentStep) {
            let isValid = true

            switch (currentStep) {
                case 0: // Transfer type selection
                    isValid = await trigger(['transferType'])
                    break
                case 1: // Cylinder selection
                    if (watchedTransferType === 'single') {
                        isValid = !!selectedCylinder
                    } else {
                        isValid = selectedCylinders.length > 0
                    }
                    if (!isValid) {
                        toast.error('Please select cylinders to transfer')
                    }
                    break
                case 2: // Destination & reason
                    isValid = await trigger(['destinationOutletId', 'reason'])
                    if (watchedReason === 'other' && !watch('customReason')) {
                        toast.error('Please specify the reason')
                        isValid = false
                    }
                    break
            }

            if (!isValid) return
        }

        setCurrentStep(nextStep)
    }

    const onSubmit = async (data: TransferFormData) => {
        setIsProcessing(true)
        try {
            if (data.transferType === 'single' && selectedCylinder) {
                await transferCylinder({
                    cylinderId: selectedCylinder.id,
                    toOutletId: data.destinationOutletId,
                    reason:
                        data.reason === 'other'
                            ? data.customReason!
                            : data.reason,
                    notes: data.notes,
                })
            } else {
                // For bulk transfers, create individual transfers for each cylinder
                if (data.cylinderIds && data.cylinderIds.length > 0) {
                    for (const cylinderId of data.cylinderIds) {
                        await createTransfer.trigger({
                            cylinderId,
                            toOutletId: data.destinationOutletId,
                            notes: `${data.reason}${data.notes ? `: ${data.notes}` : ''}`,
                        })
                    }
                }
            }

            setShowSuccess(true)
            toast.success('Transfer completed successfully!')

            setTimeout(() => {
                router.push('/admin/cylinders')
            }, 2000)
        } catch (error) {
            toast.error((error as Error).message || 'Failed to complete transfer')
        } finally {
            setIsProcessing(false)
        }
    }

    // Filter cylinders based on search
    const filteredCylinders = cylinders.filter(
        (cylinder) =>
            cylinder.cylinderCode
                .toLowerCase()
                .includes(cylinderSearch.toLowerCase()) ||
            cylinder.type.toLowerCase().includes(cylinderSearch.toLowerCase()),
    )

    const toggleCylinder = (cylinderId: number) => {
        if (selectedCylinders.includes(cylinderId)) {
            setSelectedCylinders(
                selectedCylinders.filter((id) => id !== cylinderId),
            )
        } else {
            setSelectedCylinders([...selectedCylinders, cylinderId])
        }
    }

    const selectAllCylinders = () => {
        if (selectedCylinders.length === filteredCylinders.length) {
            setSelectedCylinders([])
        } else {
            setSelectedCylinders(filteredCylinders.map((c) => c.id))
        }
    }

    // Get destination outlet details
    const destinationOutlet = outlets.find(
        (o: Outlet) => o.id === watchedDestinationOutlet,
    )

    const steps = [
        { label: 'Transfer Type', icon: <PiArrowsLeftRightDuotone /> },
        { label: 'Select Cylinders', icon: <PiMagnifyingGlassDuotone /> },
        { label: 'Destination & Reason', icon: <PiTruckDuotone /> },
        { label: 'Review & Confirm', icon: <PiCheckCircleDuotone /> },
    ]

    if (showSuccess) {
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
                        {watchedTransferType === 'single'
                            ? `Cylinder ${selectedCylinder?.cylinderCode} has been successfully transferred.`
                            : `${selectedCylinders.length} cylinders have been successfully transferred.`}
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
                                {watchedReason === 'other'
                                    ? watch('customReason')
                                    : transferReasons.find(
                                          (r) => r.value === watchedReason,
                                      )?.label}
                            </span>
                        </p>
                    </div>
                </AdaptiveCard>
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

                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
                        Transfer Cylinders
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                        Move cylinders between outlets
                    </p>

                    {/* Steps */}
                    <div className={isMobile ? 'overflow-x-auto' : ''}>
                        <Steps current={currentStep}>
                            {steps.map((step, index) => (
                                <Steps.Item
                                    key={index}
                                    title={isMobile ? '' : step.label}
                                />
                            ))}
                        </Steps>
                    </div>
                </div>

                {/* Step Content */}
                <div className="min-h-[400px]">
                    {/* Step 1: Transfer Type */}
                    {currentStep === 0 && (
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
                                                // Reset selections when changing type
                                                setSelectedCylinder(null)
                                                setSelectedCylinders([])
                                                setValue('cylinderIds', [])
                                                setValue('cylinderCode', '')
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
                                                                Single Cylinder
                                                                Transfer
                                                            </h5>
                                                            <p className="text-sm text-gray-600">
                                                                Search for a
                                                                specific
                                                                cylinder by code
                                                                or scan QR
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
                                                                Transfer
                                                                multiple
                                                                cylinders from
                                                                one outlet to
                                                                another
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
                    )}

                    {/* Step 2: Cylinder Selection */}
                    {currentStep === 1 && (
                        <>
                            {watchedTransferType === 'single' ? (
                                // Single cylinder search
                                <AdaptiveCard>
                                    <div className="p-4 md:p-6">
                                        <h4 className="text-lg font-semibold mb-4 md:mb-6">
                                            Find Cylinder to Transfer
                                        </h4>

                                        {!selectedCylinder ? (
                                            <div className="space-y-4">
                                                <div className="flex gap-2">
                                                    <Input
                                                        value={cylinderSearch}
                                                        onChange={(e) =>
                                                            setCylinderSearch(
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="Enter cylinder code..."
                                                        onKeyDown={(e) =>
                                                            e.key === 'Enter' &&
                                                            handleSearch()
                                                        }
                                                        prefix={
                                                            <PiMagnifyingGlassDuotone className="h-4 w-4 text-gray-400" />
                                                        }
                                                        className="flex-1"
                                                    />
                                                    <Button
                                                        type="button"
                                                        onClick={handleSearch}
                                                        loading={isSearching}
                                                    >
                                                        Search
                                                    </Button>
                                                </div>

                                                <div className="text-center">
                                                    <p className="text-sm text-gray-600 mb-2">
                                                        Or
                                                    </p>
                                                    <Button
                                                        type="button"
                                                        variant="plain"
                                                        onClick={() =>
                                                            setShowQRScanner(
                                                                true,
                                                            )
                                                        }
                                                        icon={
                                                            <PiQrCodeDuotone className="h-4 w-4" />
                                                        }
                                                    >
                                                        Scan QR Code
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <Alert
                                                    showIcon
                                                    className="alert-info"
                                                >
                                                    <PiInfoDuotone className="text-lg" />
                                                    Selected cylinder for
                                                    transfer
                                                </Alert>

                                                <AdaptiveCard className="bg-blue-50 border-blue-200">
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex-1">
                                                            <p className="text-lg font-mono font-medium">
                                                                {
                                                                    selectedCylinder.cylinderCode
                                                                }
                                                            </p>
                                                            <div className="flex items-center gap-4 mt-2">
                                                                <Tag>
                                                                    {
                                                                        selectedCylinder.type
                                                                    }
                                                                </Tag>
                                                                <Badge
                                                                    content={
                                                                        selectedCylinder.status
                                                                    }
                                                                    innerClass="bg-emerald-500 text-white"
                                                                />
                                                            </div>
                                                            <div className="mt-3 space-y-1 text-sm">
                                                                <p className="text-gray-600">
                                                                    Current
                                                                    Location:{' '}
                                                                    <span className="font-medium text-gray-900">
                                                                        {
                                                                            selectedCylinder
                                                                                .currentOutlet
                                                                                ?.name
                                                                        }
                                                                    </span>
                                                                </p>
                                                                <p className="text-gray-600">
                                                                    Gas Level:{' '}
                                                                    {
                                                                        selectedCylinder.currentGasVolume
                                                                    }
                                                                    /
                                                                    {
                                                                        selectedCylinder.maxGasVolume
                                                                    }{' '}
                                                                    kg
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <VolumeGaugeMini
                                                            current={parseFloat(
                                                                selectedCylinder.currentGasVolume,
                                                            )}
                                                            max={parseFloat(
                                                                selectedCylinder.maxGasVolume,
                                                            )}
                                                        />
                                                    </div>
                                                </AdaptiveCard>

                                                <Button
                                                    type="button"
                                                    variant="plain"
                                                    onClick={() => {
                                                        setSelectedCylinder(
                                                            null,
                                                        )
                                                        setCylinderSearch('')
                                                        setValue(
                                                            'cylinderCode',
                                                            '',
                                                        )
                                                    }}
                                                >
                                                    Search Different Cylinder
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </AdaptiveCard>
                            ) : (
                                // Bulk cylinder selection
                                <div className="space-y-4">
                                    {/* Source Outlet Selection */}
                                    <AdaptiveCard>
                                        <div className="p-4 md:p-6">
                                            <h4 className="text-lg font-semibold mb-4">
                                                Select Source Outlet
                                            </h4>
                                            <FormItem
                                                invalid={Boolean(
                                                    errors.sourceOutletId,
                                                )}
                                                errorMessage={
                                                    errors.sourceOutletId
                                                        ?.message
                                                }
                                            >
                                                <Controller
                                                    name="sourceOutletId"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Select
                                                            {...field}
                                                            options={outlets.map(
                                                                (outlet) => ({
                                                                    value: outlet.id,
                                                                    label: outlet.name,
                                                                }),
                                                            )}
                                                            placeholder="Choose outlet to transfer from"
                                                            value={
                                                                field.value
                                                                    ? outlets.find(
                                                                          (
                                                                              o: Outlet,
                                                                          ) =>
                                                                              o.id ===
                                                                              field.value,
                                                                      )
                                                                        ? {
                                                                              value: field.value,
                                                                              label: outlets.find(
                                                                                  (
                                                                                      o: Outlet,
                                                                                  ) =>
                                                                                      o.id ===
                                                                                      field.value,
                                                                              )!
                                                                                  .name,
                                                                          }
                                                                        : null
                                                                    : null
                                                            }
                                                            onChange={(
                                                                option: { value: number; label: string } | null,
                                                            ) => {
                                                                field.onChange(
                                                                    option?.value ||
                                                                        0,
                                                                )
                                                                setSelectedCylinders(
                                                                    [],
                                                                )
                                                            }}
                                                        />
                                                    )}
                                                />
                                            </FormItem>
                                        </div>
                                    </AdaptiveCard>

                                    {/* Cylinder Selection */}
                                    {watchedSourceOutlet && watchedSourceOutlet > 0 && (
                                        <AdaptiveCard>
                                            <div className="p-4 md:p-6">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h4 className="text-lg font-semibold">
                                                        Select Cylinders to
                                                        Transfer
                                                    </h4>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {selectedCylinders.length >
                                                        0 && (
                                                        <Badge
                                                            content={`${selectedCylinders.length} selected`}
                                                            innerClass="bg-blue-100 text-blue-700"
                                                        />
                                                    )}
                                                    <Button
                                                        size="sm"
                                                        variant="plain"
                                                        onClick={
                                                            selectAllCylinders
                                                        }
                                                    >
                                                        {selectedCylinders.length ===
                                                        filteredCylinders.length
                                                            ? 'Deselect All'
                                                            : 'Select All'}
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Search */}
                                            <div className="mb-4">
                                                <Input
                                                    placeholder="Search cylinders..."
                                                    value={cylinderSearch}
                                                    onChange={(e) =>
                                                        setCylinderSearch(
                                                            e.target.value,
                                                        )
                                                    }
                                                    prefix={
                                                        <PiMagnifyingGlassDuotone className="h-4 w-4 text-gray-400" />
                                                    }
                                                />
                                            </div>

                                            {/* Cylinder Grid */}
                                            {loadingCylinders ? (
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                    {[...Array(6)].map(
                                                        (_, i) => (
                                                            <Skeleton
                                                                key={i}
                                                                height={120}
                                                            />
                                                        ),
                                                    )}
                                                </div>
                                            ) : filteredCylinders.length ===
                                              0 ? (
                                                <div className="text-center py-8 text-gray-500">
                                                    {cylinders.length === 0
                                                        ? 'No available cylinders in this outlet'
                                                        : 'No cylinders match your search'}
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                                                    {filteredCylinders.map(
                                                        (cylinder) => (
                                                            <div
                                                                key={
                                                                    cylinder.id
                                                                }
                                                                className="relative"
                                                            >
                                                                <Checkbox
                                                                    checked={selectedCylinders.includes(
                                                                        cylinder.id,
                                                                    )}
                                                                    onChange={() =>
                                                                        toggleCylinder(
                                                                            cylinder.id,
                                                                        )
                                                                    }
                                                                    className="absolute top-3 right-3 z-10"
                                                                />
                                                                <AdaptiveCard
                                                                    className={`p-4 cursor-pointer transition-all ${
                                                                        selectedCylinders.includes(
                                                                            cylinder.id,
                                                                        )
                                                                            ? 'border-blue-500 bg-blue-50'
                                                                            : 'hover:border-gray-300'
                                                                    }`}
                                                                    onClick={() =>
                                                                        toggleCylinder(
                                                                            cylinder.id,
                                                                        )
                                                                    }
                                                                >
                                                                    <div className="pr-8">
                                                                        <p className="font-mono font-medium">
                                                                            {
                                                                                cylinder.cylinderCode
                                                                            }
                                                                        </p>
                                                                        <div className="flex items-center gap-2 mt-1">
                                                                            <Tag>
                                                                                {
                                                                                    cylinder.type
                                                                                }
                                                                            </Tag>
                                                                        </div>
                                                                        <div className="flex items-center justify-between mt-2">
                                                                            <p className="text-xs text-gray-500">
                                                                                {
                                                                                    cylinder.currentGasVolume
                                                                                }
                                                                                /
                                                                                {
                                                                                    cylinder.maxGasVolume
                                                                                }{' '}
                                                                                kg
                                                                            </p>
                                                                            <VolumeGaugeMini
                                                                                current={parseFloat(
                                                                                    cylinder.currentGasVolume,
                                                                                )}
                                                                                max={parseFloat(
                                                                                    cylinder.maxGasVolume,
                                                                                )}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </AdaptiveCard>
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                            )}
                                        </AdaptiveCard>
                                    )}
                                </div>
                            )}
                        </>
                    )}

                    {/* Step 3: Destination & Reason */}
                    {currentStep === 2 && (
                        <div className="space-y-4">
                            {/* Destination Outlet */}
                            <AdaptiveCard>
                                <div className="p-4 md:p-6">
                                    <h4 className="text-lg font-semibold mb-4">
                                        Select Destination Outlet
                                    </h4>
                                    <FormItem
                                        invalid={Boolean(
                                            errors.destinationOutletId,
                                        )}
                                        errorMessage={
                                            errors.destinationOutletId?.message
                                        }
                                        asterisk
                                    >
                                        <Controller
                                            name="destinationOutletId"
                                            control={control}
                                            render={({ field }) => (
                                                <div className="grid md:grid-cols-2 gap-3">
                                                    {loadingOutlets ? (
                                                        <>
                                                            <Skeleton
                                                                height={100}
                                                            />
                                                            <Skeleton
                                                                height={100}
                                                            />
                                                        </>
                                                    ) : (
                                                        outlets
                                                            .filter(
                                                                (
                                                                    outlet: Outlet,
                                                                ) =>
                                                                    outlet.id !==
                                                                    (watchedTransferType ===
                                                                    'single'
                                                                        ? selectedCylinder?.currentOutletId
                                                                        : watchedSourceOutlet),
                                                            )
                                                            .map(
                                                                (
                                                                    outlet: Outlet,
                                                                ) => (
                                                                    <AdaptiveCard
                                                                        key={
                                                                            outlet.id
                                                                        }
                                                                        className={`p-4 cursor-pointer transition-all ${
                                                                            field.value ===
                                                                            outlet.id
                                                                                ? 'border-blue-500 bg-blue-50'
                                                                                : 'hover:border-gray-300'
                                                                        }`}
                                                                        onClick={() =>
                                                                            field.onChange(
                                                                                outlet.id,
                                                                            )
                                                                        }
                                                                    >
                                                                        <div className="flex items-start justify-between">
                                                                            <div className="flex-1">
                                                                                <p className="font-medium">
                                                                                    {
                                                                                        outlet.name
                                                                                    }
                                                                                </p>
                                                                                <p className="text-sm text-gray-600 mt-1">
                                                                                    {
                                                                                        outlet.location
                                                                                    }
                                                                                </p>
                                                                            </div>
                                                                            {field.value ===
                                                                                outlet.id && (
                                                                                <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                                                                                    <PiCheckDuotone className="h-3 w-3 text-white" />
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </AdaptiveCard>
                                                                ),
                                                            )
                                                    )}
                                                </div>
                                            )}
                                        />
                                    </FormItem>
                                </div>
                            </AdaptiveCard>

                            {/* Transfer Reason */}
                            <AdaptiveCard>
                                <div className="p-4 md:p-6">
                                    <h4 className="text-lg font-semibold mb-4">
                                        Transfer Reason
                                    </h4>
                                    <FormItem
                                        invalid={Boolean(errors.reason)}
                                        errorMessage={errors.reason?.message}
                                        asterisk
                                    >
                                        <Controller
                                            name="reason"
                                            control={control}
                                            render={({ field }) => (
                                                <Radio.Group
                                                    {...field}
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                >
                                                    <div className="grid md:grid-cols-2 gap-3">
                                                        {transferReasons.map(
                                                            (reason) => (
                                                                <Radio
                                                                    key={
                                                                        reason.value
                                                                    }
                                                                    value={
                                                                        reason.value
                                                                    }
                                                                >
                                                                    <AdaptiveCard className="p-4 cursor-pointer hover:border-gray-300 transition-colors">
                                                                        <div className="flex items-center gap-3">
                                                                            {
                                                                                reason.icon
                                                                            }
                                                                            <p className="font-medium">
                                                                                {
                                                                                    reason.label
                                                                                }
                                                                            </p>
                                                                        </div>
                                                                    </AdaptiveCard>
                                                                </Radio>
                                                            ),
                                                        )}
                                                    </div>
                                                </Radio.Group>
                                            )}
                                        />
                                    </FormItem>

                                    {watchedReason === 'other' && (
                                        <FormItem
                                            label="Specify Reason"
                                            invalid={Boolean(
                                                errors.customReason,
                                            )}
                                            errorMessage={
                                                errors.customReason?.message
                                            }
                                            asterisk
                                            className="mt-4"
                                        >
                                            <Controller
                                                name="customReason"
                                                control={control}
                                                render={({ field }) => (
                                                    <Input
                                                        {...field}
                                                        placeholder="Please specify the reason..."
                                                    />
                                                )}
                                            />
                                        </FormItem>
                                    )}
                                </div>
                            </AdaptiveCard>

                            {/* Additional Notes */}
                            <AdaptiveCard>
                                <div className="p-4 md:p-6">
                                    <FormItem
                                        label="Additional Notes (Optional)"
                                        invalid={Boolean(errors.notes)}
                                        errorMessage={errors.notes?.message}
                                    >
                                        <Controller
                                            name="notes"
                                            control={control}
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    type="textarea"
                                                    rows={3}
                                                    placeholder="Any additional information about this transfer..."
                                                />
                                            )}
                                        />
                                    </FormItem>
                                </div>
                            </AdaptiveCard>
                        </div>
                    )}

                    {/* Step 4: Review & Confirm */}
                    {currentStep === 3 && (
                        <div className="space-y-4">
                            <Alert showIcon className="alert-info">
                                <PiInfoDuotone className="text-lg" />
                                Please review the transfer details before
                                confirming
                            </Alert>

                            {/* Transfer Summary */}
                            <AdaptiveCard>
                                <div className="p-4 md:p-6">
                                    <h4 className="text-lg font-semibold mb-4">
                                        Transfer Summary
                                    </h4>

                                    <div className="space-y-4">
                                        {/* From/To */}
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="text-center flex-1">
                                                    <p className="text-sm text-gray-600 mb-1">
                                                        From
                                                    </p>
                                                    <p className="font-medium">
                                                        {watchedTransferType ===
                                                        'single'
                                                            ? selectedCylinder
                                                                  ?.currentOutlet
                                                                  ?.name
                                                            : outlets.find(
                                                                  (o: Outlet) =>
                                                                      o.id ===
                                                                      watchedSourceOutlet,
                                                              )?.name}
                                                    </p>
                                                </div>
                                                <PiArrowRightDuotone className="h-6 w-6 text-gray-400 mx-4" />
                                                <div className="text-center flex-1">
                                                    <p className="text-sm text-gray-600 mb-1">
                                                        To
                                                    </p>
                                                    <p className="font-medium">
                                                        {
                                                            destinationOutlet?.name
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Cylinders */}
                                        <div>
                                            <p className="text-sm text-gray-600 mb-2">
                                                Cylinders to Transfer
                                            </p>
                                            {watchedTransferType ===
                                            'single' ? (
                                                <div className="bg-blue-50 rounded-lg p-3">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="font-mono font-medium">
                                                                {
                                                                    selectedCylinder?.cylinderCode
                                                                }
                                                            </p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <Tag>
                                                                    {
                                                                        selectedCylinder?.type
                                                                    }
                                                                </Tag>
                                                                <span className="text-sm text-gray-600">
                                                                    {
                                                                        selectedCylinder?.currentGasVolume
                                                                    }
                                                                    /
                                                                    {
                                                                        selectedCylinder?.maxGasVolume
                                                                    }{' '}
                                                                    kg
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <VolumeGaugeMini
                                                            current={parseFloat(
                                                                selectedCylinder?.currentGasVolume ||
                                                                    '0',
                                                            )}
                                                            max={parseFloat(
                                                                selectedCylinder?.maxGasVolume ||
                                                                    '0',
                                                            )}
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <Badge
                                                            content={`${selectedCylinders.length} cylinders`}
                                                            innerClass="bg-blue-100 text-blue-700"
                                                        />
                                                        <p className="text-sm text-gray-600">
                                                            Total capacity:{' '}
                                                            {cylinders
                                                                .filter((c) =>
                                                                    selectedCylinders.includes(
                                                                        c.id,
                                                                    ),
                                                                )
                                                                .reduce(
                                                                    (sum, c) =>
                                                                        sum +
                                                                        parseFloat(
                                                                            c.maxGasVolume,
                                                                        ),
                                                                    0,
                                                                )}{' '}
                                                            kg
                                                        </p>
                                                    </div>
                                                    <div className="max-h-40 overflow-y-auto space-y-1">
                                                        {cylinders
                                                            .filter((c) =>
                                                                selectedCylinders.includes(
                                                                    c.id,
                                                                ),
                                                            )
                                                            .map((cylinder) => (
                                                                <div
                                                                    key={
                                                                        cylinder.id
                                                                    }
                                                                    className="bg-gray-50 rounded p-2 text-sm"
                                                                >
                                                                    <span className="font-mono">
                                                                        {
                                                                            cylinder.cylinderCode
                                                                        }
                                                                    </span>
                                                                    <span className="text-gray-600 ml-2">
                                                                        (
                                                                        {
                                                                            cylinder.type
                                                                        }
                                                                        )
                                                                    </span>
                                                                </div>
                                                            ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Reason */}
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">
                                                Transfer Reason
                                            </p>
                                            <p className="font-medium">
                                                {watchedReason === 'other'
                                                    ? watch('customReason')
                                                    : transferReasons.find(
                                                          (r) =>
                                                              r.value ===
                                                              watchedReason,
                                                      )?.label}
                                            </p>
                                        </div>

                                        {/* Notes */}
                                        {watch('notes') && (
                                            <div>
                                                <p className="text-sm text-gray-600 mb-1">
                                                    Additional Notes
                                                </p>
                                                <p className="text-gray-900">
                                                    {watch('notes')}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </AdaptiveCard>

                            <Alert showIcon className="alert-warning">
                                <PiWarningCircleDuotone className="text-lg" />
                                The cylinders will be immediately available at
                                the destination outlet after transfer.
                            </Alert>
                        </div>
                    )}
                </div>
            </Container>

            <BottomStickyBar>
                <div className="flex items-center justify-between w-full">
                    <Button
                        type="button"
                        variant="plain"
                        onClick={() =>
                            currentStep > 0
                                ? handleStepChange(currentStep - 1)
                                : router.push('/admin/cylinders')
                        }
                        disabled={isProcessing}
                    >
                        {currentStep === 0 ? 'Cancel' : 'Previous'}
                    </Button>

                    <div className="flex items-center gap-3">
                        {currentStep < 3 ? (
                            <Button
                                type="button"
                                variant="solid"
                                onClick={() =>
                                    handleStepChange(currentStep + 1)
                                }
                                icon={<PiArrowRightDuotone />}
                                disabled={
                                    isProcessing ||
                                    // Step 0: Transfer type selection - always enabled since we have a default
                                    (currentStep === 0 ? false :
                                    // Step 1: Cylinder selection
                                    currentStep === 1 ? (
                                        watchedTransferType === 'single' 
                                            ? !selectedCylinder
                                            : !watchedSourceOutlet || selectedCylinders.length === 0
                                    ) :
                                    // Step 2: Destination & Reason
                                    currentStep === 2 ? (
                                        !watchedDestinationOutlet ||
                                        !watchedReason ||
                                        (watchedReason === 'other' && !watch('customReason'))
                                    ) : false)
                                }
                            >
                                Next
                            </Button>
                        ) : (
                            <Button
                                type="submit"
                                variant="solid"
                                loading={isProcessing}
                                icon={<PiTruckDuotone />}
                            >
                                Confirm Transfer
                            </Button>
                        )}
                    </div>
                </div>
            </BottomStickyBar>

            {/* QR Scanner */}
            {showQRScanner && (
                <QRScanner
                    isOpen={true}
                    onScan={(scannedData) => {
                        let code = scannedData

                        // Try to parse as JSON to extract the code
                        try {
                            const parsedData = JSON.parse(scannedData)
                            if (parsedData.code) {
                                code = parsedData.code
                            }
                        } catch {
                            // If parsing fails, assume it's already a plain code
                            code = scannedData
                        }

                        setShowQRScanner(false)
                        setCylinderSearch(code)
                        fetchCylinder(code)
                    }}
                    onClose={() => setShowQRScanner(false)}
                    title="Scan Cylinder QR Code"
                    description="Position the cylinder's QR code within the camera view"
                />
            )}
        </Form>
    )
}

export default TransferWizard
