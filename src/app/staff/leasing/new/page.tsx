'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
    User,
    Package,
    CreditCard,
    QrCode,
    Check,
    AlertCircle,
} from 'lucide-react'
import { useLeaseMutations } from '@/hooks/useLeases'
import { useCylinders } from '@/hooks/useCylinders'
import { useCustomers } from '@/hooks/useCustomers'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { Card } from '@/components/ui'
import { Input } from '@/components/ui/Input'
import { formatCurrency } from '@/utils/format'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { toast } from 'react-hot-toast'
import type { Customer, Cylinder } from '@/types/cylinder'

const leaseSchema = z
    .object({
        customerId: z.number().min(1, 'Customer is required'),
        cylinderId: z.number().optional(),
        cylinderCode: z.string().optional(),
        qrCode: z.string().optional(),
        leaseAmount: z.number().min(0, 'Lease amount must be positive'),
        depositAmount: z.number().min(0, 'Deposit amount must be positive'),
        expectedReturnDate: z
            .string()
            .min(1, 'Expected return date is required'),
        notes: z.string().optional(),
    })
    .refine((data) => data.cylinderId || data.cylinderCode || data.qrCode, {
        message: 'Either cylinder ID, code, or QR code is required',
    })

type LeaseFormData = z.infer<typeof leaseSchema>

const cylinderPrices: Record<string, { lease: number; deposit: number }> = {
    '5kg': { lease: 500, deposit: 2000 },
    '10kg': { lease: 800, deposit: 3000 },
    '15kg': { lease: 1000, deposit: 4000 },
    '50kg': { lease: 1500, deposit: 8000 },
}

