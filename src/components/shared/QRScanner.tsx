'use client'

import { useEffect, useState, useCallback } from 'react'
import { 
  PiCameraDuotone, 
  PiXDuotone, 
  PiQrCodeDuotone, 
  PiWarningCircleDuotone,
  PiClockDuotone,
  PiCheckCircleDuotone,
  PiTrashDuotone,
  PiFlashlightDuotone,
  PiCameraRotateDuotone,
  PiTargetDuotone
} from 'react-icons/pi'
import { Scanner } from '@yudiel/react-qr-scanner'
import dynamic from 'next/dynamic'
import Button from '@/components/ui/Button'
import Alert from '@/components/ui/Alert'
import Dialog from '@/components/ui/Dialog'
import Input from '@/components/ui/Input'
import Spinner from '@/components/ui/Spinner'

interface ScanHistoryItem {
  id: string
  code: string
  timestamp: Date
  success: boolean
  error?: string
}

interface QRScannerProps {
  isOpen: boolean
  onClose: () => void
  onScan: (code: string) => void
  title?: string
  description?: string
  showHistory?: boolean
}

export default function QRScanner({ 
  isOpen,
  onClose, 
  onScan, 
  title = 'Scan QR Code',
  description = 'Position the QR code within the camera view',
  showHistory = true
}: QRScannerProps) {
  const [error, setError] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(true)
  const [manualCode, setManualCode] = useState('')
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([])
  const [showHistoryPanel, setShowHistoryPanel] = useState(false)
  const [flashOn, setFlashOn] = useState(false)
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment')
  const [lastScanTime, setLastScanTime] = useState<number>(0)
  const [cameraReady, setCameraReady] = useState(false)
  
  const handleError = useCallback((err: any) => {
    console.error('QR Scanner error details:', {
      error: err,
      message: err?.message,
      name: err?.name,
      type: typeof err
    })
    
    // Specific error handling
    if (err?.name === 'NotAllowedError' || err?.message?.includes('Permission denied')) {
      setError('Camera permission denied. Please allow camera access in your browser settings.')
    } else if (err?.name === 'NotFoundError' || err?.message?.includes('not found')) {
      setError('No camera found. Please check your device has a camera.')
    } else if (err?.name === 'NotReadableError' || err?.message?.includes('Could not start')) {
      setError('Camera is in use by another application. Please close other apps using the camera.')
    } else if (err?.name === 'OverconstrainedError') {
      setError('Camera does not support the required settings.')
    } else {
      setError(err?.message || 'Failed to access camera. Please check permissions and try again.')
    }
    
    setHasPermission(false)
  }, [])

  useEffect(() => {
    if (!isOpen) {
      // Reset states when dialog closes
      setIsScanning(false)
      setCameraReady(false)
      setError(null)
      return
    }

    // Check if we're in a secure context (HTTPS or localhost)
    if (!window.isSecureContext) {
      console.error('Camera access requires HTTPS or localhost')
      setError('Camera access requires a secure connection (HTTPS or localhost)')
      setHasPermission(false)
      return
    }
    
    // Check camera permissions on mount
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then((stream) => {
          console.log('Camera permission granted')
          setHasPermission(true)
          setIsScanning(true)
          setCameraReady(true)
          // Stop the test stream
          stream.getTracks().forEach(track => track.stop())
        })
        .catch((err) => {
          console.error('Camera permission error:', err)
          handleError(err)
        })
    }
    
    // Load scan history from localStorage
    const savedHistory = localStorage.getItem('qr-scan-history')
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory).map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }))
        setScanHistory(parsed)
      } catch (e) {
        console.error('Failed to load scan history:', e)
      }
    }
  }, [isOpen, handleError])

  const addToHistory = useCallback((code: string, success: boolean, error?: string) => {
    const now = Date.now()
    if (now - lastScanTime < 2000) return // Prevent duplicate scans within 2 seconds
    
    const historyItem: ScanHistoryItem = {
      id: `${now}-${Math.random().toString(36).substr(2, 9)}`,
      code,
      timestamp: new Date(),
      success,
      error
    }
    
    setScanHistory(prev => {
      const newHistory = [historyItem, ...prev].slice(0, 50) // Keep last 50 scans
      localStorage.setItem('qr-scan-history', JSON.stringify(newHistory))
      return newHistory
    })
    setLastScanTime(now)
  }, [lastScanTime])

  const handleScan = useCallback(async (result: any) => {
    // Handle both array and single result formats
    let scannedText = null
    
    if (Array.isArray(result) && result.length > 0) {
      scannedText = result[0]?.rawValue || result[0]?.text || result[0]
    } else if (result && typeof result === 'object') {
      scannedText = result.rawValue || result.text || result.data
    } else if (result && typeof result === 'string') {
      scannedText = result
    }
    
    if (scannedText) {
      console.log('QR Code scanned:', scannedText)
      setIsScanning(false)
      
      try {
        await onScan(scannedText)
        addToHistory(scannedText, true)
        onClose()
      } catch (error: any) {
        addToHistory(scannedText, false, error.message || 'Scan failed')
        setError(error.message || 'Failed to process scan')
        setIsScanning(true) // Continue scanning after error
      }
    }
  }, [onScan, onClose, addToHistory])

  const handleManualSubmit = async () => {
    if (manualCode.trim()) {
      try {
        await onScan(manualCode.trim())
        addToHistory(manualCode.trim(), true)
        onClose()
      } catch (error: any) {
        addToHistory(manualCode.trim(), false, error.message || 'Manual entry failed')
        setError(error.message || 'Failed to process code')
      }
    }
  }

  const clearHistory = useCallback(() => {
    setScanHistory([])
    localStorage.removeItem('qr-scan-history')
  }, [])

  const toggleFlash = useCallback(() => {
    setFlashOn(prev => !prev)
  }, [])

  const switchCamera = useCallback(() => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment')
  }, [])

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      onRequestClose={onClose}
      width={showHistoryPanel ? 800 : 600}
    >
      <div className="flex flex-col h-[600px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <PiQrCodeDuotone className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-600">{description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {showHistory && (
              <Button
                variant="plain"
                size="sm"
                onClick={() => setShowHistoryPanel(!showHistoryPanel)}
                className="flex items-center gap-2"
              >
                <PiClockDuotone className="h-4 w-4" />
                History ({scanHistory.length})
              </Button>
            )}
            <Button
              variant="plain"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <PiXDuotone className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="flex flex-1 gap-6">
          {/* Main Scanner Area */}
          <div className={`${showHistoryPanel ? 'flex-1' : 'w-full'} space-y-4`}>
            {/* Error Display */}
            {error && (
              <Alert type="danger" className="mb-4">
                <PiWarningCircleDuotone className="h-4 w-4" />
                <span>{error}</span>
                <Button
                  variant="plain" 
                  size="sm"
                  onClick={() => setError(null)}
                  className="ml-auto"
                >
                  <PiXDuotone className="h-4 w-4" />
                </Button>
              </Alert>
            )}

            {/* Camera View */}
            {hasPermission === null ? (
              <div className="flex items-center justify-center h-80 bg-gray-100 rounded-xl">
                <div className="text-center">
                  <Spinner size="lg" className="mb-4" />
                  <p className="text-gray-600">Requesting camera access...</p>
                </div>
              </div>
            ) : hasPermission === false ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PiCameraDuotone className="h-8 w-8 text-gray-400" />
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">Camera Access Required</h4>
                <p className="text-gray-600 mb-4">
                  Unable to access camera. Please enable camera permissions and try again.
                </p>
              </div>
            ) : (
              <div className="relative">
                {isScanning && (
                  <div className="relative bg-black rounded-xl overflow-hidden h-80 qr-scanner-container">
                    <Scanner
                      onScan={handleScan}
                      onError={handleError}
                      scanDelay={500}
                      constraints={{
                        facingMode: facingMode
                      }}
                      formats={['qr_code', 'code_128', 'code_39', 'code_93', 'ean_13', 'ean_8']}
                      paused={!isScanning}
                      allowMultiple={false}
                      styles={{
                        container: {
                          width: '100%',
                          height: '100%',
                          position: 'relative' as const
                        },
                        video: {
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover' as const,
                          display: 'block'
                        }
                      }}
                    />
                    
                    {/* Enhanced Scanning Overlay */}
                    <div className="absolute inset-0 pointer-events-none">
                      {/* Background overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-30" />
                      
                      {/* Scanning target */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-72 h-72 relative">
                          {/* Animated corners */}
                          <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-green-400 rounded-tl-2xl animate-pulse" />
                          <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-green-400 rounded-tr-2xl animate-pulse" />
                          <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-green-400 rounded-bl-2xl animate-pulse" />
                          <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-green-400 rounded-br-2xl animate-pulse" />
                          
                          {/* Center target */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <PiTargetDuotone className="h-8 w-8 text-green-400 animate-pulse" />
                          </div>
                          
                          {/* Scanning line */}
                          <div className="absolute inset-x-4 top-1/2 h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-scan-line" />
                        </div>
                      </div>
                      
                      {/* Camera controls */}
                      <div className="absolute top-4 right-4 flex gap-2">
                        <Button
                          variant="plain"
                          size="sm"
                          onClick={switchCamera}
                          className="bg-black bg-opacity-50 text-white hover:bg-opacity-70"
                        >
                          <PiCameraRotateDuotone className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="plain"
                          size="sm"
                          onClick={toggleFlash}
                          className={`bg-black bg-opacity-50 hover:bg-opacity-70 ${flashOn ? 'text-yellow-400' : 'text-white'}`}
                        >
                          <PiFlashlightDuotone className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {/* Instructions */}
                      <div className="absolute bottom-6 left-0 right-0 text-center">
                        <div className="bg-black bg-opacity-60 inline-block px-4 py-2 rounded-lg backdrop-blur-sm">
                          <p className="text-white text-sm font-medium">
                            {cameraReady ? 'Position QR code within the target area' : 'Initializing camera...'}
                          </p>
                          <p className="text-gray-300 text-xs mt-1">
                            {cameraReady ? 'Make sure the code is clearly visible and well-lit' : 'Please wait...'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Manual Entry */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Manual Entry</h4>
              <div className="flex gap-3">
                <Input
                  placeholder="Enter QR code or cylinder ID manually"
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
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Submit
                </Button>
              </div>
            </div>
          </div>

          {/* History Panel */}
          {showHistoryPanel && (
            <div className="w-80 bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-gray-900">Scan History</h4>
                {scanHistory.length > 0 && (
                  <Button
                    variant="plain"
                    size="sm"
                    onClick={clearHistory}
                    className="text-red-600 hover:text-red-700"
                  >
                    <PiTrashDuotone className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {scanHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <PiClockDuotone className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No scans yet</p>
                  </div>
                ) : (
                  scanHistory.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3 rounded-lg border ${
                        item.success 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-mono text-gray-900 truncate">
                            {item.code}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {item.timestamp.toLocaleTimeString()}
                          </p>
                          {item.error && (
                            <p className="text-xs text-red-600 mt-1">{item.error}</p>
                          )}
                        </div>
                        <div className={`flex-shrink-0 ml-2 ${
                          item.success ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {item.success ? (
                            <PiCheckCircleDuotone className="h-4 w-4" />
                          ) : (
                            <PiWarningCircleDuotone className="h-4 w-4" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes scan-line {
          0% { transform: translateY(-100%); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(100%); opacity: 0; }
        }
        
        .animate-scan-line {
          animation: scan-line 2s ease-in-out infinite;
        }
        
        :global(.qr-scanner-container) {
          position: relative;
          width: 100%;
          height: 320px;
          background: #000;
          border-radius: 12px;
          overflow: hidden;
        }
        
        :global(.qr-scanner-container > div) {
          width: 100% !important;
          height: 100% !important;
          position: relative !important;
        }
        
        :global(.qr-scanner-container video) {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
          z-index: 1 !important;
        }
        
        :global(.qr-scanner-container canvas) {
          display: none !important;
        }
      `}</style>
    </Dialog>
  )
}