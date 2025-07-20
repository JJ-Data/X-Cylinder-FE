'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  PiArrowLeftDuotone, 
  PiPrinter,
  PiWarningCircleDuotone
} from 'react-icons/pi'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { useSwapReceipt, useMarkReceiptPrinted } from '@/hooks/useSwap'
import { format } from 'date-fns'
import { toast } from 'sonner'

interface SwapReceiptPageProps {
  swapId: number
}

export default function SwapReceiptPage({ swapId }: SwapReceiptPageProps) {
  const router = useRouter()
  
  // API hooks
  const { data: receiptData, isLoading, error } = useSwapReceipt(swapId)
  const markReceiptPrinted = useMarkReceiptPrinted()
  
  // Auto-print when component loads (optional)
  useEffect(() => {
    if (receiptData && !isLoading) {
      // Small delay to ensure content is rendered
      const timer = setTimeout(() => {
        window.print()
      }, 500)
      
      return () => clearTimeout(timer)
    }
  }, [receiptData, isLoading])
  
  const handlePrint = () => {
    window.print()
  }
  
  const handleMarkPrinted = async () => {
    try {
      await markReceiptPrinted.trigger(swapId)
      toast.success('Receipt marked as printed')
      router.push(`/admin/swaps/${swapId}`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to mark receipt as printed')
    }
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
  
  if (error || !receiptData) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">
          <PiWarningCircleDuotone className="text-6xl text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-600 mb-2">Receipt Not Available</h1>
          <p className="text-gray-600 mb-4">
            Could not load the receipt data for this swap.
          </p>
          <Button
            variant="solid"
            icon={<PiArrowLeftDuotone />}
            onClick={() => router.push(`/admin/swaps/${swapId}`)}
          >
            Back to Swap Details
          </Button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      {/* Print Controls - Hidden during print */}
      <div className="flex items-center justify-between mb-6 print:hidden">
        <div className="flex items-center gap-4">
          <Button
            variant="plain"
            icon={<PiArrowLeftDuotone />}
            onClick={() => router.push(`/admin/swaps/${swapId}`)}
          >
            Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">
            Swap Receipt #{swapId}
          </h1>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="solid"
            icon={<PiPrinter />}
            onClick={handlePrint}
          >
            Print Again
          </Button>
          {!receiptData.swap.receiptPrinted && (
            <Button
              variant="solid"
              onClick={handleMarkPrinted}
              loading={markReceiptPrinted.isMutating}
            >
              Mark as Printed
            </Button>
          )}
        </div>
      </div>
      
      {/* Receipt Content */}
      <Card className="max-w-2xl mx-auto print:shadow-none print:max-w-none">
        <div className="p-8 print:p-12">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">CylinderX</h1>
            <p className="text-lg text-gray-600 mb-1">Cylinder Swap Receipt</p>
            <p className="text-sm text-gray-500">Receipt #{swapId}</p>
            <div className="w-16 h-1 bg-blue-500 mx-auto mt-3"></div>
          </div>
          
          {/* Company & Customer Info */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Outlet Information</h4>
              <div className="text-sm space-y-1">
                <p className="font-medium">{receiptData.outlet.name}</p>
                <p>{receiptData.outlet.location}</p>
                {receiptData.outlet.phone && <p>Tel: {receiptData.outlet.phone}</p>}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Customer Information</h4>
              <div className="text-sm space-y-1">
                <p className="font-medium">
                  {receiptData.customer.firstName} {receiptData.customer.lastName}
                </p>
                <p>{receiptData.customer.email}</p>
                {receiptData.customer.phone && <p>Tel: {receiptData.customer.phone}</p>}
              </div>
            </div>
          </div>
          
          {/* Swap Details */}
          <div className="border-t border-b border-gray-200 py-6 mb-6">
            <h4 className="font-semibold text-gray-900 mb-4">Swap Transaction Details</h4>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <h5 className="font-medium text-red-800 mb-3">Returned Cylinder</h5>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span>Cylinder Code:</span>
                    <span className="font-mono">{receiptData.oldCylinder.cylinderCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Type:</span>
                    <span>{receiptData.oldCylinder.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gas Volume:</span>
                    <span>{receiptData.oldCylinder.currentGasVolume} kg</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h5 className="font-medium text-green-800 mb-3">Replacement Cylinder</h5>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span>Cylinder Code:</span>
                    <span className="font-mono">{receiptData.newCylinder.cylinderCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Type:</span>
                    <span>{receiptData.newCylinder.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gas Volume:</span>
                    <span>{receiptData.newCylinder.currentGasVolume}/{receiptData.newCylinder.maxGasVolume} kg</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Transaction Summary */}
          <div className="mb-8">
            <div className="grid md:grid-cols-2 gap-4 text-sm mb-4">
              <div className="flex justify-between py-2">
                <span>Transaction Date:</span>
                <span className="font-medium">
                  {format(new Date(receiptData.swap.swapDate), 'PPPp')}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span>Condition Assessment:</span>
                <span className="font-medium capitalize">{receiptData.swap.condition}</span>
              </div>
              {receiptData.swap.weightRecorded && (
                <div className="flex justify-between py-2">
                  <span>Weight Recorded:</span>
                  <span className="font-medium">{receiptData.swap.weightRecorded} kg</span>
                </div>
              )}
              <div className="flex justify-between py-2">
                <span>Staff:</span>
                <span className="font-medium">
                  {receiptData.swap.staff?.firstName} {receiptData.swap.staff?.lastName}
                </span>
              </div>
            </div>
            
            {/* Fee Breakdown */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center py-2">
                <span className="text-lg font-semibold">Total Swap Fee:</span>
                <span className="text-xl font-bold text-blue-600">
                  ₦{parseFloat(receiptData.swap.swapFee).toLocaleString()}
                </span>
              </div>
              
              {receiptData.swap.reasonForFee && (
                <p className="text-xs text-gray-600 mt-2">
                  Fee Reason: {receiptData.swap.reasonForFee}
                </p>
              )}
            </div>
          </div>
          
          {/* Additional Notes */}
          {(receiptData.swap.damageNotes || receiptData.swap.notes) && (
            <div className="border-t border-gray-200 pt-6 mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Additional Notes</h4>
              {receiptData.swap.damageNotes && (
                <div className="mb-3">
                  <p className="text-xs text-gray-600 mb-1">Damage Notes:</p>
                  <p className="text-sm bg-gray-50 rounded p-2">{receiptData.swap.damageNotes}</p>
                </div>
              )}
              {receiptData.swap.notes && (
                <div>
                  <p className="text-xs text-gray-600 mb-1">Service Notes:</p>
                  <p className="text-sm bg-gray-50 rounded p-2">{receiptData.swap.notes}</p>
                </div>
              )}
            </div>
          )}
          
          {/* Footer */}
          <div className="text-center text-sm text-gray-500 border-t border-gray-200 pt-6">
            <p className="font-medium mb-2">Thank you for choosing CylinderX!</p>
            <p>For support, contact your local outlet</p>
            <p className="mt-4 text-xs">
              This receipt was generated on {format(new Date(), 'PPPp')}
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}