export default function NewLeasePage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [step, setStep] = useState(1)
    const [customer, setCustomer] = useState('')
    const [cylinder, setCylinder] = useState('')
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
        null,
    )
    const [selectedCylinder, setSelectedCylinder] = useState<Cylinder | null>(
        null,
    )
    const [isSearchingCustomer, setIsSearchingCustomer] = useState(false)
    const [isSearchingCylinder, setIsSearchingCylinder] = useState(false)
    const [scanMode, setScanMode] = useState<'qr' | 'manual'>('manual')

    const { createLease } = useLeaseMutations()
    const { data: customers, isLoading: loadingCustomers } = useCustomers({
        searchTerm: customer,
        paymentStatus: 'active',
    })

    const { data: cylinders, isLoading: _loadingCylinders } = useCylinders({
        status: 'available',
        search: cylinder,
        limit: 50,
    })

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<LeaseFormData>({
        resolver: zodResolver(leaseSchema),
        defaultValues: {
            leaseAmount: 0,
            depositAmount: 0,
            notes: '',
        },
    })

    const handleCylinderSelect = useCallback(
        (cylinder: Cylinder) => {
            if (cylinder.status !== 'available') {
                toast.error('This cylinder is not available for lease')
                return
            }

            setSelectedCylinder(cylinder)
            setValue('cylinderId', cylinder.id)
            setValue('cylinderCode', cylinder.cylinderCode)
            setValue('qrCode', cylinder.qrCode)

            // Set default prices based on cylinder type
            const prices = cylinderPrices[cylinder.type] || {
                lease: 0,
                deposit: 0,
            }
            setValue('leaseAmount', prices.lease)
            setValue('depositAmount', prices.deposit)

            // Set default return date (30 days from now)
            const returnDate = new Date()
            returnDate.setDate(returnDate.getDate() + 30)
            setValue(
                'expectedReturnDate',
                returnDate.toISOString().split('T')[0],
            )

            setStep(3)
        },
        [setValue],
    )

    // Check if cylinder ID was passed in URL
    useEffect(() => {
        const cylinderId = searchParams.get('cylinderId')
        if (cylinderId) {
            // Find cylinder and preselect it
            const findCylinder = async () => {
                const response = await fetch(`/api/cylinders/${cylinderId}`)
                if (response.ok) {
                    const cylinder = await response.json()
                    handleCylinderSelect(cylinder.data)
                }
            }
            findCylinder()
        }
    }, [searchParams, handleCylinderSelect])

    const handleCustomerSelect = async (customer: Customer) => {
        // Check if customer has active payment status
        if ((customer as any).paymentStatus !== 'active') {
            toast.error('Customer account is not active. Payment required.')
            return
        }

        setSelectedCustomer(customer)
        setValue('customerId', customer.id)
        setStep(2)
    }

    const handleCylinderScan = async (code: string) => {
        setIsSearchingCylinder(true)
        try {
            //  by QR code or cylinder code
            const response = await fetch(`/api/cylinders/code/${code}`)
            if (response.ok) {
                const data = await response.json()
                handleCylinderSelect(data.data)
            } else {
                toast.error('Cylinder not found')
            }
        } catch (error) {
            toast.error('Failed to find cylinder')
        } finally {
            setIsSearchingCylinder(false)
        }
    }

    const onSubmit = async (data: LeaseFormData) => {
        try {
            await createLease.trigger(data)
            toast.success('Lease created successfully!')
            router.push('/staff/leasing')
        } catch (error: any) {
            toast.error(error.message || 'Failed to create lease')
        }
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">
                    Create New Lease
                </h1>

                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex items-center">
                        <div
                            className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}
                        >
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                    step >= 1
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-200'
                                }`}
                            >
                                {step > 1 ? (
                                    <Check className="h-5 w-5" />
                                ) : (
                                    <User className="h-5 w-5" />
                                )}
                            </div>
                            <span className="ml-2 font-medium hidden sm:inline">
                                Select Customer
                            </span>
                        </div>

                        <div
                            className={`flex-1 h-1 mx-4 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}
                        />

                        <div
                            className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}
                        >
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                    step >= 2
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-200'
                                }`}
                            >
                                {step > 2 ? (
                                    <Check className="h-5 w-5" />
                                ) : (
                                    <Package className="h-5 w-5" />
                                )}
                            </div>
                            <span className="ml-2 font-medium hidden sm:inline">
                                Select Cylinder
                            </span>
                        </div>

                        <div
                            className={`flex-1 h-1 mx-4 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}
                        />

                        <div
                            className={`flex items-center ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}
                        >
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                    step >= 3
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-200'
                                }`}
                            >
                                <CreditCard className="h-5 w-5" />
                            </div>
                            <span className="ml-2 font-medium hidden sm:inline">
                                Confirm Details
                            </span>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                    {/* Step 1: Customer Selection */}
                    {step === 1 && (
                        <Card className="p-6">
                            <h2 className="text-xl font-semibold mb-4">
                                Step 1: Select Customer
                            </h2>

                            <div className="space-y-4">
                                <div className="flex gap-2">
                                    <Input
                                        value={customer}
                                        onChange={(e) =>
                                            setCustomer(e.target.value)
                                        }
                                        placeholder="Search by phone, email, or name..."
                                        className="flex-1"
                                    />
                                </div>

                                {loadingCustomers ? (
                                    <div className="text-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                        <p className="mt-2 text-gray-600">
                                            Searching customers...
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-2 max-h-96 overflow-y-auto">
                                        {customers?.data?.map(
                                            (customer: any) => (
                                                <div
                                                    key={customer.id}
                                                    className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                                                    onClick={() =>
                                                        handleCustomerSelect(
                                                            customer,
                                                        )
                                                    }
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <div className="font-medium">
                                                                {
                                                                    customer
                                                                        .user
                                                                        .firstName
                                                                }{' '}
                                                                {
                                                                    customer
                                                                        .user
                                                                        .lastName
                                                                }
                                                            </div>
                                                            <div className="text-sm text-gray-600">
                                                                {
                                                                    customer
                                                                        .user
                                                                        .phone
                                                                }{' '}
                                                                •{' '}
                                                                {
                                                                    customer
                                                                        .user
                                                                        .email
                                                                }
                                                            </div>
                                                        </div>
                                                        <StatusBadge
                                                            status={
                                                                customer.paymentStatus
                                                            }
                                                            type="payment"
                                                        />
                                                    </div>
                                                </div>
                                            ),
                                        )}

                                        {customers?.data?.length === 0 &&
                                            customer && (
                                                <Alert type="info">
                                                    No active customers found
                                                    matching &ldquo;{customer}
                                                    &rdquo;
                                                </Alert>
                                            )}
                                    </div>
                                )}
                            </div>
                        </Card>
                    )}

                    {/* Step 2: Cylinder Selection */}
                    {step === 2 && (
                        <Card className="p-6">
                            <h2 className="text-xl font-semibold mb-4">
                                Step 2: Select Cylinder
                            </h2>

                            {selectedCustomer && (
                                <Alert type="info" className="mb-4">
                                    <User className="h-4 w-4" />
                                    Customer: {
                                        selectedCustomer.user?.firstName
                                    }{' '}
                                    {selectedCustomer.user?.lastName}
                                </Alert>
                            )}

                            {/* Scan Mode Toggle */}
                            <div className="mb-4 flex gap-2">
                                <Button
                                    type="button"
                                    variant={
                                        scanMode === 'manual'
                                            ? 'solid'
                                            : 'plain'
                                    }
                                    size="sm"
                                    onClick={() => setScanMode('manual')}
                                >
                                    Manual
                                </Button>
                                <Button
                                    type="button"
                                    variant={
                                        scanMode === 'qr' ? 'solid' : 'plain'
                                    }
                                    size="sm"
                                    onClick={() => setScanMode('qr')}
                                >
                                    <QrCode className="h-4 w-4 mr-2" />
                                    Scan QR Code
                                </Button>
                            </div>

                            {scanMode === 'manual' ? (
                                <>
                                    <div className="mb-4">
                                        <Input
                                            value={cylinder}
                                            onChange={(e) =>
                                                setCylinder(e.target.value)
                                            }
                                            placeholder=" by cylinder code..."
                                            className="w-full"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                                        {cylinders?.data?.map((cylinder) => (
                                            <Card
                                                key={cylinder.id}
                                                className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                                                onClick={() =>
                                                    handleCylinderSelect(
                                                        cylinder,
                                                    )
                                                }
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="font-medium text-lg">
                                                        {cylinder.cylinderCode}
                                                    </div>
                                                    <StatusBadge
                                                        status={
                                                            cylinder.status as any
                                                        }
                                                        type="cylinder"
                                                    />
                                                </div>
                                                <div className="text-sm text-gray-600 space-y-1">
                                                    <p>Type: {cylinder.type}</p>
                                                    <p>
                                                        Capacity:{' '}
                                                        {cylinder.maxGasVolume}
                                                        kg
                                                    </p>
                                                    <p className="text-xs">
                                                        {
                                                            cylinder
                                                                .currentOutlet
                                                                ?.name
                                                        }
                                                    </p>
                                                </div>
                                                <div className="mt-3 pt-3 border-t">
                                                    <div className="flex justify-between text-sm">
                                                        <span>Lease:</span>
                                                        <span className="font-medium">
                                                            {formatCurrency(
                                                                cylinderPrices[
                                                                    cylinder
                                                                        .type
                                                                ]?.lease || 0,
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span>Deposit:</span>
                                                        <span className="font-medium">
                                                            {formatCurrency(
                                                                cylinderPrices[
                                                                    cylinder
                                                                        .type
                                                                ]?.deposit || 0,
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-8">
                                    <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600 mb-4">
                                        Position the QR code in front of your
                                        camera
                                    </p>
                                    <div className="flex gap-2 justify-center">
                                        <input
                                            type="text"
                                            placeholder="Or enter code manually"
                                            className="px-3 py-2 border rounded-md"
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault()
                                                    handleCylinderScan(
                                                        (
                                                            e.target as HTMLInputElement
                                                        ).value,
                                                    )
                                                }
                                            }}
                                        />
                                        <Button
                                            type="button"
                                            onClick={() =>
                                                router.push(
                                                    '/staff/cylinders/scan',
                                                )
                                            }
                                        >
                                            Open Scanner
                                        </Button>
                                    </div>
                                </div>
                            )}

                            <div className="mt-4 flex justify-between">
                                <Button
                                    type="button"
                                    variant="plain"
                                    onClick={() => setStep(1)}
                                >
                                    Back
                                </Button>
                            </div>
                        </Card>
                    )}

                    {/* Step 3: Payment Details */}
                    {step === 3 && (
                        <Card className="p-6">
                            <h2 className="text-xl font-semibold mb-4">
                                Step 3: Confirm Details
                            </h2>

                            {/* Summary Cards */}
                            <div className="grid md:grid-cols-2 gap-4 mb-6">
                                <Card className="p-4 bg-blue-50 border-blue-200">
                                    <h3 className="font-medium text-blue-900 mb-2">
                                        Customer
                                    </h3>
                                    <p className="font-medium">
                                        {selectedCustomer?.user?.firstName}{' '}
                                        {selectedCustomer?.user?.lastName}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {selectedCustomer?.user?.email}
                                    </p>
                                </Card>

                                <Card className="p-4 bg-green-50 border-green-200">
                                    <h3 className="font-medium text-green-900 mb-2">
                                        Cylinder
                                    </h3>
                                    <p className="font-medium">
                                        {selectedCylinder?.cylinderCode}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Type: {selectedCylinder?.type}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Capacity:{' '}
                                        {selectedCylinder?.maxGasVolume}kg
                                    </p>
                                </Card>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Lease Amount (₦)
                                    </label>
                                    <input
                                        type="number"
                                        {...register('leaseAmount', {
                                            valueAsNumber: true,
                                        })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    {errors.leaseAmount && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.leaseAmount.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Deposit Amount (₦)
                                    </label>
                                    <input
                                        type="number"
                                        {...register('depositAmount', {
                                            valueAsNumber: true,
                                        })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    {errors.depositAmount && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.depositAmount.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Expected Return Date
                                    </label>
                                    <input
                                        type="date"
                                        {...register('expectedReturnDate')}
                                        min={
                                            new Date()
                                                .toISOString()
                                                .split('T')[0]
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    {errors.expectedReturnDate && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.expectedReturnDate.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Notes (Optional)
                                    </label>
                                    <textarea
                                        {...register('notes')}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Any special instructions or notes..."
                                    />
                                </div>
                            </div>

                            {/* Total Summary */}
                            <Card className="mt-6 p-4 bg-gray-50">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Lease Amount:</span>
                                        <span>
                                            {formatCurrency(
                                                watch('leaseAmount') || 0,
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Deposit Amount:</span>
                                        <span>
                                            {formatCurrency(
                                                watch('depositAmount') || 0,
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-lg font-bold border-t pt-2">
                                        <span>Total Amount:</span>
                                        <span className="text-blue-600">
                                            {formatCurrency(
                                                (watch('leaseAmount') || 0) +
                                                    (watch('depositAmount') ||
                                                        0),
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </Card>

                            <Alert type="warning" className="mt-4">
                                <AlertCircle className="h-4 w-4" />
                                Please ensure payment has been collected before
                                completing the lease.
                            </Alert>

                            <div className="mt-6 flex justify-between">
                                <Button
                                    type="button"
                                    variant="plain"
                                    onClick={() => setStep(2)}
                                >
                                    Back
                                </Button>
                                <Button
                                    type="submit"
                                    variant="solid"
                                    loading={isSubmitting}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    Complete Lease
                                </Button>
                            </div>
                        </Card>
                    )}
                </form>
            </div>
        </div>
    )
}
