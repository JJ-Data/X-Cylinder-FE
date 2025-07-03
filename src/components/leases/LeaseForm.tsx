'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { HiArrowLeft, HiArrowRight, HiCheck } from 'react-icons/hi'
import { Form, FormItem } from '@/components/ui/Form'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import Container from '@/components/shared/Container'
import BottomStickyBar from '@/components/template/BottomStickyBar'
import Steps from '@/components/ui/Steps'
import Alert from '@/components/ui/Alert'
import { useCustomers } from '@/hooks/useCustomers'
import { useCylinders } from '@/hooks/useCylinders'
import { useLeaseMutations } from '@/hooks/useLeases'
import { formatCurrency } from '@/utils/formatCurrency'
import type { ZodType } from 'zod'
import type { Customer } from '@/types/customer'

const leaseSchema: ZodType<LeaseFormData> = z.object({
    customerId: z.number().min(1, 'Customer is required'),
    cylinderId: z.number().min(1, 'Cylinder is required'),
    deposit: z.number().min(0, 'Deposit must be a positive number'),
    leaseDuration: z.number().min(1, 'Lease duration must be at least 1 month'),
    monthlyRate: z.number().min(0, 'Monthly rate must be a positive number'),
    notes: z.string().optional(),
})

type LeaseFormData = {
    customerId: number
    cylinderId: number
    deposit: number
    leaseDuration: number
    monthlyRate: number
    notes?: string
}

interface LeaseFormProps {
    leaseId?: number
}

const steps = [
    { id: 1, name: 'Customer', description: 'Select customer' },
    { id: 2, name: 'Cylinder', description: 'Choose cylinder' },
    { id: 3, name: 'Details', description: 'Lease terms' },
    { id: 4, name: 'Review', description: 'Confirm details' },
]

