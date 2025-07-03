'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, CameraOff, Package, AlertCircle } from 'lucide-react'
import { useRefillMutations } from '@/hooks/useRefills'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { formatCurrency } from '@/utils/format'
import type { Cylinder } from '@/types/cylinder'

export default function QRScannerPage() {
    const _router = useRouter()
    const videoRef = useRef<HTMLVideoElement>(null)
    const [isScanning, setIsScanning] = useState(false)
    const [scannedCode, setScannedCode] = useState('')
    const [cylinder, setCylinder] = useState<Cylinder | null>(null)
    const [volume, setVolume] = useState(0)
    const [isProcessing, setIsProcessing] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const { validateCylinder, createRefill } = useRefillMutations()

    // Start camera
    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' },
            })
            if (videoRef.current) {
                videoRef.current.srcObject = stream
                setIsScanning(true)
                setError(null)
            }
        } catch (err) {
            console.error('Camera access denied:', err)
            setError('Unable to access camera. Please check permissions.')
        }
    }

    // Stop camera
    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream
            stream.getTracks().forEach((track) => track.stop())
            videoRef.current.srcObject = null
            setIsScanning(false)
        }
    }

    // Mock QR code scan (in real app, use a QR library like qr-scanner)
    const handleManualInput = async () => {
        if (!scannedCode) return

        try {
            const validationResult = await validateCylinder(scannedCode)
            if (validationResult.valid && validationResult.cylinderId) {
                // TODO: Fetch full cylinder details using cylinderId
                // For now, create a mock cylinder object
                const mockCylinder = {
                    id: validationResult.cylinderId,
                    code: scannedCode,
                    type: 'MEDIUM',
                    status: 'available',
                    outlet: { name: 'Current Outlet' },
                }
                setCylinder(mockCylinder as any)
                setVolume(25) // Default volume
            } else {
                setError(validationResult.reason || 'Invalid cylinder')
            }
        } catch (err) {
            setError('Failed to validate cylinder')
        }
    }

    // Process refill
    const handleRefill = async () => {
        if (!cylinder || volume <= 0) return

        setIsProcessing(true)
        try {
            await createRefill({
                cylinderId: cylinder.id,
                volume,
                cost: calculateCost(volume),
                paymentMethod: 'CASH',
                notes: `Refilled via QR scanner`,
            })

            // Success - reset form
            setCylinder(null)
            setScannedCode('')
            setVolume(0)

            // Show success message
            alert('Refill processed successfully!')

            // Continue scanning
            setIsScanning(true)
        } catch (err) {
            setError('Failed to process refill')
        } finally {
            setIsProcessing(false)
        }
    }

    const calculateCost = (volume: number) => {
        // ₦50 per liter
        return volume * 50
    }

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopCamera()
        }
    }, [])

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">
                    QR Scanner - Refill Station
                </h1>

                {/* Camera View */}
                {!cylinder && (
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                        <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden mb-4 relative">
                            {isScanning ? (
                                <>
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-64 h-64 border-2 border-white rounded-lg" />
                                    </div>
                                    <div className="absolute bottom-4 left-0 right-0 text-center text-white">
                                        Position QR code within the frame
                                    </div>
                                </>
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <div className="text-center">
                                        <CameraOff className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-400">
                                            Camera is off
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Camera Controls */}
                        <div className="flex gap-4">
                            {!isScanning ? (
                                <Button
                                    onClick={startCamera}
                                    variant="solid"
                                    className="flex-1"
                                    icon={<Camera className="h-4 w-4" />}
                                >
                                    Start Camera
                                </Button>
                            ) : (
                                <Button
                                    onClick={stopCamera}
                                    variant="plain"
                                    className="flex-1"
                                    icon={<CameraOff className="h-4 w-4" />}
                                >
                                    Stop Camera
                                </Button>
                            )}
                        </div>

                        {/* Manual Input */}
                        <div className="mt-4 pt-4 border-t">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Or enter cylinder code manually:
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={scannedCode}
                                    onChange={(e) =>
                                        setScannedCode(
                                            e.target.value.toUpperCase(),
                                        )
                                    }
                                    placeholder="CYL-001"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <Button onClick={handleManualInput}>
                                    Validate
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Error Alert */}
                {error && (
                    <Alert type="danger" className="mb-6">
                        <AlertCircle className="h-4 w-4" />
                        <span>{error}</span>
                    </Alert>
                )}

                {/* Cylinder Details & Refill Form */}
                {cylinder && (
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-xl font-semibold mb-4">
                            Cylinder Details
                        </h2>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="text-sm font-medium text-gray-500">
                                    Code
                                </label>
                                <div className="text-lg font-medium">
                                    {cylinder.code}
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">
                                    Type
                                </label>
                                <div className="text-lg font-medium">
                                    {cylinder.type}
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">
                                    Current Status
                                </label>
                                <div className="text-lg font-medium">
                                    {cylinder.status}
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">
                                    Outlet
                                </label>
                                <div className="text-lg font-medium">
                                    {cylinder.outlet?.name}
                                </div>
                            </div>
                        </div>

                        {/* Current Lease Info */}
                        {cylinder.currentLease && (
                            <Alert type="info" className="mb-6">
                                <Package className="h-4 w-4" />
                                <div>
                                    <div className="font-medium">
                                        Currently Leased
                                    </div>
                                    <div className="text-sm">
                                        Customer:{' '}
                                        {
                                            cylinder.currentLease.customer
                                                ?.firstName
                                        }{' '}
                                        {
                                            cylinder.currentLease.customer
                                                ?.lastName
                                        }
                                    </div>
                                </div>
                            </Alert>
                        )}

                        {/* Refill Form */}
                        <div className="border-t pt-6">
                            <h3 className="font-medium mb-4">Refill Details</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Volume (Liters)
                                    </label>
                                    <input
                                        type="number"
                                        value={volume}
                                        onChange={(e) =>
                                            setVolume(Number(e.target.value))
                                        }
                                        min="0"
                                        max="50"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex justify-between items-center text-lg font-medium">
                                        <span>Total Cost:</span>
                                        <span>
                                            {formatCurrency(
                                                calculateCost(volume),
                                            )}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-600 mt-1">
                                        ₦50 per liter
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <Button
                                        variant="plain"
                                        onClick={() => {
                                            setCylinder(null)
                                            setScannedCode('')
                                            setVolume(0)
                                        }}
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="solid"
                                        onClick={handleRefill}
                                        loading={isProcessing}
                                        disabled={volume <= 0}
                                        className="flex-1"
                                    >
                                        Process Refill
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Quick Stats */}
                <div className="mt-8 bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                        Today&apos;s Stats
                    </h3>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <div className="text-2xl font-bold text-gray-900">
                                12
                            </div>
                            <div className="text-xs text-gray-600">Refills</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900">
                                300L
                            </div>
                            <div className="text-xs text-gray-600">Volume</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900">
                                ₦15,000
                            </div>
                            <div className="text-xs text-gray-600">Revenue</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
