'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
    QrCode,
    Search,
    CheckCircle,
    Camera,
    Triangle,
    Gauge,
} from 'lucide-react'
import { useLeaseMutations } from '@/hooks/useLeases'
import { Button } from '@/components/ui/Button'
import {} from '@/components/ui/'
import { Card } from '@/components/ui'
import { SearchInput } from '@/components/ui/SearchInput'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatDate, formatCurrency } from '@/utils/format'
import { toast } from 'react-hot-toast'
import type { LeaseRecord } from '@/types/cylinder'

type ConditionType = 'good' | 'damaged' | 'needs_inspection'

interface ReturnFormData {
    condition: ConditionType
    gasRemaining: number
    damageNotes: string
    notes: string
    refundAmount: number
}

export default function ReturnLeasePage() {
    const router = useRouter()
    const [searchMethod, setSearchMethod] = useState<'qr' | 'manual'>('qr')
    const [searchValue, setSearchValue] = useState('')
    const [selectedLease, setSelectedLease] = useState<LeaseRecord | null>(null)
    const [isSearching, setIsSearching] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)

    // Form data
    const [formData, setFormData] = useState<ReturnFormData>({
        condition: 'good',
        gasRemaining: 0,
        damageNotes: '',
        notes: '',
        refundAmount: 0,
    })

    const { returnLease } = useLeaseMutations()

    const handleSearch = async () => {
        if (!searchValue.trim()) {
            toast.error('Please enter a search value')
            return
        }

        setIsSearching(true)
        try {
            // Search by cylinder code or QR code
            const response = await fetch(
                `/api/proxy/leases/search?code=${searchValue}`,
            )

            if (response.ok) {
                const data = await response.json()
                if (data.data) {
                    setSelectedLease(data.data)
                    // Set initial gas volume based on cylinder capacity
                    setFormData((prev) => ({
                        ...prev,
                        gasRemaining: data.data.cylinder?.currentGasVolume || 0,
                        refundAmount: data.data.depositAmount || 0,
                    }))
                } else {
                    toast.error('No active lease found for this cylinder')
                }
            } else {
                toast.error('Failed to find lease')
            }
        } catch (error) {
            toast.error('Error searching for lease')
        } finally {
            setIsSearching(false)
        }
    }

    const _handleScanCode = async (code: string) => {
        setSearchValue(code)
        await handleSearch()
    }

    const handleReturn = async () => {
        if (!selectedLease) return

        setIsProcessing(true)
        try {
            await returnLease.trigger({
                id: selectedLease.id,
                data: {
                    refundAmount: formData.refundAmount,
                    condition: formData.condition,
                    gasRemaining: formData.gasRemaining,
                    damageNotes: formData.damageNotes,
                    notes: formData.notes,
                }
            })

            toast.success('Return processed successfully!')
            setShowSuccess(true)

            // Reset form
            setTimeout(() => {
                setSearchMethod('qr')
                setSearchValue('')
                setSelectedLease(null)
                setFormData({
                    condition: 'good',
                    gasRemaining: 0,
                    damageNotes: '',
                    notes: '',
                    refundAmount: 0,
                })
                setShowSuccess(false)
                router.push('/staff/leasing')
            }, 2000)
        } catch (error: any) {
            toast.error(error.message || 'Failed to process return')
        } finally {
            setIsProcessing(false)
        }
    }

    const calculateRefund = useCallback(() => {
        if (!selectedLease) return 0

        let refund = parseFloat(selectedLease.depositAmount) || 0

        // Deduct for damage
        if (formData.condition === 'damaged') {
            refund = refund * 0.5 // 50% refund for damaged
        } else if (formData.condition === 'needs_inspection') {
            refund = refund * 0.75 // 75% refund pending inspection
        }

        // Check if returned late
        const expectedReturn = new Date(selectedLease.expectedReturnDate)
        const today = new Date()
        const isLate = today > expectedReturn

        if (isLate) {
            const daysLate = Math.ceil(
                (today.getTime() - expectedReturn.getTime()) /
                    (1000 * 60 * 60 * 24),
            )
            const lateFee = Math.min(daysLate * 50, refund * 0.5) // Max 50% late fee
            refund = Math.max(0, refund - lateFee)
        }

        return refund
    }, [selectedLease, formData.condition])

    // Update refund amount when condition changes
    const handleConditionChange = (condition: ConditionType) => {
        setFormData((prev) => ({
            ...prev,
            condition,
            refundAmount: calculateRefund(),
        }))
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">
                    Process Cylinder Return
                </h1>

                {!selectedLease ? (
                    <Card className="p-6">
                        <h2 className="text-xl font-semibold mb-4">
                            Find Lease to Return
                        </h2>

                        {/* Search Method Toggle */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <button
                                className={`py-3 px-4 rounded-lg border-2 transition-colors ${
                                    searchMethod === 'qr'
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-gray-300 hover:bg-gray-50'
                                }`}
                                onClick={() => setSearchMethod('qr')}
                            >
                                <QrCode className="h-6 w-6 mx-auto mb-2" />
                                <div className="font-medium">Scan QR Code</div>
                            </button>
                            <button
                                className={`py-3 px-4 rounded-lg border-2 transition-colors ${
                                    searchMethod === 'manual'
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-gray-300 hover:bg-gray-50'
                                }`}
                                onClick={() => setSearchMethod('manual')}
                            >
                                <Search className="h-6 w-6 mx-auto mb-2" />
                                <div className="font-medium">Manual Search</div>
                            </button>
                        </div>

                        {searchMethod === 'qr' ? (
                            <div className="text-center py-12">
                                <QrCode className="h-24 w-24 mx-auto text-gray-400 mb-4" />
                                <p className="text-gray-600 mb-4">
                                    Position the cylinder&apos;s QR code within
                                    the camera view
                                </p>
                                <div className="flex gap-2 justify-center">
                                    <input
                                        type="text"
                                        placeholder="Or enter code manually"
                                        className="px-3 py-2 border rounded-md"
                                        value={searchValue}
                                        onChange={(e) =>
                                            setSearchValue(e.target.value)
                                        }
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault()
                                                handleSearch()
                                            }
                                        }}
                                    />
                                    <Button
                                        type="button"
                                        onClick={() =>
                                            router.push('/staff/cylinders/scan')
                                        }
                                        icon={<Camera className="h-4 w-4" />}
                                    >
                                        Open Scanner
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex gap-2">
                                    <SearchInput
                                        value={searchValue}
                                        onChange={setSearchValue}
                                        placeholder="Enter cylinder code or QR code..."
                                        className="flex-1"
                                    />
                                    <Button
                                        type="button"
                                        onClick={handleSearch}
                                        loading={isSearching}
                                        icon={<Search className="h-4 w-4" />}
                                    >
                                        Search
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {/* Lease Details */}
                        <Card className="p-6">
                            <h2 className="text-xl font-semibold mb-4">
                                Lease Information
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Customer Info */}
                                <div className="bg-blue-50 rounded-lg p-4">
                                    <h3 className="font-medium text-blue-900 mb-3">
                                        Customer
                                    </h3>
                                    <dl className="space-y-2 text-sm">
                                        <div>
                                            <dt className="text-gray-600">
                                                Name:
                                            </dt>
                                            <dd className="font-medium">
                                                {
                                                    selectedLease.customer
                                                        ?.firstName
                                                }{' '}
                                                {
                                                    selectedLease.customer
                                                        ?.lastName
                                                }
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-gray-600">
                                                Phone:
                                            </dt>
                                            <dd>-</dd>
                                        </div>
                                        <div>
                                            <dt className="text-gray-600">
                                                Email:
                                            </dt>
                                            <dd>
                                                {selectedLease.customer?.email}
                                            </dd>
                                        </div>
                                    </dl>
                                </div>

                                {/* Cylinder Info */}
                                <div className="bg-green-50 rounded-lg p-4">
                                    <h3 className="font-medium text-green-900 mb-3">
                                        Cylinder
                                    </h3>
                                    <dl className="space-y-2 text-sm">
                                        <div>
                                            <dt className="text-gray-600">
                                                Code:
                                            </dt>
                                            <dd className="font-medium font-mono">
                                                {
                                                    selectedLease.cylinder
                                                        ?.cylinderCode
                                                }
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-gray-600">
                                                Type:
                                            </dt>
                                            <dd>
                                                {selectedLease.cylinder?.type}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-gray-600">
                                                Capacity:
                                            </dt>
                                            <dd>
                                                {selectedLease.cylinder?.type}
                                                kg
                                            </dd>
                                        </div>
                                    </dl>
                                </div>

                                {/* Lease Dates */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="font-medium text-gray-900 mb-3">
                                        Lease Period
                                    </h3>
                                    <dl className="space-y-2 text-sm">
                                        <div>
                                            <dt className="text-gray-600">
                                                Lease Date:
                                            </dt>
                                            <dd>
                                                {formatDate(
                                                    selectedLease.leaseDate,
                                                )}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-gray-600">
                                                Expected Return:
                                            </dt>
                                            <dd>
                                                {formatDate(
                                                    selectedLease.expectedReturnDate,
                                                )}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-gray-600">
                                                Status:
                                            </dt>
                                            <dd>
                                                {new Date() >
                                                new Date(
                                                    selectedLease.expectedReturnDate,
                                                ) ? (
                                                    <StatusBadge
                                                        status="OVERDUE"
                                                        type="lease"
                                                    />
                                                ) : (
                                                    <StatusBadge
                                                        status="ACTIVE"
                                                        type="lease"
                                                    />
                                                )}
                                            </dd>
                                        </div>
                                    </dl>
                                </div>

                                {/* Payment Info */}
                                <div className="bg-purple-50 rounded-lg p-4">
                                    <h3 className="font-medium text-purple-900 mb-3">
                                        Payment
                                    </h3>
                                    <dl className="space-y-2 text-sm">
                                        <div>
                                            <dt className="text-gray-600">
                                                Lease Amount:
                                            </dt>
                                            <dd>
                                                {formatCurrency(
                                                    parseFloat(
                                                        selectedLease.leaseAmount,
                                                    ),
                                                )}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-gray-600">
                                                Deposit:
                                            </dt>
                                            <dd className="font-medium">
                                                {formatCurrency(
                                                    parseFloat(
                                                        selectedLease.depositAmount,
                                                    ),
                                                )}
                                            </dd>
                                        </div>
                                    </dl>
                                </div>
                            </div>
                        </Card>

                        {/* Return Assessment */}
                        <Card className="p-6">
                            <h2 className="text-xl font-semibold mb-4">
                                Return Assessment
                            </h2>

                            <div className="space-y-6">
                                {/* Cylinder Condition */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Cylinder Condition
                                    </label>
                                    <div className="grid grid-cols-3 gap-3">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleConditionChange('good')
                                            }
                                            className={`p-4 rounded-lg border-2 text-center transition-colors ${
                                                formData.condition === 'good'
                                                    ? 'border-green-500 bg-green-50 text-green-700'
                                                    : 'border-gray-300 hover:bg-gray-50'
                                            }`}
                                        >
                                            <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                                            <div className="font-medium">
                                                Good
                                            </div>
                                            <div className="text-xs mt-1">
                                                No damage
                                            </div>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleConditionChange('damaged')
                                            }
                                            className={`p-4 rounded-lg border-2 text-center transition-colors ${
                                                formData.condition === 'damaged'
                                                    ? 'border-red-500 bg-red-50 text-red-700'
                                                    : 'border-gray-300 hover:bg-gray-50'
                                            }`}
                                        >
                                            <Triangle className="h-8 w-8 mx-auto mb-2" />
                                            <div className="font-medium">
                                                Damaged
                                            </div>
                                            <div className="text-xs mt-1">
                                                Visible damage
                                            </div>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleConditionChange(
                                                    'needs_inspection',
                                                )
                                            }
                                            className={`p-4 rounded-lg border-2 text-center transition-colors ${
                                                formData.condition ===
                                                'needs_inspection'
                                                    ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                                                    : 'border-gray-300 hover:bg-gray-50'
                                            }`}
                                        >
                                            <Search className="h-8 w-8 mx-auto mb-2" />
                                            <div className="font-medium">
                                                Inspection
                                            </div>
                                            <div className="text-xs mt-1">
                                                Needs checking
                                            </div>
                                        </button>
                                    </div>

                                    {formData.condition !== 'good' && (
                                        <div className="mt-3">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Damage Description
                                            </label>
                                            <textarea
                                                value={formData.damageNotes}
                                                onChange={(e) =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        damageNotes:
                                                            e.target.value,
                                                    }))
                                                }
                                                rows={2}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                                placeholder="Describe the damage or issue..."
                                                required={
                                                    formData.condition ===
                                                        'damaged' ||
                                                    formData.condition ===
                                                        'needs_inspection'
                                                }
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Gas Volume */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Gas Remaining (kg)
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <Gauge className="h-5 w-5 text-gray-400" />
                                        <input
                                            type="number"
                                            min="0"
                                            max={
                                                selectedLease.cylinder?.type ===
                                                '5kg'
                                                    ? 50
                                                    : selectedLease.cylinder
                                                            ?.type === '10kg'
                                                      ? 100
                                                      : 150
                                            }
                                            step="0.1"
                                            value={formData.gasRemaining}
                                            onChange={(e) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    gasRemaining:
                                                        parseFloat(
                                                            e.target.value,
                                                        ) || 0,
                                                }))
                                            }
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-600">
                                            /{' '}
                                            {selectedLease.cylinder?.type ===
                                            '5kg'
                                                ? 50
                                                : selectedLease.cylinder
                                                        ?.type === '10kg'
                                                  ? 100
                                                  : 150}
                                            kg
                                        </span>
                                    </div>
                                    <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500 transition-all"
                                            style={{
                                                width: `${
                                                    (formData.gasRemaining /
                                                        (selectedLease.cylinder
                                                            ?.type === '5kg'
                                                            ? 50
                                                            : selectedLease
                                                                    .cylinder
                                                                    ?.type ===
                                                                '10kg'
                                                              ? 100
                                                              : 150)) *
                                                    100
                                                }%`,
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Additional Notes */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Additional Notes (Optional)
                                    </label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                notes: e.target.value,
                                            }))
                                        }
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Any other observations or notes..."
                                    />
                                </div>
                            </div>

                            {/* Refund Calculation */}
                            <Card className="mt-6 p-4 bg-gray-50">
                                <h3 className="font-medium text-gray-900 mb-3">
                                    Refund Calculation
                                </h3>
                                <dl className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <dt>Original Deposit:</dt>
                                        <dd>
                                            {formatCurrency(
                                                parseFloat(
                                                    selectedLease.depositAmount,
                                                ),
                                            )}
                                        </dd>
                                    </div>

                                    {formData.condition !== 'good' && (
                                        <div className="flex justify-between text-red-600">
                                            <dt>Condition Deduction:</dt>
                                            <dd>
                                                -
                                                {formatCurrency(
                                                    parseFloat(
                                                        selectedLease.depositAmount,
                                                    ) -
                                                        (formData.condition ===
                                                        'damaged'
                                                            ? parseFloat(
                                                                  selectedLease.depositAmount,
                                                              ) * 0.5
                                                            : parseFloat(
                                                                  selectedLease.depositAmount,
                                                              ) * 0.75),
                                                )}
                                            </dd>
                                        </div>
                                    )}

                                    {new Date() >
                                        new Date(
                                            selectedLease.expectedReturnDate,
                                        ) && (
                                        <div className="flex justify-between text-red-600">
                                            <dt>Late Return Fee:</dt>
                                            <dd>
                                                -
                                                {formatCurrency(
                                                    Math.min(
                                                        Math.ceil(
                                                            (new Date().getTime() -
                                                                new Date(
                                                                    selectedLease.expectedReturnDate,
                                                                ).getTime()) /
                                                                (1000 *
                                                                    60 *
                                                                    60 *
                                                                    24),
                                                        ) * 50,
                                                        parseFloat(
                                                            selectedLease.depositAmount,
                                                        ) * 0.5,
                                                    ),
                                                )}
                                            </dd>
                                        </div>
                                    )}

                                    <div className="flex justify-between pt-2 border-t border-gray-300">
                                        <dt className="font-bold text-gray-900">
                                            Total Refund:
                                        </dt>
                                        <dd className="font-bold text-gray-900">
                                            {formatCurrency(
                                                formData.refundAmount,
                                            )}
                                        </dd>
                                    </div>
                                </dl>

                                {/* Allow manual adjustment */}
                                <div className="mt-3">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Adjust Refund Amount
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max={selectedLease.depositAmount}
                                        step="10"
                                        value={formData.refundAmount}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                refundAmount:
                                                    parseFloat(
                                                        e.target.value,
                                                    ) || 0,
                                            }))
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </Card>

                            <div className="mt-6 flex justify-between">
                                <Button
                                    type="button"
                                    variant="plain"
                                    onClick={() => {
                                        setSelectedLease(null)
                                        setFormData({
                                            condition: 'good',
                                            gasRemaining: 0,
                                            damageNotes: '',
                                            notes: '',
                                            refundAmount: 0,
                                        })
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    variant="solid"
                                    loading={isProcessing}
                                    onClick={handleReturn}
                                    icon={<CheckCircle className="h-4 w-4" />}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    Process Return
                                </Button>
                            </div>
                        </Card>
                    </div>
                )}

                {/* Success Modal */}
                {showSuccess && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <Card className="p-8 text-center max-w-md">
                            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">
                                Return Processed Successfully!
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Cylinder has been returned and is now available
                                for leasing.
                            </p>
                            {formData.refundAmount > 0 && (
                                <p className="text-lg font-medium text-green-600">
                                    Refund Amount:{' '}
                                    {formatCurrency(formData.refundAmount)}
                                </p>
                            )}
                        </Card>
                    </div>
                )}
            </div>
        </div>
    )
}
