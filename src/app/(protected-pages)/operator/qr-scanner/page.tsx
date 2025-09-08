'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
    PiCameraDuotone, 
    PiCameraSlashDuotone, 
    PiPackageDuotone, 
    PiWarningCircleDuotone 
} from 'react-icons/pi'
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
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                        <div className="aspect-video bg-black rounded-xl overflow-hidden mb-6 relative">
                            {isScanning ? (
                                <>
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        className="w-full h-full object-cover"
                                    />
                                    {/* Enhanced Scanning Overlay */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-80 h-80 relative">
                                            {/* Animated corners */}
                                            <div className="absolute top-0 left-0 w-20 h-20 border-t-4 border-l-4 border-green-400 rounded-tl-3xl animate-pulse" />
                                            <div className="absolute top-0 right-0 w-20 h-20 border-t-4 border-r-4 border-green-400 rounded-tr-3xl animate-pulse" />
                                            <div className="absolute bottom-0 left-0 w-20 h-20 border-b-4 border-l-4 border-green-400 rounded-bl-3xl animate-pulse" />
                                            <div className="absolute bottom-0 right-0 w-20 h-20 border-b-4 border-r-4 border-green-400 rounded-br-3xl animate-pulse" />
                                            
                                            {/* Center target */}
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-12 h-12 rounded-full border-2 border-green-400 flex items-center justify-center animate-ping">
                                                    <div className="w-6 h-6 rounded-full bg-green-400"></div>
                                                </div>
                                            </div>
                                            
                                            {/* Scanning grid */}
                                            <div className="absolute inset-4 border border-green-400 border-opacity-30 rounded-lg">
                                                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-px">
                                                    {[...Array(9)].map((_, i) => (
                                                        <div key={i} className="border border-green-400 border-opacity-20 rounded"></div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Instructions */}
                                    <div className="absolute bottom-6 left-0 right-0 text-center">
                                        <div className="bg-black bg-opacity-75 inline-block px-6 py-3 rounded-full backdrop-blur-sm">
                                            <p className="text-white text-lg font-semibold">Ready to Scan</p>
                                            <p className="text-green-300 text-sm mt-1">Position cylinder QR code within the frame</p>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <div className="text-center">
                                        <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <PiCameraSlashDuotone className="h-10 w-10 text-gray-400" />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-300 mb-2">Camera Off</h3>
                                        <p className="text-gray-400 text-sm">
                                            Tap the button below to start scanning
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Camera Controls */}
                        <div className="grid grid-cols-1 gap-4">
                            {!isScanning ? (
                                <Button
                                    onClick={startCamera}
                                    variant="solid"
                                    className="h-14 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-lg font-semibold"
                                >
                                    <PiCameraDuotone className="h-6 w-6 mr-3" />
                                    Start Camera Scanner
                                </Button>
                            ) : (
                                <Button
                                    onClick={stopCamera}
                                    variant="plain"
                                    className="h-14 border-2 border-red-200 text-red-600 hover:bg-red-50 text-lg font-semibold"
                                >
                                    <PiCameraSlashDuotone className="h-6 w-6 mr-3" />
                                    Stop Camera
                                </Button>
                            )}
                        </div>

                        {/* Manual Input */}
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <PiPackageDuotone className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-semibold text-gray-900">Manual Entry</h4>
                                    <p className="text-sm text-gray-600">Enter cylinder code if camera scanning fails</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={scannedCode}
                                    onChange={(e) =>
                                        setScannedCode(
                                            e.target.value.toUpperCase(),
                                        )
                                    }
                                    placeholder="Enter cylinder code (e.g., CYL-001)"
                                    className="flex-1 h-12 px-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                                />
                                <Button
                                    onClick={handleManualInput}
                                    variant="solid"
                                    className="h-12 px-8 bg-purple-600 hover:bg-purple-700 text-lg font-semibold"
                                    disabled={!scannedCode.trim()}
                                >
                                    Validate
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Error Alert */}
                {error && (
                    <Alert type="danger" className="mb-6">
                        <PiWarningCircleDuotone className="h-4 w-4" />
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
                                <PiPackageDuotone className="h-4 w-4" />
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

                {/* Today's Performance Stats */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <PiCameraDuotone className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Today's Performance</h3>
                                <p className="text-sm text-gray-600">Your refill activity summary</p>
                            </div>
                        </div>
                        <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            Live Stats
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                                <span className="text-white text-xl">⛽</span>
                            </div>
                            <div className="text-2xl font-bold text-blue-900 mb-1">12</div>
                            <div className="text-sm font-medium text-blue-700">Refills Completed</div>
                            <div className="text-xs text-blue-600 mt-1">+3 from yesterday</div>
                        </div>
                        
                        <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                                <span className="text-white text-xl">🔢</span>
                            </div>
                            <div className="text-2xl font-bold text-purple-900 mb-1">300L</div>
                            <div className="text-sm font-medium text-purple-700">Total Volume</div>
                            <div className="text-xs text-purple-600 mt-1">25L average per refill</div>
                        </div>
                        
                        <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                                <span className="text-white text-xl">💰</span>
                            </div>
                            <div className="text-2xl font-bold text-green-900 mb-1">₦15,000</div>
                            <div className="text-sm font-medium text-green-700">Revenue Generated</div>
                            <div className="text-xs text-green-600 mt-1">₦50 per liter rate</div>
                        </div>
                    </div>
                    
                    {/* Quick Achievement Badge */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="flex items-center justify-center">
                            <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border border-yellow-200 rounded-full px-4 py-2">
                                <div className="flex items-center space-x-2">
                                    <span className="text-lg">🏆</span>
                                    <span className="text-sm font-semibold text-yellow-800">
                                        Great work! You're 80% to your daily goal
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
