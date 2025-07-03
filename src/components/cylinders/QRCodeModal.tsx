'use client'

import { useState } from 'react'
import { HiDownload, HiPrinter, HiX, HiClipboard } from 'react-icons/hi'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Loading from '@/components/shared/Loading'
import { qrService } from '@/services/api/qr.service'
import { toast } from 'react-hot-toast'
import type { Cylinder } from '@/types/cylinder'
import type { QRCodeData } from '@/services/api/qr.service'

interface QRCodeModalProps {
  isOpen: boolean
  onClose: () => void
  cylinder: Cylinder
  qrCodeData: QRCodeData | null
  isLoading: boolean
}

export default function QRCodeModal({
  isOpen,
  onClose,
  cylinder,
  qrCodeData,
  isLoading,
}: QRCodeModalProps) {
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async (format: 'png' | 'svg') => {
    if (!cylinder) return

    setDownloading(true)
    try {
      const blob = await qrService.downloadCylinderQRCode(cylinder.id, format)
      const filename = `cylinder-${cylinder.cylinderCode}-qr.${format}`
      qrService.downloadQRImage(blob, filename)
      toast.success(`QR code downloaded as ${format.toUpperCase()}`)
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Failed to download QR code')
    } finally {
      setDownloading(false)
    }
  }

  const handlePrint = () => {
    if (!qrCodeData) return

    const printWindow = window.open('', '_blank', 'width=600,height=800')
    
    if (!printWindow) {
      toast.error('Please allow popups to print the QR code')
      return
    }

    const printContent = `
      <html>
        <head>
          <title>QR Code - ${cylinder.cylinderCode}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
            }
            .container {
              text-align: center;
              padding: 20px;
            }
            .qr-image {
              width: 300px;
              height: 300px;
              margin: 20px auto;
            }
            .info {
              margin: 10px 0;
              font-size: 18px;
            }
            .code {
              font-size: 24px;
              font-weight: bold;
              margin: 20px 0;
            }
            @media print {
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Cylinder QR Code</h1>
            <img src="${qrCodeData.dataURL}" alt="QR Code" class="qr-image" />
            <div class="code">${cylinder.cylinderCode}</div>
            <div class="info">Type: ${cylinder.type}</div>
            <div class="info">QR: ${cylinder.qrCode}</div>
          </div>
        </body>
      </html>
    `

    printWindow.document.write(printContent)
    printWindow.document.close()
    
    // Wait for the content to load before printing
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.focus()
        printWindow.print()
        
        // Close window after printing
        printWindow.onafterprint = () => {
          printWindow.close()
        }
      }, 250)
    }
  }

  const handleCopyQRCode = () => {
    if (!cylinder.qrCode) return

    navigator.clipboard.writeText(cylinder.qrCode).then(() => {
      toast.success('QR code copied to clipboard')
    }).catch(() => {
      toast.error('Failed to copy QR code')
    })
  }

  return (
    <Dialog isOpen={isOpen} onClose={onClose} width={500}>
      <div className="flex items-center justify-between mb-4">
        <h4>QR Code</h4>
        <Button
          size="sm"
          variant="plain"
          shape="circle"
          icon={<HiX />}
          onClick={onClose}
        />
      </div>

      <Loading loading={isLoading}>
        {qrCodeData ? (
          <>
            <Card className="text-center mb-4">
              <img
                src={qrCodeData.dataURL}
                alt="QR Code"
                className="w-64 h-64 mx-auto mb-4"
              />
              <div className="space-y-2">
                <h5 className="text-lg font-semibold">{cylinder.cylinderCode}</h5>
                <div className="flex items-center justify-center gap-2">
                  <Badge
                    content={cylinder.type}
                    innerClass="bg-blue-500 text-white"
                  />
                  <Badge
                    content={cylinder.status.charAt(0).toUpperCase() + cylinder.status.slice(1)}
                    innerClass={getCylinderStatusClass(cylinder.status)}
                  />
                </div>
                <div className="text-sm text-gray-600 font-mono">
                  {cylinder.qrCode}
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="solid"
                icon={<HiDownload />}
                onClick={() => handleDownload('png')}
                loading={downloading}
                disabled={downloading}
              >
                Download PNG
              </Button>
              <Button
                variant="plain"
                icon={<HiDownload />}
                onClick={() => handleDownload('svg')}
                loading={downloading}
                disabled={downloading}
              >
                Download SVG
              </Button>
              <Button
                variant="plain"
                icon={<HiPrinter />}
                onClick={handlePrint}
                className="col-span-1"
              >
                Print
              </Button>
              <Button
                variant="plain"
                icon={<HiClipboard />}
                onClick={handleCopyQRCode}
                className="col-span-1"
              >
                Copy Code
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading QR code...</p>
          </div>
        )}
      </Loading>
    </Dialog>
  )
}

// Helper function to get cylinder status color
const getCylinderStatusClass = (status: string) => {
  switch (status) {
    case 'available':
      return 'bg-emerald-500 text-white'
    case 'leased':
      return 'bg-blue-500 text-white'
    case 'refilling':
      return 'bg-yellow-500 text-white'
    case 'maintenance':
      return 'bg-orange-500 text-white'
    case 'damaged':
      return 'bg-red-500 text-white'
    case 'retired':
      return 'bg-gray-500 text-white'
    default:
      return 'bg-gray-500 text-white'
  }
}