export function LeaseForm({ }: LeaseFormProps) {
    const router = useRouter()
    const [currentStep, setCurrentStep] = useState(0)

    const { data: customers } = useCustomers()
    const { data: cylinders } = useCylinders({ status: 'available' })
    const { createLease } = useLeaseMutations()

    const {
        handleSubmit,
        reset: _reset,
        formState: { errors },
        control,
        watch,
        trigger,
    } = useForm<LeaseFormData>({
        defaultValues: {
            customerId: 0,
            cylinderId: 0,
            deposit: 0,
            leaseDuration: 1,
            monthlyRate: 0,
            notes: '',
        },
        resolver: zodResolver(leaseSchema),
    })

    const watchedValues = watch()
    const selectedCustomer = customers?.data?.find(
        (c: any) => c.id === watchedValues.customerId,
    ) as Customer | undefined
    const selectedCylinder = cylinders?.data?.find(
        (c: any) => c.id === watchedValues.cylinderId,
    )

    const onSubmit = async (data: LeaseFormData) => {
        try {
            await createLease.trigger(data)
            router.push('/admin/leases')
        } catch (error) {
            console.error('Failed to create lease:', error)
        }
    }

    const nextStep = async () => {
        let fieldsToValidate: (keyof LeaseFormData)[] = []

        switch (currentStep) {
            case 0:
                fieldsToValidate = ['customerId']
                break
            case 1:
                fieldsToValidate = ['cylinderId']
                break
            case 2:
                fieldsToValidate = ['deposit', 'leaseDuration', 'monthlyRate']
                break
        }

        const isValid = await trigger(fieldsToValidate)
        if (isValid && currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1)
        }
    }

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1)
        }
    }

    // Transform data for Select components
    const customerOptions =
        customers?.data?.map((customer: any) => ({
            value: customer.id,
            label: `${customer.user?.firstName} ${customer.user?.lastName} - ${customer.user?.phone}`,
        })) || []

    const cylinderOptions =
        cylinders?.data?.map((cylinder: any) => ({
            value: cylinder.id,
            label: `${cylinder.cylinderCode} - ${cylinder.type} (${cylinder.currentOutlet?.name || 'No outlet'})`,
        })) || []

    const renderStepContent = () => {
        switch (currentStep) {
            case 0:
                return (
                    <Card>
                        <h4 className="mb-6">Select Customer</h4>
                        <div className="grid gap-4">
                            <FormItem
                                label="Customer"
                                invalid={Boolean(errors.customerId)}
                                errorMessage={errors.customerId?.message}
                                asterisk
                            >
                                <Controller
                                    name="customerId"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            {...field}
                                            options={customerOptions}
                                            placeholder="Search and select a customer"
                                            value={
                                                field.value
                                                    ? customerOptions.find(
                                                          (opt: any) =>
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

                            {selectedCustomer && (
                                <Alert showIcon className="mt-4">
                                    <div>
                                        <p className="font-semibold">
                                            {selectedCustomer.user?.firstName}{' '}
                                            {selectedCustomer.user?.lastName}
                                        </p>
                                        <p className="text-sm">
                                            Email:{' '}
                                            {selectedCustomer.user?.email}
                                        </p>
                                        <p className="text-sm">
                                            Phone:{' '}
                                            {selectedCustomer.user?.phone}
                                        </p>
                                        <p className="text-sm">
                                            Address:{' '}
                                            {selectedCustomer.address}
                                        </p>
                                    </div>
                                </Alert>
                            )}
                        </div>
                    </Card>
                )

            case 1:
                return (
                    <Card>
                        <h4 className="mb-6">Select Cylinder</h4>
                        <div className="grid gap-4">
                            <FormItem
                                label="Available Cylinder"
                                invalid={Boolean(errors.cylinderId)}
                                errorMessage={errors.cylinderId?.message}
                                asterisk
                            >
                                <Controller
                                    name="cylinderId"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            {...field}
                                            options={cylinderOptions}
                                            placeholder="Search and select an available cylinder"
                                            value={
                                                field.value
                                                    ? cylinderOptions.find(
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

                            {selectedCylinder && (
                                <Alert showIcon className="mt-4">
                                    <div>
                                        <p className="font-semibold">
                                            Cylinder:{' '}
                                            {selectedCylinder.cylinderCode}
                                        </p>
                                        <p className="text-sm">
                                            Type: {selectedCylinder.type}
                                        </p>
                                        <p className="text-sm">
                                            Outlet:{' '}
                                            {
                                                selectedCylinder.currentOutlet
                                                    ?.name
                                            }
                                        </p>
                                        <p className="text-sm">
                                            Gas Level:{' '}
                                            {selectedCylinder.currentGasVolume}/
                                            {selectedCylinder.maxGasVolume} kg
                                        </p>
                                    </div>
                                </Alert>
                            )}
                        </div>
                    </Card>
                )

            case 2:
                return (
                    <Card>
                        <h4 className="mb-6">Lease Details</h4>
                        <div className="grid md:grid-cols-2 gap-4">
                            <FormItem
                                label="Security Deposit"
                                invalid={Boolean(errors.deposit)}
                                errorMessage={errors.deposit?.message}
                                asterisk
                            >
                                <Controller
                                    name="deposit"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            type="number"
                                            placeholder="Enter deposit amount"
                                            autoComplete="off"
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
                                label="Lease Duration (months)"
                                invalid={Boolean(errors.leaseDuration)}
                                errorMessage={errors.leaseDuration?.message}
                                asterisk
                            >
                                <Controller
                                    name="leaseDuration"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            type="number"
                                            min="1"
                                            placeholder="Enter duration in months"
                                            autoComplete="off"
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
                                label="Monthly Rate"
                                invalid={Boolean(errors.monthlyRate)}
                                errorMessage={errors.monthlyRate?.message}
                                asterisk
                            >
                                <Controller
                                    name="monthlyRate"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            type="number"
                                            placeholder="Enter monthly rate"
                                            autoComplete="off"
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
                                label="Notes"
                                invalid={Boolean(errors.notes)}
                                errorMessage={errors.notes?.message}
                                className="md:col-span-2"
                            >
                                <Controller
                                    name="notes"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            textArea
                                            rows={3}
                                            placeholder="Optional notes about the lease"
                                            autoComplete="off"
                                        />
                                    )}
                                />
                            </FormItem>
                        </div>
                    </Card>
                )

            case 3:
                return (
                    <div className="flex flex-col gap-4">
                        <Card>
                            <h4 className="mb-6">Review Lease Details</h4>

                            {/* Customer Details */}
                            <div className="mb-6">
                                <h5 className="font-semibold mb-3">
                                    Customer Information
                                </h5>
                                <div className="grid md:grid-cols-2 gap-2 text-sm">
                                    <div>
                                        <span className="text-gray-600">
                                            Name:
                                        </span>{' '}
                                        <span className="font-medium">
                                            {selectedCustomer?.user?.firstName}{' '}
                                            {selectedCustomer?.user?.lastName}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">
                                            Phone:
                                        </span>{' '}
                                        <span className="font-medium">
                                            {selectedCustomer?.user?.phone}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">
                                            Email:
                                        </span>{' '}
                                        <span className="font-medium">
                                            {selectedCustomer?.user?.email}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">
                                            Address:
                                        </span>{' '}
                                        <span className="font-medium">
                                            {selectedCustomer?.address}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Cylinder Details */}
                            <div className="mb-6">
                                <h5 className="font-semibold mb-3">
                                    Cylinder Information
                                </h5>
                                <div className="grid md:grid-cols-2 gap-2 text-sm">
                                    <div>
                                        <span className="text-gray-600">
                                            Code:
                                        </span>{' '}
                                        <span className="font-medium">
                                            {selectedCylinder?.cylinderCode}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">
                                            Type:
                                        </span>{' '}
                                        <span className="font-medium">
                                            {selectedCylinder?.type}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">
                                            Outlet:
                                        </span>{' '}
                                        <span className="font-medium">
                                            {
                                                selectedCylinder?.currentOutlet
                                                    ?.name
                                            }
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">
                                            Gas Level:
                                        </span>{' '}
                                        <span className="font-medium">
                                            {selectedCylinder?.currentGasVolume}
                                            /{selectedCylinder?.maxGasVolume} kg
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Lease Terms */}
                            <div>
                                <h5 className="font-semibold mb-3">
                                    Lease Terms
                                </h5>
                                <div className="grid md:grid-cols-2 gap-2 text-sm">
                                    <div>
                                        <span className="text-gray-600">
                                            Security Deposit:
                                        </span>{' '}
                                        <span className="font-medium">
                                            {formatCurrency(
                                                watchedValues.deposit,
                                            )}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">
                                            Duration:
                                        </span>{' '}
                                        <span className="font-medium">
                                            {watchedValues.leaseDuration} months
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">
                                            Monthly Rate:
                                        </span>{' '}
                                        <span className="font-medium">
                                            {formatCurrency(
                                                watchedValues.monthlyRate,
                                            )}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">
                                            Total Amount:
                                        </span>{' '}
                                        <span className="font-medium">
                                            {formatCurrency(
                                                watchedValues.monthlyRate *
                                                    watchedValues.leaseDuration,
                                            )}
                                        </span>
                                    </div>
                                </div>
                                {watchedValues.notes && (
                                    <div className="mt-3">
                                        <span className="text-gray-600 text-sm">
                                            Notes:
                                        </span>
                                        <p className="text-sm mt-1">
                                            {watchedValues.notes}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </Card>

                        <Alert showIcon type="info">
                            Please review all details carefully before creating
                            the lease.
                        </Alert>
                    </div>
                )

            default:
                return null
        }
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
                        icon={<HiArrowLeft />}
                        onClick={() => router.push('/admin/leases')}
                    >
                        Back to Leases
                    </Button>

                    <h3 className="mb-2">Create New Lease</h3>
                </div>

                {/* Steps */}
                <div className="mb-8">
                    <Steps current={currentStep}>
                        {steps.map((step) => (
                            <Steps.Item
                                key={step.id}
                                title={step.name}
                                description={step.description}
                            />
                        ))}
                    </Steps>
                </div>

                {/* Step Content */}
                <div className="min-h-[400px]">{renderStepContent()}</div>
            </Container>

            <BottomStickyBar>
                <div className="flex items-center justify-between w-full">
                    <Button
                        variant="plain"
                        onClick={prevStep}
                        disabled={currentStep === 0}
                        icon={<HiArrowLeft />}
                    >
                        Previous
                    </Button>

                    <div className="flex items-center gap-3">
                        {currentStep < steps.length - 1 ? (
                            <Button
                                variant="solid"
                                onClick={nextStep}
                                icon={<HiArrowRight />}
                                iconAlignment="end"
                            >
                                Next
                            </Button>
                        ) : (
                            <Button
                                variant="solid"
                                type="submit"
                                loading={createLease.isMutating}
                                disabled={createLease.isMutating}
                                icon={<HiCheck />}
                            >
                                Create Lease
                            </Button>
                        )}
                    </div>
                </div>
            </BottomStickyBar>
        </Form>
    )
}

export default LeaseForm
