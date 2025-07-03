import { useState, useCallback } from 'react'
import { qrService } from '@/services/api/qr.service'
import type { QRCodeData } from '@/services/api/qr.service'

export const useQRCode = () => {
  const [qrCodeData, setQRCodeData] = useState<QRCodeData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchQRCode = useCallback(async (cylinderId: number) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const data = await qrService.getCylinderQRCode(cylinderId)
      setQRCodeData(data)
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch QR code'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const downloadQRCode = useCallback(async (cylinderId: number, format: 'png' | 'svg' = 'png') => {
    try {
      const blob = await qrService.downloadCylinderQRCode(cylinderId, format)
      return blob
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to download QR code'
      setError(errorMessage)
      throw err
    }
  }, [])

  const validateQRCode = useCallback(async (qrData: string) => {
    try {
      const result = await qrService.validateQRCode({ qrData })
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to validate QR code'
      setError(errorMessage)
      throw err
    }
  }, [])

  const reset = useCallback(() => {
    setQRCodeData(null)
    setError(null)
    setIsLoading(false)
  }, [])

  return {
    qrCodeData,
    isLoading,
    error,
    fetchQRCode,
    downloadQRCode,
    validateQRCode,
    reset,
  }
}