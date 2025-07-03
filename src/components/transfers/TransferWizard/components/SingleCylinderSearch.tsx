'use client'

import { useState } from 'react'
import {
    PiMagnifyingGlassDuotone,
    PiQrCodeDuotone,
    PiInfoDuotone,
} from 'react-icons/pi'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Alert from '@/components/ui/Alert'
import Tag from '@/components/ui/Tag'
import Badge from '@/components/ui/Badge'
import QRScanner from '@/components/shared/QRScanner'
import { VolumeGaugeMini } from '@/components/shared/VolumeGauge'
import type { Cylinder } from '@/types/cylinder'

interface SingleCylinderSearchProps {
    selectedCylinder: Cylinder | null
    cylinderSearch: string
    isSearching: boolean
    onCylinderSearchChange: (value: string) => void
    onSearch: () => void
    onClear: () => void
    onQRScan: (code: string) => void
}

export const SingleCylinderSearch: React.FC<SingleCylinderSearchProps> = ({
    selectedCylinder,
    cylinderSearch,
    isSearching,
    onCylinderSearchChange,
    onSearch,
    onClear,
    onQRScan,
}) => {
    const [showQRScanner, setShowQRScanner] = useState(false)

    const handleQRScan = (scannedData: string) => {
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
        onQRScan(code)
    }

    return (
        <>
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
                                        onCylinderSearchChange(e.target.value)
                                    }
                                    placeholder="Enter cylinder code..."
                                    onKeyDown={(e) =>
                                        e.key === 'Enter' && onSearch()
                                    }
                                    prefix={
                                        <PiMagnifyingGlassDuotone className="h-4 w-4 text-gray-400" />
                                    }
                                    className="flex-1"
                                />
                                <Button
                                    type="button"
                                    onClick={onSearch}
                                    loading={isSearching}
                                >
                                    Search
                                </Button>
                            </div>

                            <div className="text-center">
                                <p className="text-sm text-gray-600 mb-2">Or</p>
                                <Button
                                    type="button"
                                    variant="plain"
                                    onClick={() => setShowQRScanner(true)}
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
                            <Alert showIcon className="alert-info">
                                <PiInfoDuotone className="text-lg" />
                                Selected cylinder for transfer
                            </Alert>

                            <AdaptiveCard className="bg-blue-50 border-blue-200">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <p className="text-lg font-mono font-medium">
                                            {selectedCylinder.cylinderCode}
                                        </p>
                                        <div className="flex items-center gap-4 mt-2">
                                            <Tag>{selectedCylinder.type}</Tag>
                                            <Badge
                                                content={selectedCylinder.status}
                                                innerClass="bg-emerald-500 text-white"
                                            />
                                        </div>
                                        <div className="mt-3 space-y-1 text-sm">
                                            <p className="text-gray-600">
                                                Current Location:{' '}
                                                <span className="font-medium text-gray-900">
                                                    {
                                                        selectedCylinder
                                                            .currentOutlet?.name
                                                    }
                                                </span>
                                            </p>
                                            <p className="text-gray-600">
                                                Gas Level:{' '}
                                                {
                                                    selectedCylinder.currentGasVolume
                                                }
                                                /
                                                {selectedCylinder.maxGasVolume}{' '}
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
                                onClick={onClear}
                            >
                                Search Different Cylinder
                            </Button>
                        </div>
                    )}
                </div>
            </AdaptiveCard>

            {/* QR Scanner */}
            {showQRScanner && (
                <QRScanner
                    isOpen={true}
                    onScan={handleQRScan}
                    onClose={() => setShowQRScanner(false)}
                    title="Scan Cylinder QR Code"
                    description="Position the cylinder's QR code within the camera view"
                />
            )}
        </>
    )
}