'use client'

import { useParams, useRouter } from 'next/navigation'
import {
  PiArrowLeftDuotone,
  PiPrinterDuotone,
  PiPackageDuotone,
  PiUserDuotone,
  PiCalendarDuotone,
  PiCreditCardDuotone,
  PiMapPinDuotone,
  PiCheckCircleDuotone,
  PiXCircleDuotone,
  PiClockDuotone,
  PiWarningDuotone,
  PiCurrencyCircleDollarDuotone,
  PiReceiptDuotone,
  PiArrowsCounterClockwiseDuotone,
} from 'react-icons/pi'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui'
import { Alert } from '@/components/ui/Alert'
import { Spinner } from '@/components/ui/Spinner'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { useLease } from '@/hooks/useLeases'
import { formatDate, formatCurrency } from '@/utils/format'

export default function StaffLeaseDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const leaseId = params.id as string

  const { data: lease, isLoading, error } = useLease(parseInt(leaseId))

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error || !lease) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert type="danger">
          <div className="flex items-center gap-2">
            <PiXCircleDuotone className="h-5 w-5" />
            <span>Failed to load lease details. Please try again later.</span>
          </div>
        </Alert>
        <Button
          className="mt-4"
          variant="plain"
          onClick={() => router.push('/staff/leasing')}
        >
          <PiArrowLeftDuotone className="h-4 w-4 mr-2" />
          Back to Leases
        </Button>
      </div>
    )
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active':
        return {
          icon: <PiClockDuotone className="text-blue-600 text-lg" />,
          color: 'text-blue-700',
          bgColor: 'bg-blue-100',
          borderColor: 'border-blue-200',
        }
      case 'returned':
        return {
          icon: <PiCheckCircleDuotone className="text-green-600 text-lg" />,
          color: 'text-green-700',
          bgColor: 'bg-green-100',
          borderColor: 'border-green-200',
        }
      case 'overdue':
        return {
          icon: <PiWarningDuotone className="text-red-600 text-lg" />,
          color: 'text-red-700',
          bgColor: 'bg-red-100',
          borderColor: 'border-red-200',
        }
      default:
        return {
          icon: <PiClockDuotone className="text-gray-600 text-lg" />,
          color: 'text-gray-700',
          bgColor: 'bg-gray-100',
          borderColor: 'border-gray-200',
        }
    }
  }

  const leaseData = lease
  const statusConfig = getStatusConfig(leaseData.leaseStatus)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="plain"
          size="sm"
          onClick={() => router.push('/staff/leasing')}
          className="mb-4"
        >
          <PiArrowLeftDuotone className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">Back to Leases</span>
          <span className="sm:hidden">Back</span>
        </Button>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Lease #{leaseData.id}
            </h1>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${statusConfig.bgColor} ${statusConfig.borderColor} border`}>
                {statusConfig.icon}
                <span className={`text-sm font-medium ${statusConfig.color} capitalize`}>
                  {leaseData.leaseStatus}
                </span>
              </div>
              <span className="text-xs sm:text-sm text-gray-500">
                Created {formatDate(leaseData.createdAt)}
              </span>
            </div>
          </div>
          
          {/* Desktop Actions */}
          <div className="hidden sm:flex gap-2">
            {leaseData.leaseStatus === 'active' && (
              <Button
                variant="plain"
                size="sm"
                icon={<PiArrowsCounterClockwiseDuotone />}
                onClick={() => router.push('/staff/leasing/returns')}
              >
                Process Return
              </Button>
            )}
            <Button
              variant="solid"
              size="sm"
              icon={<PiReceiptDuotone />}
              onClick={() => window.open(`/staff/leasing/${leaseId}/receipt`, '_blank')}
            >
              Print Receipt
            </Button>
          </div>
          
          {/* Mobile Actions */}
          <div className="flex sm:hidden gap-2">
            {leaseData.leaseStatus === 'active' && (
              <Button
                variant="plain"
                size="sm"
                icon={<PiArrowsCounterClockwiseDuotone />}
                onClick={() => router.push('/staff/leasing/returns')}
                className="flex-1"
              >
                Return
              </Button>
            )}
            <Button
              variant="solid"
              size="sm"
              icon={<PiReceiptDuotone />}
              onClick={() => window.open(`/staff/leasing/${leaseId}/receipt`, '_blank')}
              className="flex-1"
            >
              Receipt
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Customer Information */}
          <Card className="p-4 sm:p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center mb-4">
              <PiUserDuotone className="text-xl text-gray-600 mr-2" />
              <h2 className="text-lg font-semibold">Customer Information</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Name</p>
                <p className="font-medium text-sm sm:text-base">
                  {leaseData.customer?.firstName} {leaseData.customer?.lastName}
                </p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Email</p>
                <p className="font-medium text-sm sm:text-base break-all">{leaseData.customer?.email}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Phone</p>
                <p className="font-medium text-sm sm:text-base">N/A</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Customer Status</p>
                <StatusBadge 
                  status={'ACTIVE'}
                  type="payment"
                />
              </div>
            </div>
          </Card>

          {/* Cylinder Information */}
          <Card className="p-4 sm:p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center mb-4">
              <PiPackageDuotone className="text-xl text-gray-600 mr-2" />
              <h2 className="text-lg font-semibold">Cylinder Information</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Code</p>
                <p className="font-medium text-sm sm:text-base">{leaseData.cylinder?.cylinderCode}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Type</p>
                <p className="font-medium text-sm sm:text-base">{leaseData.cylinder?.type}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Capacity</p>
                <p className="font-medium text-sm sm:text-base">N/A</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Current Status</p>
                <StatusBadge 
                  status={'ACTIVE'}
                  type="cylinder"
                />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Current Location</p>
                <p className="font-medium text-sm sm:text-base">
                  {leaseData.outlet?.name || 'Unknown'}
                </p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Gas Volume</p>
                <p className="font-medium text-sm sm:text-base">
                  N/A
                </p>
              </div>
            </div>
          </Card>

          {/* Payment Information */}
          <Card className="p-4 sm:p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center mb-4">
              <PiCurrencyCircleDollarDuotone className="text-xl text-gray-600 mr-2" />
              <h2 className="text-lg font-semibold">Payment Information</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                <p className="text-xs sm:text-sm text-gray-600">Security Deposit</p>
                <p className="font-bold text-lg sm:text-xl text-blue-600">
                  {formatCurrency(parseFloat(leaseData.depositAmount))}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                <p className="text-xs sm:text-sm text-gray-600">Payment Method</p>
                <p className="font-medium text-sm sm:text-base">
                  N/A
                </p>
              </div>
              {leaseData.refundAmount && (
                <div className="p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                  <p className="text-xs sm:text-sm text-gray-600">Refund Amount</p>
                  <p className="font-bold text-lg sm:text-xl text-green-600">
                    {formatCurrency(parseFloat(leaseData.refundAmount))}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4 sm:space-y-6">
          {/* Status Card */}
          <Card className="p-4 sm:p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center mb-4">
              {statusConfig.icon}
              <h3 className="text-lg font-semibold ml-2">Lease Status</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <PiCalendarDuotone className="text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs sm:text-sm text-gray-500">Created On</p>
                  <p className="font-medium text-sm sm:text-base">{formatDate(leaseData.createdAt)}</p>
                </div>
              </div>
              {leaseData.expectedReturnDate && (
                <div className="flex items-start gap-2">
                  <PiCalendarDuotone className="text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm text-gray-500">Expected Return</p>
                    <p className="font-medium text-sm sm:text-base">{formatDate(leaseData.expectedReturnDate)}</p>
                  </div>
                </div>
              )}
              {leaseData.actualReturnDate && (
                <div className="flex items-start gap-2">
                  <PiCheckCircleDuotone className="text-green-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm text-gray-500">Actual Return</p>
                    <p className="font-medium text-sm sm:text-base">{formatDate(leaseData.actualReturnDate)}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-2">
                <PiUserDuotone className="text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs sm:text-sm text-gray-500">Processed By</p>
                  <p className="font-medium text-sm sm:text-base">
                    {leaseData.staff?.firstName} {leaseData.staff?.lastName}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Outlet Information */}
          <Card className="p-4 sm:p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center mb-4">
              <PiMapPinDuotone className="text-xl text-gray-600 mr-2" />
              <h3 className="text-lg font-semibold">Outlet Information</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Outlet Name</p>
                <p className="font-medium text-sm sm:text-base">{leaseData.outlet?.name}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Location</p>
                <p className="font-medium text-sm sm:text-base">{leaseData.outlet?.location}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Contact</p>
                <p className="font-medium text-sm sm:text-base">N/A</p>
              </div>
            </div>
          </Card>

          {/* Notes */}
          {leaseData.notes && (
            <Card className="p-4 sm:p-6 hover:shadow-lg transition-shadow duration-200">
              <h3 className="text-lg font-semibold mb-3">Notes</h3>
              <p className="text-gray-600">{leaseData.notes}</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}