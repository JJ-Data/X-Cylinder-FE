'use client'

import { useEffect, useState, useCallback } from 'react'
import { 
  PiCameraDuotone, 
  PiXDuotone, 
  PiQrCodeDuotone, 
  PiWarningCircleDuotone 
} from 'react-icons/pi'
import { Scanner } from '@yudiel/react-qr-scanner'
import Button from '@/components/ui/Button'
import Alert from '@/components/ui/Alert'
import Dialog from '@/components/ui/Dialog'
import Input from '@/components/ui/Input'
import Spinner from '@/components/ui/Spinner'

interface QRScannerProps {
  isOpen: boolean
  onClose: () => void
  onScan: (code: string) => void
  title?: string
  description?: string
}

export default function QRScanner({ 
  isOpen,
  onClose, 
  onScan, 
  title = 'Scan QR Code',
  description = 'Position the QR code within the camera view'
}: QRScannerProps) {
  const [error, setError] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(true)
  const [manualCode, setManualCode] = useState('')
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  
  useEffect(() => {
    // Check camera permissions on mount
    if (isOpen && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(() => setHasPermission(true))
        .catch(() => setHasPermission(false))
    }
  }, [isOpen])

  const handleScan = useCallback((result: any) => {
    if (result && result.length > 0) {
      const scannedText = result[0].rawValue
      setIsScanning(false)
      onScan(scannedText)
      onClose()
    }
  }, [onScan, onClose])

  const handleError = useCallback((err: any) => {
    console.error('QR Scanner error:', err)
    setError('Failed to access camera. Please check permissions.')
    setHasPermission(false)
  }, [])

  const handleManualSubmit = () => {
    if (manualCode.trim()) {
      onScan(manualCode.trim())
      onClose()
    }
  }

  const scannerStyles = {
    container: {
      position: 'relative' as const,
      width: '100%',
      height: '320px'
    }
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      onRequestClose={onClose}
      width={500}
    >
      <div className="flex items-center justify-between mb-4">
        <h4 className="flex items-center gap-2">
          <PiQrCodeDuotone className="text-xl" />
          {title}
        </h4>
        <Button
          variant="plain"
          size="sm"
          onClick={onClose}
          icon={<PiXDuotone />}
        />
      </div>

      <div className="space-y-4">
        <p className="text-sm text-gray-600">{description}</p>

        {hasPermission === null ? (
          <div className="flex items-center justify-center h-80">
            <Spinner size="lg" />
          </div>
        ) : hasPermission === false || error ? (
          <div className="text-center py-12">
            <PiCameraDuotone className="text-6xl text-gray-400 mx-auto mb-4" />
            <Alert type="danger" showIcon className="mb-4">
            <PiWarningCircleDuotone className="text-lg" />
              {error || 'Camera permission denied'}
            </Alert>
            <p className="text-gray-600 mb-4">
              Unable to access camera. You can enter the code manually instead.
            </p>
          </div>
        ) : (
          <div className="relative">
            {isScanning && (
              <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={scannerStyles.container}>
                <Scanner
                  onScan={handleScan}
                  onError={handleError}
                  scanDelay={300}
                  constraints={{
                    facingMode: 'environment',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                  } as MediaTrackConstraints}
                  styles={{
                    container: {
                      width: '100%',
                      height: '100%'
                    },
                    video: {
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }
                  }}
                />
                
                {/* Scanning overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-64 h-64 relative">
                      {/* Corner markers */}
                      <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-white rounded-tl-lg" />
                      <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-white rounded-tr-lg" />
                      <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-white rounded-bl-lg" />
                      <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-white rounded-br-lg" />
                      
                      {/* Scanning line animation */}
                      <div className="absolute inset-x-0 h-0.5 bg-green-400 animate-scan" />
                    </div>
                  </div>
                  
                  {/* Instructions */}
                  <div className="absolute bottom-4 left-0 right-0 text-center">
                    <p className="text-white text-sm bg-black bg-opacity-50 inline-block px-3 py-1 rounded">
                      Align QR code within the frame
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Manual entry */}
        <div className="border-t pt-4">
          <p className="text-sm text-gray-600 mb-2">Or enter code manually:</p>
          <div className="flex gap-2">
            <Input
              placeholder="Enter cylinder code"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && manualCode.trim()) {
                  handleManualSubmit()
                }
              }}
              className="flex-1"
            />
            <Button
              variant="solid"
              onClick={handleManualSubmit}
              disabled={!manualCode.trim()}
            >
              Submit
            </Button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          50% { transform: translateY(100%); }
          100% { transform: translateY(-100%); }
        }
        
        .animate-scan {
          animation: scan 3s ease-in-out infinite;
        }
      `}</style>
    </Dialog>
  )
}