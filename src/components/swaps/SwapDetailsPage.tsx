'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  PiArrowLeftDuotone, 
  PiReceiptDuotone, 
  PiPrinter,
  PiCheckCircleDuotone,
  PiArrowsCounterClockwiseDuotone,
  PiUserDuotone,
  PiWarningCircleDuotone
} from 'react-icons/pi'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Alert from '@/components/ui/Alert'
import { useSwap, useSwapReceipt, useMarkReceiptPrinted } from '@/hooks/useSwap'
import { format } from 'date-fns'
import { toast } from 'sonner'

const conditionColors = {
  good: 'green',
  poor: 'amber',
  damaged: 'red'
} as const

const conditionLabels = {
  good: 'Good',
  poor: 'Poor', 
  damaged: 'Damaged'
} as const

interface SwapDetailsPageProps {
  swapId: number
}

export default function SwapDetailsPage({ swapId }: SwapDetailsPageProps) {
  const router = useRouter()
  const [showReceipt, setShowReceipt] = useState(false)
  
  // API hooks
  const { data: swap, isLoading, error } = useSwap(swapId)
  const { data: receiptData } = useSwapReceipt(swapId)
  const markReceiptPrinted = useMarkReceiptPrinted()
  
  const handleMarkPrinted = async () => {
    try {
      await markReceiptPrinted.trigger(swapId)
      toast.success('Receipt marked as printed')
    } catch (error: any) {
      toast.error(error.message || 'Failed to mark receipt as printed')
    }
  }
  
  const handlePrintReceipt = () => {
    setShowReceipt(true)
    // In a real application, this would trigger the print dialog
    setTimeout(() => {
      window.print()
    }, 100)
  }
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }
  
  if (error || !swap) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">
          <PiWarningCircleDuotone className="text-6xl text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-600 mb-2">Swap Not Found</h1>
          <p className="text-gray-600 mb-4">
            The swap record you're looking for could not be found.
          </p>
          <Button
            variant="solid"
            icon={<PiArrowLeftDuotone />}
            onClick={() => router.push('/admin/swaps')}
          >
            Back to Swaps
          </Button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="plain"
            icon={<PiArrowLeftDuotone />}
            onClick={() => router.push('/admin/swaps')}
          >
            Back to Swaps
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Swap #{swap.id}
            </h1>
            <p className="text-gray-600">
              {format(new Date(swap.swapDate), 'PPPp')}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {!swap.receiptPrinted && (
            <Button
              variant="solid"
              icon={<PiCheckCircleDuotone />}
              onClick={handleMarkPrinted}
              loading={markReceiptPrinted.isMutating}
            >
              Mark Printed
            </Button>
          )}
          <Button
            variant="solid"
            icon={<PiReceiptDuotone />}
            onClick={() => setShowReceipt(!showReceipt)}
          >
            {showReceipt ? 'Hide' : 'View'} Receipt
          </Button>
          <Button
            variant="solid"
            icon={<PiPrinter />}
            onClick={handlePrintReceipt}
          >
            Print
          </Button>
        </div>
      </div>
      
      {/* Status Alert */}
      <Alert showIcon type="success" className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Swap Completed Successfully</p>
            <p className="text-sm">
              Cylinder has been successfully swapped and the lease has been updated.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
              swap.receiptPrinted 
                ? 'bg-green-100 text-green-800' 
                : 'bg-amber-100 text-amber-800'
            }`}>
              {swap.receiptPrinted ? 'Receipt Printed' : 'Receipt Pending'}
            </span>
          </div>
        </div>
      </Alert>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <PiUserDuotone className="text-2xl text-blue-500" />
              <h3 className="text-lg font-semibold">Customer Information</h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Customer Name</p>
                <p className="font-medium">
                  {swap.lease?.customer?.firstName} {swap.lease?.customer?.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Email</p>
                <p className="font-medium">{swap.lease?.customer?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Outlet</p>
                <p className="font-medium">{swap.lease?.outlet?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Location</p>
                <p className="font-medium">{swap.lease?.outlet?.location}</p>
              </div>
            </div>
          </Card>
          
          {/* Cylinder Swap Details */}
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <PiArrowsCounterClockwiseDuotone className="text-2xl text-green-500" />
              <h3 className="text-lg font-semibold">Cylinder Swap Details</h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Old Cylinder */}
              <div className="bg-red-50 rounded-lg p-4">
                <h4 className="font-medium text-red-700 mb-3">Returned Cylinder</h4>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-600">Cylinder Code</p>
                    <p className="font-mono text-sm">{swap.oldCylinder?.cylinderCode}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Type</p>
                    <p className="text-sm">{swap.oldCylinder?.type}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Gas Volume</p>
                    <p className="text-sm">{swap.oldCylinder?.currentGasVolume} kg</p>
                  </div>
                </div>
              </div>
              
              {/* New Cylinder */}
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-medium text-green-700 mb-3">Replacement Cylinder</h4>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-600">Cylinder Code</p>
                    <p className="font-mono text-sm">{swap.newCylinder?.cylinderCode}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Type</p>
                    <p className="text-sm">{swap.newCylinder?.type}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Gas Volume</p>
                    <p className="text-sm">{swap.newCylinder?.currentGasVolume}/{swap.newCylinder?.maxGasVolume} kg</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
          
          {/* Assessment Details */}
          <Card>
            <h3 className="text-lg font-semibold mb-4">Assessment Details</h3>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Condition</p>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  swap.condition === 'good' ? 'bg-green-100 text-green-800' :
                  swap.condition === 'poor' ? 'bg-amber-100 text-amber-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {conditionLabels[swap.condition as keyof typeof conditionLabels]}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Weight Recorded</p>
                <p className="font-medium">
                  {swap.weightRecorded ? `${swap.weightRecorded} kg` : 'Not recorded'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Swap Fee</p>
                <p className="font-medium text-blue-600">
                  ₦{parseFloat(swap.swapFee).toLocaleString()}
                </p>
              </div>
            </div>
            
            {swap.damageNotes && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-1">Damage Notes</p>
                <p className="text-sm bg-gray-50 rounded p-3">{swap.damageNotes}</p>
              </div>
            )}
            
            {swap.reasonForFee && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-1">Reason for Fee</p>
                <p className="text-sm bg-amber-50 rounded p-3">{swap.reasonForFee}</p>
              </div>
            )}
            
            {swap.notes && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-1">Additional Notes</p>
                <p className="text-sm bg-gray-50 rounded p-3">{swap.notes}</p>
              </div>
            )}
          </Card>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            
            <div className="space-y-3">
              <Link 
                href={`/admin/leases/${swap.leaseId}`}
                className="block"
              >
                <Button variant="solid" className="w-full justify-start">
                  View Lease Details
                </Button>
              </Link>
              <Link 
                href={`/admin/customers/${swap.lease?.customer?.id}`}
                className="block"
              >
                <Button variant="solid" className="w-full justify-start">
                  View Customer Profile
                </Button>
              </Link>
              <Link 
                href={`/admin/cylinders/${swap.newCylinderId}`}
                className="block"
              >
                <Button variant="solid" className="w-full justify-start">
                  View New Cylinder
                </Button>
              </Link>
            </div>
          </Card>
          
          {/* Staff Information */}
          <Card>
            <h3 className="text-lg font-semibold mb-4">Staff Information</h3>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Processed By</p>
                <p className="font-medium">
                  {swap.staff?.firstName} {swap.staff?.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Staff Email</p>
                <p className="text-sm">{swap.staff?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Processing Date</p>
                <p className="text-sm">{format(new Date(swap.swapDate), 'PPPp')}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
      
      {/* Receipt Section */}
      {showReceipt && receiptData && (
        <Card className="mt-6 print:shadow-none">
          <div className="print:p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">CylinderX</h2>
              <p className="text-gray-600">Cylinder Swap Receipt</p>
              <p className="text-sm text-gray-500">Receipt #{swap.id}</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="font-semibold mb-2">Customer Information</h4>
                <div className="text-sm space-y-1">
                  <p>{receiptData.customer.firstName} {receiptData.customer.lastName}</p>
                  <p>{receiptData.customer.email}</p>
                  {receiptData.customer.phone && <p>{receiptData.customer.phone}</p>}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Outlet Information</h4>
                <div className="text-sm space-y-1">
                  <p>{receiptData.outlet.name}</p>
                  <p>{receiptData.outlet.location}</p>
                  {receiptData.outlet.phone && <p>{receiptData.outlet.phone}</p>}
                </div>
              </div>
            </div>
            
            <div className="border-t border-b py-4 mb-4">
              <h4 className="font-semibold mb-3">Swap Details</h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">Returned Cylinder:</p>
                  <p>{receiptData.oldCylinder.cylinderCode} ({receiptData.oldCylinder.type})</p>
                  <p>Gas Volume: {receiptData.oldCylinder.currentGasVolume} kg</p>
                </div>
                <div>
                  <p className="font-medium">Replacement Cylinder:</p>
                  <p>{receiptData.newCylinder.cylinderCode} ({receiptData.newCylinder.type})</p>
                  <p>Gas Volume: {receiptData.newCylinder.currentGasVolume}/{receiptData.newCylinder.maxGasVolume} kg</p>
                </div>
              </div>
            </div>
            
            <div className="text-right mb-6">
              <div className="text-lg">
                <p>Condition Assessment: <span className="font-medium capitalize">{swap.condition}</span></p>
                <p>Swap Fee: <span className="font-bold">₦{parseFloat(swap.swapFee).toLocaleString()}</span></p>
              </div>
            </div>
            
            <div className="text-center text-sm text-gray-500">
              <p>Thank you for choosing CylinderX</p>
              <p>Date: {format(new Date(swap.swapDate), 'PPPp')}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}