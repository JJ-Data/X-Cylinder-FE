'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import {
    PiArrowLeftDuotone,
    PiPencilDuotone,
    PiQrCodeDuotone,
    PiTruckDuotone,
    PiWarningCircleDuotone,
    PiCheckCircleDuotone,
    PiClockCountdownDuotone,
    PiUserDuotone,
    PiStorefrontDuotone,
    PiCalendarDuotone,
    PiDownloadDuotone,
    PiPrinterDuotone,
    PiEyeDuotone,
} from 'react-icons/pi'
import { useCylinder } from '@/hooks/useCylinders'
import { useQRCode } from '@/hooks/useQRCode'
import { Card } from '@/components/ui'
import Button from '@/components/ui/Button'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Skeleton } from '@/components/ui/Skeleton'
import { Alert } from '@/components/ui/Alert'
import { formatDate, formatCurrency } from '@/utils/format'
import { QRCodeModal } from '@/components/cylinders/QRCodeModal'

export default function CylinderDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const cylinderId = Number(params.id)
    const [showQRModal, setShowQRModal] = useState(false)

    const { data: cylinder, error, isLoading, mutate } = useCylinder(cylinderId)
    const { 
        qrCodeData, 
        isLoading: isLoadingQR, 
        fetchQRCode, 
        reset: resetQRCode 
    } = useQRCode()

    // Fetch QR code when modal is opened
    useEffect(() => {
        if (showQRModal && cylinder?.id && !qrCodeData) {
            fetchQRCode(cylinder.id)
        }
    }, [showQRModal, cylinder?.id, qrCodeData, fetchQRCode])

    // Reset QR code data when modal is closed
    useEffect(() => {
        if (!showQRModal && qrCodeData) {
            resetQRCode()
        }
    }, [showQRModal, qrCodeData, resetQRCode])

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Alert type="danger" className="mb-6">
                    <PiWarningCircleDuotone className="h-4 w-4" />
                    <span>Failed to load cylinder details. Please try again.</span>
                </Alert>
                <Button
                    variant="plain"
                    onClick={() => router.back()}
                    className="inline-flex items-center"
                >
                    <PiArrowLeftDuotone className="h-4 w-4 mr-2" />
                    Go Back
                </Button>
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    <Skeleton className="h-8 w-64 mb-8" />
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <Card className="p-6">
                                <Skeleton className="h-6 w-48 mb-4" />
                                <div className="space-y-4">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                            </Card>
                            <Card className="p-6">
                                <Skeleton className="h-6 w-32 mb-4" />
                                <div className="space-y-3">
                                    <Skeleton className="h-16 w-full" />
                                    <Skeleton className="h-16 w-full" />
                                </div>
                            </Card>
                        </div>
                        <div className="space-y-6">
                            <Card className="p-6">
                                <Skeleton className="h-6 w-32 mb-4" />
                                <div className="space-y-3">
                                    <Skeleton className="h-10 w-full" />
                                    <Skeleton className="h-10 w-full" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (!cylinder) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Alert type="warning" className="mb-6">
                    <PiWarningCircleDuotone className="h-4 w-4" />
                    <span>Cylinder not found.</span>
                </Alert>
                <Button
                    variant="plain"
                    onClick={() => router.back()}
                    className="inline-flex items-center"
                >
                    <PiArrowLeftDuotone className="h-4 w-4 mr-2" />
                    Go Back
                </Button>
            </div>
        )
    }

    const cylinderTypeConfig: Record<string, { label: string; capacity: string; color: string }> = {
        '5kg': { label: 'Small', capacity: '5kg', color: 'blue' },
        '10kg': { label: 'Medium', capacity: '10kg', color: 'green' },
        '12kg': { label: 'Medium', capacity: '12kg', color: 'green' },
        '15kg': { label: 'Medium', capacity: '15kg', color: 'green' },
        '20kg': { label: 'Large', capacity: '20kg', color: 'orange' },
        '25kg': { label: 'Large', capacity: '25kg', color: 'orange' },
        '45kg': { label: 'Industrial', capacity: '45kg', color: 'red' },
        '50kg': { label: 'Industrial', capacity: '50kg', color: 'red' },
        'SMALL': { label: 'Small', capacity: '5kg', color: 'blue' },
        'MEDIUM': { label: 'Medium', capacity: '12kg', color: 'green' },
        'LARGE': { label: 'Large', capacity: '25kg', color: 'orange' },
        'INDUSTRIAL': { label: 'Industrial', capacity: '50kg', color: 'red' },
    }

    const typeConfig = cylinderTypeConfig[cylinder.type] || { 
        label: cylinder.type, 
        capacity: 'Unknown', 
        color: 'gray' 
    }

    const getStatusIcon = (status: string) => {
        switch (status.toUpperCase()) {
            case 'AVAILABLE':
                return <PiCheckCircleDuotone className="h-5 w-5 text-green-600" />
            case 'LEASED':
                return <PiUserDuotone className="h-5 w-5 text-blue-600" />
            case 'REFILLING':
            case 'IN_REFILL':
                return <PiClockCountdownDuotone className="h-5 w-5 text-yellow-600" />
            case 'MAINTENANCE':
                return <PiWarningCircleDuotone className="h-5 w-5 text-orange-600" />
            default:
                return <PiCheckCircleDuotone className="h-5 w-5 text-gray-600" />
        }
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/staff/cylinders"
                        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                    >
                        <PiArrowLeftDuotone className="h-4 w-4 mr-2" />
                        Back to Cylinders
                    </Link>

                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                {cylinder.code || cylinder.cylinderCode || `CYL-${cylinder.id}`}
                            </h1>
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="flex items-center">
                                    {getStatusIcon(cylinder.status)}
                                    <StatusBadge
                                        status={cylinder.status?.toUpperCase() as any}
                                        type="cylinder"
                                        className="ml-2"
                                    />
                                </div>
                                <span className="text-gray-500">•</span>
                                <span className="text-gray-600">ID: #{cylinder.id}</span>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Button
                                variant="plain"
                                size="sm"
                                onClick={() => setShowQRModal(true)}
                                className="inline-flex items-center"
                            >
                                <PiQrCodeDuotone className="h-4 w-4 mr-2" />
                                View QR Code
                            </Button>
                            <Button
                                variant="plain"
                                size="sm"
                                className="inline-flex items-center"
                            >
                                <PiTruckDuotone className="h-4 w-4 mr-2" />
                                Transfer
                            </Button>
                            <Button
                                variant="solid"
                                size="sm"
                                className="inline-flex items-center"
                            >
                                <PiPencilDuotone className="h-4 w-4 mr-2" />
                                Edit Details
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Information */}
                        <Card className="p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Cylinder Information
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 mb-1">
                                            Cylinder Code
                                        </dt>
                                        <dd className="text-lg font-semibold text-gray-900">
                                            {cylinder.code || cylinder.cylinderCode || `CYL-${cylinder.id}`}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 mb-1">
                                            Type & Capacity
                                        </dt>
                                        <dd className="flex items-center">
                                            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium bg-${typeConfig.color}-100 text-${typeConfig.color}-800 mr-2`}>
                                                {typeConfig.label}
                                            </span>
                                            <span className="text-gray-700">{typeConfig.capacity}</span>
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 mb-1">
                                            Current Status
                                        </dt>
                                        <dd className="flex items-center">
                                            {getStatusIcon(cylinder.status)}
                                            <StatusBadge
                                                status={cylinder.status?.toUpperCase() as any}
                                                type="cylinder"
                                                className="ml-2"
                                            />
                                        </dd>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 mb-1">
                                            Current Outlet
                                        </dt>
                                        <dd className="flex items-center text-gray-900">
                                            <PiStorefrontDuotone className="h-4 w-4 mr-2 text-gray-400" />
                                            {cylinder.currentOutlet?.name || `Outlet ${cylinder.outletId || cylinder.currentOutletId || 'Unknown'}`}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 mb-1">
                                            Manufacture Date
                                        </dt>
                                        <dd className="flex items-center text-gray-900">
                                            <PiCalendarDuotone className="h-4 w-4 mr-2 text-gray-400" />
                                            {cylinder.manufactureDate ? formatDate(cylinder.manufactureDate) : 'Not specified'}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 mb-1">
                                            Last Inspection
                                        </dt>
                                        <dd className="flex items-center text-gray-900">
                                            <PiEyeDuotone className="h-4 w-4 mr-2 text-gray-400" />
                                            {cylinder.lastInspectionDate ? formatDate(cylinder.lastInspectionDate) : 'Not inspected'}
                                        </dd>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Current Lease Information */}
                        {cylinder.currentLease && (
                            <Card className="p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                    Current Lease
                                </h2>
                                <div className="bg-blue-50 rounded-lg p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="font-medium text-blue-900 mb-2">
                                                {cylinder.currentLease.customer?.firstName} {cylinder.currentLease.customer?.lastName}
                                            </h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="text-blue-700">Lease Date:</span>
                                                    <span className="ml-2 text-blue-900 font-medium">
                                                        {formatDate(cylinder.currentLease.leaseDate)}
                                                    </span>
                                                </div>
                                                {cylinder.currentLease.expectedReturnDate && (
                                                    <div>
                                                        <span className="text-blue-700">Expected Return:</span>
                                                        <span className="ml-2 text-blue-900 font-medium">
                                                            {formatDate(cylinder.currentLease.expectedReturnDate)}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <Button
                                            variant="plain"
                                            size="sm"
                                            className="text-blue-700 hover:text-blue-800"
                                        >
                                            View Details
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        )}

                        {/* Last Refill Information - TODO: Add when API supports it */}

                        {/* Gas Volume Information */}
                        {(cylinder.currentGasVolume || cylinder.maxGasVolume) && (
                            <Card className="p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                    Gas Volume Status
                                </h2>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-700">Current Volume:</span>
                                        <span className="text-lg font-semibold text-gray-900">
                                            {cylinder.currentGasVolume || '0'}L
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-700">Max Volume:</span>
                                        <span className="text-lg font-semibold text-gray-900">
                                            {cylinder.maxGasVolume || '0'}L
                                        </span>
                                    </div>
                                    {cylinder.currentGasVolume && cylinder.maxGasVolume && (
                                        <div className="mt-3">
                                            <div className="flex justify-between text-sm text-gray-600 mb-1">
                                                <span>Fill Level</span>
                                                <span>{Math.round((Number(cylinder.currentGasVolume) / Number(cylinder.maxGasVolume)) * 100)}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-blue-600 h-2 rounded-full"
                                                    style={{
                                                        width: `${Math.min((Number(cylinder.currentGasVolume) / Number(cylinder.maxGasVolume)) * 100, 100)}%`
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Quick Actions */}
                        <Card className="p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Quick Actions
                            </h2>
                            <div className="space-y-3">
                                <Button
                                    variant="plain"
                                    onClick={() => setShowQRModal(true)}
                                    className="w-full justify-start"
                                >
                                    <PiQrCodeDuotone className="h-4 w-4 mr-3" />
                                    View QR Code
                                </Button>
                                <Button
                                    variant="plain"
                                    className="w-full justify-start"
                                >
                                    <PiTruckDuotone className="h-4 w-4 mr-3" />
                                    Transfer Cylinder
                                </Button>
                                <Button
                                    variant="plain"
                                    className="w-full justify-start"
                                >
                                    <PiPencilDuotone className="h-4 w-4 mr-3" />
                                    Edit Details
                                </Button>
                                {cylinder.status?.toUpperCase() === 'AVAILABLE' && (
                                    <Button
                                        variant="solid"
                                        className="w-full justify-start bg-blue-600 hover:bg-blue-700"
                                        onClick={() => router.push(`/staff/leasing/new?cylinderId=${cylinder.id}`)}
                                    >
                                        <PiUserDuotone className="h-4 w-4 mr-3" />
                                        Assign Lease
                                    </Button>
                                )}
                            </div>
                        </Card>

                        {/* QR Code Preview */}
                        {cylinder.qrCode && (
                            <Card className="p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                    QR Code
                                </h2>
                                <div className="text-center">
                                    <div className="w-32 h-32 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center border-2 border-dashed border-gray-300">
                                        <PiQrCodeDuotone className="h-16 w-16 text-gray-400" />
                                    </div>
                                    <p className="text-sm text-gray-600 mb-4">
                                        {cylinder.qrCode}
                                    </p>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="plain"
                                            size="sm"
                                            onClick={() => setShowQRModal(true)}
                                            className="flex-1"
                                        >
                                            <PiEyeDuotone className="h-4 w-4 mr-2" />
                                            View
                                        </Button>
                                        <Button
                                            variant="plain"
                                            size="sm"
                                            className="flex-1"
                                        >
                                            <PiDownloadDuotone className="h-4 w-4 mr-2" />
                                            Download
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        )}

                        {/* Notes */}
                        {cylinder.notes && (
                            <Card className="p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                    Notes
                                </h2>
                                <p className="text-gray-700 text-sm">
                                    {cylinder.notes}
                                </p>
                            </Card>
                        )}
                    </div>
                </div>

                {/* QR Code Modal */}
                {showQRModal && cylinder.qrCode && (
                    isLoadingQR ? (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-lg shadow-xl p-8">
                                <div className="flex flex-col items-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                                    <p className="text-gray-600">Loading QR Code...</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <QRCodeModal
                            qrCode={cylinder.qrCode}
                            cylinderCode={cylinder.code || cylinder.cylinderCode || `CYL-${cylinder.id}`}
                            dataURL={qrCodeData?.dataURL || null}
                            onClose={() => setShowQRModal(false)}
                        />
                    )
                )}
            </div>
        </div>
    )
}