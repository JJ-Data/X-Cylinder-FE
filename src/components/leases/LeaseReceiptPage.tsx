'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  PiArrowLeftDuotone, 
  PiPrinter,
  PiWarningCircleDuotone
} from 'react-icons/pi'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { useLease } from '@/hooks/useLeases'
import { format } from 'date-fns'
import { formatCurrency } from '@/utils/formatCurrency'

interface LeaseReceiptPageProps {
  leaseId: number
}

export default function LeaseReceiptPage({ leaseId }: LeaseReceiptPageProps) {
  const router = useRouter()
  
  // API hooks
  const { data: leaseData, isLoading, error } = useLease(leaseId)
  
  // Auto-print when component loads
  useEffect(() => {
    if (leaseData && !isLoading) {
      // Small delay to ensure content is rendered
      const timer = setTimeout(() => {
        window.print()
      }, 500)
      
      return () => clearTimeout(timer)
    }
  }, [leaseData, isLoading])
  
  const handlePrint = () => {
    window.print()
  }
  
  const handleBackToLeases = () => {
    router.push('/admin/leases')
  }
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }
  
  if (error || !leaseData) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">
          <PiWarningCircleDuotone className="text-6xl text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-600 mb-2">Receipt Not Available</h1>
          <p className="text-gray-600 mb-4">
            Could not load the receipt data for this lease.
          </p>
          <Button
            variant="solid"
            icon={<PiArrowLeftDuotone />}
            onClick={handleBackToLeases}
          >
            Back to Leases
          </Button>
        </div>
      </div>
    )
  }
  
  // Payment method is not available in LeaseRecord
  const paymentMethodLabel = 'Cash' // Default to cash
  
  return (
    <div className="container mx-auto px-4 py-6">
      {/* Print Controls - Hidden during print */}
      <div className="flex items-center justify-between mb-6 print:hidden">
        <div className="flex items-center gap-4">
          <Button
            variant="plain"
            icon={<PiArrowLeftDuotone />}
            onClick={handleBackToLeases}
          >
            Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">
            Lease Receipt #{leaseId}
          </h1>
        </div>
        
        <Button
          variant="solid"
          icon={<PiPrinter />}
          onClick={handlePrint}
        >
          Print Receipt
        </Button>
      </div>
      
      {/* Receipt Content */}
      <Card className="max-w-2xl mx-auto print:shadow-none print:max-w-none">
        <div className="p-8 print:p-12">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">CylinderX</h1>
            <p className="text-lg text-gray-600 mb-1">Cylinder Lease Receipt</p>
            <p className="text-sm text-gray-500">Receipt #{leaseId}</p>
            <div className="w-16 h-1 bg-blue-500 mx-auto mt-3"></div>
          </div>
          
          {/* Company & Customer Info */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Outlet Information</h4>
              <div className="text-sm space-y-1">
                <p className="font-medium">{leaseData.outlet?.name || 'N/A'}</p>
                <p>{leaseData.outlet?.location || 'Location not specified'}</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Customer Information</h4>
              <div className="text-sm space-y-1">
                <p className="font-medium">
                  {leaseData.customer?.firstName} {leaseData.customer?.lastName}
                </p>
                <p>{leaseData.customer?.email}</p>
              </div>
            </div>
          </div>
          
          {/* Cylinder Details */}
          <div className="border-t border-b border-gray-200 py-6 mb-6">
            <h4 className="font-semibold text-gray-900 mb-4">Cylinder Details</h4>
            
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span>Cylinder Code:</span>
                  <span className="font-mono">{leaseData.cylinder?.cylinderCode || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Type:</span>
                  <span>{leaseData.cylinder?.type || 'Standard'}</span>
                </div>
                <div className="flex justify-between">
                  <span>QR Code:</span>
                  <span className="font-mono text-xs">{leaseData.cylinder?.qrCode || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Lease Terms */}
          <div className="mb-8">
            <h4 className="font-semibold text-gray-900 mb-4">Lease Terms</h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm mb-4">
              <div className="flex justify-between py-2">
                <span>Lease Date:</span>
                <span className="font-medium">
                  {format(new Date(leaseData.leaseDate), 'PPP')}
                </span>
              </div>
              {leaseData.expectedReturnDate && (
                <div className="flex justify-between py-2">
                  <span>Expected Return:</span>
                  <span className="font-medium">
                    {format(new Date(leaseData.expectedReturnDate), 'PPP')}
                  </span>
                </div>
              )}
              <div className="flex justify-between py-2">
                <span>Payment Method:</span>
                <span className="font-medium">{paymentMethodLabel}</span>
              </div>
              <div className="flex justify-between py-2">
                <span>Staff:</span>
                <span className="font-medium">
                  {leaseData.staff?.firstName} {leaseData.staff?.lastName}
                </span>
              </div>
            </div>
            
            {/* Payment Summary */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center py-2">
                <span className="text-lg font-semibold">Security Deposit:</span>
                <span className="text-xl font-bold text-blue-600">
                  {formatCurrency(parseFloat(leaseData.depositAmount))}
                </span>
              </div>
              
              <p className="text-xs text-gray-600 mt-2">
                This deposit will be refunded upon return of the cylinder in good condition.
              </p>
            </div>
          </div>
          
          {/* Additional Notes */}
          {leaseData.notes && (
            <div className="border-t border-gray-200 pt-6 mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Additional Notes</h4>
              <p className="text-sm bg-gray-50 rounded p-2">{leaseData.notes}</p>
            </div>
          )}
          
          {/* Footer */}
          <div className="text-center text-sm text-gray-500 border-t border-gray-200 pt-6">
            <p className="font-medium mb-2">Thank you for choosing CylinderX!</p>
            <p>
              {leaseData.expectedReturnDate 
                ? 'Please return the cylinder by the expected return date to receive your deposit refund.'
                : 'Your deposit will be refunded when you return the cylinder in good condition.'}
            </p>
            <p className="mt-4 text-xs">
              This receipt was generated on {format(new Date(), 'PPPp')}
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}