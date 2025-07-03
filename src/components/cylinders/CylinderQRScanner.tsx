'use client'

import { useState, useEffect } from 'react'
import { PiCheckCircleDuotone, PiWarningCircleDuotone } from 'react-icons/pi'
import QRScanner from '@/components/shared/QRScanner'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import { useCylinderByCode } from '@/hooks/useCylinders'
import { toast } from 'react-hot-toast'
import type { Cylinder } from '@/types/cylinder'

interface CylinderQRScannerProps {
    isOpen: boolean
    onClose: () => void
    onCylinderScanned: (cylinder: Cylinder) => void
    onCodeScanned?: (code: string) => void
    validateForRefill?: boolean
    title?: string
    description?: string
}

export default function CylinderQRScanner({
    isOpen,
    onClose,
    onCylinderScanned,
    onCodeScanned,
    validateForRefill = false,
    title = 'Scan Cylinder QR Code',
    description = 'Position the cylinder QR code within the camera view',
}: CylinderQRScannerProps) {
    const [scannedCode, setScannedCode] = useState<string | null>(null)
    const [isValidating, setIsValidating] = useState(false)

    // Fetch cylinder data when code is scanned
    const {
        data: cylinder,
        error,
        isLoading,
    } = useCylinderByCode(scannedCode || '')

    const handleScan = async (scannedData: string) => {
        let code = scannedData

        // Try to parse as JSON to extract the code
        try {
            const parsedData = JSON.parse(scannedData)
            if (parsedData.code) {
                code = parsedData.code
            }
        } catch (e) {
            // If parsing fails, assume it's already a plain code
            code = scannedData
        }

        setScannedCode(code)
        setIsValidating(true)

        // Call the onCodeScanned callback if provided
        if (onCodeScanned) {
            onCodeScanned(code)
        }
    }

    // Handle cylinder data changes
    useEffect(() => {
        if (!isValidating || !scannedCode) return

        if (cylinder) {
            // Validate cylinder for refill if needed
            if (validateForRefill) {
                if (cylinder.status === 'leased') {
                    toast.error('Cannot refill a leased cylinder')
                    return
                }
                if (
                    cylinder.status === 'maintenance' ||
                    cylinder.status === 'damaged'
                ) {
                    toast.error(`Cannot refill a ${cylinder.status} cylinder`)
                    return
                }
            }
            // Don't automatically close - let user click Continue
        } else if (error && !isLoading) {
            toast.error('Invalid cylinder code or cylinder not found')
        }
    }, [
        cylinder,
        error,
        isLoading,
        isValidating,
        scannedCode,
        validateForRefill,
    ])

    const handleContinue = () => {
        if (cylinder) {
            toast.success('Cylinder validated successfully')
            onCylinderScanned(cylinder)
            onClose()
            // Reset state
            setScannedCode(null)
            setIsValidating(false)
        }
    }

    const handleRetry = () => {
        setScannedCode(null)
        setIsValidating(false)
    }

    const handleCancel = () => {
        setScannedCode(null)
        setIsValidating(false)
        onClose()
    }

    return (
        <>
            <QRScanner
                isOpen={isOpen && !isValidating}
                onClose={onClose}
                onScan={handleScan}
                title={title}
                description={description}
            />

            {/* Validation overlay */}
            {isValidating && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
                        <div className="text-center">
                            {isLoading ? (
                                <>
                                    <Spinner
                                        size="lg"
                                        className="mx-auto mb-4"
                                    />
                                    <h5 className="mb-2">
                                        Validating Cylinder
                                    </h5>
                                    <p className="text-sm text-gray-600">
                                        Checking cylinder code:{' '}
                                        <span className="font-mono">
                                            {scannedCode}
                                        </span>
                                    </p>
                                </>
                            ) : error ? (
                                <>
                                    <PiWarningCircleDuotone className="text-6xl text-red-500 mx-auto mb-4" />
                                    <h5 className="mb-2 text-red-600">
                                        Validation Failed
                                    </h5>
                                    <p className="text-sm text-gray-600">
                                        Invalid cylinder code or cylinder not
                                        found
                                    </p>
                                    <div className="mt-4">
                                        <Button
                                            variant="solid"
                                            onClick={handleRetry}
                                            className="w-full"
                                        >
                                            Try Again
                                        </Button>
                                    </div>
                                </>
                            ) : cylinder ? (
                                <>
                                    <PiCheckCircleDuotone className="text-6xl text-green-500 mx-auto mb-4" />
                                    <h5 className="mb-2 text-green-600">
                                        Cylinder Found
                                    </h5>
                                    <div className="text-left bg-gray-50 rounded p-3 mt-3">
                                        <p className="text-sm">
                                            <span className="font-medium">
                                                Code:
                                            </span>{' '}
                                            {cylinder.cylinderCode}
                                        </p>
                                        <p className="text-sm">
                                            <span className="font-medium">
                                                Type:
                                            </span>{' '}
                                            {cylinder.type}
                                        </p>
                                        <p className="text-sm">
                                            <span className="font-medium">
                                                Status:
                                            </span>{' '}
                                            {cylinder.status}
                                        </p>
                                        <p className="text-sm">
                                            <span className="font-medium">
                                                Current Volume:
                                            </span>{' '}
                                            {parseFloat(
                                                cylinder.currentGasVolume ||
                                                    '0',
                                            ).toFixed(2)}{' '}
                                            kg
                                        </p>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="mt-4 flex gap-2">
                                        <Button
                                            variant="plain"
                                            onClick={handleCancel}
                                            className="flex-1"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            variant="solid"
                                            onClick={handleContinue}
                                            className="flex-1"
                                            disabled={
                                                validateForRefill &&
                                                (cylinder.status === 'leased' ||
                                                    cylinder.status ===
                                                        'maintenance' ||
                                                    cylinder.status ===
                                                        'damaged')
                                            }
                                        >
                                            Continue
                                        </Button>
                                    </div>
                                </>
                            ) : null}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
