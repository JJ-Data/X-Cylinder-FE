'use client'

import { useRouter, useParams } from 'next/navigation'
import { HiArrowLeft, HiPrinter, HiCalendar, HiCash } from 'react-icons/hi'
import Container from '@/components/shared/Container'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Tag from '@/components/ui/Tag'
import Tabs from '@/components/ui/Tabs'
import Skeleton from '@/components/ui/Skeleton'
import Alert from '@/components/ui/Alert'
import { useLease, useCylinderLeaseHistory } from '@/hooks/useLeases'
import { format, isAfter, parseISO } from 'date-fns'
import { useState } from 'react'
import { HiCheckCircle, HiClock } from 'react-icons/hi'

const getStatusColor = (status: string) => {
    switch (status) {
        case 'active':
            return { color: 'text-blue-700', bgColor: 'bg-blue-100' }
        case 'returned':
            return { color: 'text-green-700', bgColor: 'bg-green-100' }
        case 'overdue':
            return { color: 'text-red-700', bgColor: 'bg-red-100' }
        default:
            return { color: 'text-gray-700', bgColor: 'bg-gray-100' }
    }
}

const getLeaseStatus = (lease: any): string => {
    if (lease.leaseStatus === 'returned') return 'returned'
    if (lease.leaseStatus === 'active' && lease.expectedReturnDate) {
        const isOverdue = isAfter(
            new Date(),
            parseISO(lease.expectedReturnDate),
        )
        return isOverdue ? 'overdue' : 'active'
    }
    return lease.leaseStatus
}

export default function LeaseDetailPage() {
    const router = useRouter()
    const params = useParams()
    const leaseId = parseInt(params.id as string)
    const [activeTab, setActiveTab] = useState('details')

    const { data: lease, isLoading } = useLease(leaseId)
    const { data: cylinderHistory } = useCylinderLeaseHistory(lease?.cylinderId)

    const handlePrint = () => {
        window.print()
    }

    const handleProcessReturn = () => {
        router.push(`/admin/leases/return?leaseId=${leaseId}`)
    }

    if (isLoading) {
        return (
            <Container>
                <div className="mb-6">
                    <Skeleton width={200} height={32} />
                    <Skeleton width={300} height={20} className="mt-2" />
                </div>
                <Card>
                    <Skeleton height={400} />
                </Card>
            </Container>
        )
    }

    if (!lease) {
        return (
            <Container>
                <div className="text-center py-12">
                    <p className="text-gray-500">Lease not found</p>
                    <Button
                        variant="plain"
                        onClick={() => router.push('/admin/leases')}
                        className="mt-4"
                    >
                        Back to Leases
                    </Button>
                </div>
            </Container>
        )
    }

    const customer = lease.customer
    const cylinder = lease.cylinder
    const outlet = lease.outlet
    const staff = lease.staff
    const returnStaff = lease.returnStaffId
    const status = getLeaseStatus(lease)
    const statusConfig = getStatusColor(status)

    // Calculate days leased
    const leaseDate = new Date(lease.leaseDate)
    const expectedReturn = new Date(lease.expectedReturnDate)
    const actualReturn = lease.actualReturnDate
        ? new Date(lease.actualReturnDate)
        : null
    const today = new Date()

    const daysLeased = actualReturn
        ? Math.floor(
              (actualReturn.getTime() - leaseDate.getTime()) /
                  (1000 * 60 * 60 * 24),
          )
        : Math.floor(
              (today.getTime() - leaseDate.getTime()) / (1000 * 60 * 60 * 24),
          )

    const daysOverdue =
        status === 'overdue'
            ? Math.floor(
                  (today.getTime() - expectedReturn.getTime()) /
                      (1000 * 60 * 60 * 24),
              )
            : 0

    return (
        <Container>
            {/* Header */}
            <div className="mb-6">
                <Button
                    size="sm"
                    variant="plain"
                    icon={<HiArrowLeft />}
                    onClick={() => router.push('/admin/leases')}
                >
                    Back to Leases
                </Button>

                <div className="flex items-center justify-between mt-4">
                    <div>
                        <h3 className="mb-1">Lease #{lease.id}</h3>
                        <div className="flex items-center gap-3">
                            <Tag
                                className={`${statusConfig.color} ${statusConfig.bgColor} capitalize`}
                            >
                                {status}
                            </Tag>
                            <span className="text-sm text-gray-500">
                                Created on{' '}
                                {format(new Date(lease.createdAt), 'PPP')}
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="plain"
                            size="sm"
                            icon={<HiPrinter />}
                            onClick={handlePrint}
                        >
                            Print
                        </Button>
                        {lease.leaseStatus === 'active' && (
                            <Button
                                variant="solid"
                                size="sm"
                                onClick={handleProcessReturn}
                            >
                                Process Return
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Status Alert */}
            {status === 'overdue' && (
                <Alert type="warning" showIcon className="mb-6">
                    This lease is {daysOverdue} days overdue. Expected return
                    was on {format(expectedReturn, 'PPP')}. Please contact the
                    customer to arrange for cylinder return.
                </Alert>
            )}

            {lease.leaseStatus === 'returned' && (
                <Alert type="success" showIcon className="mb-6">
                    This lease was successfully returned on{' '}
                    {format(new Date(lease.actualReturnDate || ''), 'PPP')}.
                    {lease.refundAmount &&
                        `Refund of ₦${parseFloat(lease.refundAmount).toLocaleString()} was processed.`}
                </Alert>
            )}

            {/* Tabs */}
            <Tabs value={activeTab} onChange={setActiveTab}>
                <Tabs.TabList>
                    <Tabs.TabNav value="details">Lease Details</Tabs.TabNav>
                    <Tabs.TabNav value="history">History</Tabs.TabNav>
                    <Tabs.TabNav value="payments">Payments</Tabs.TabNav>
                </Tabs.TabList>

                <Tabs.TabContent value="details">
                    <div className="grid md:grid-cols-2 gap-6 mt-6">
                        {/* Customer Information */}
                        <Card>
                            <h5 className="mb-4">Customer Information</h5>
                            {customer ? (
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Name
                                        </p>
                                        <p className="font-medium">
                                            {customer.firstName}{' '}
                                            {customer.lastName}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Email
                                        </p>
                                        <p className="font-medium">
                                            {customer.email}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Customer ID
                                        </p>
                                        <p className="font-medium">
                                            #{customer.id}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-500">
                                    Customer information not available
                                </p>
                            )}
                        </Card>

                        {/* Cylinder Information */}
                        <Card>
                            <h5 className="mb-4">Cylinder Information</h5>
                            {cylinder ? (
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Cylinder Code
                                        </p>
                                        <p className="font-medium text-lg">
                                            {cylinder.cylinderCode}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Type
                                        </p>
                                        <p className="font-medium">
                                            {cylinder.type}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-500">
                                            QR Code
                                        </p>
                                        <p className="font-mono text-xs">
                                            {cylinder.qrCode}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-500">
                                    Cylinder information not available
                                </p>
                            )}
                        </Card>

                        {/* Lease Information */}
                        <Card>
                            <h5 className="mb-4">Lease Information</h5>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <HiCalendar className="text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Lease Date
                                        </p>
                                        <p className="font-medium">
                                            {format(
                                                new Date(lease.leaseDate),
                                                'PPP',
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <HiCalendar className="text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Expected Return Date
                                        </p>
                                        <p className="font-medium">
                                            {format(expectedReturn, 'PPP')}
                                        </p>
                                    </div>
                                </div>

                                {actualReturn && (
                                    <div className="flex items-center gap-3">
                                        <HiCheckCircle className="text-green-500" />
                                        <div>
                                            <p className="text-sm text-gray-500">
                                                Actual Return Date
                                            </p>
                                            <p className="font-medium">
                                                {format(actualReturn, 'PPP')}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <p className="text-sm text-gray-500">
                                        Days Leased
                                    </p>
                                    <p className="font-medium">
                                        {daysLeased} days
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">
                                        Outlet
                                    </p>
                                    <p className="font-medium">
                                        {outlet?.name || 'N/A'}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">
                                        Leased by
                                    </p>
                                    <p className="font-medium">
                                        {staff
                                            ? `${staff.firstName} ${staff.lastName}`
                                            : 'N/A'}
                                    </p>
                                </div>

                                {returnStaff && (
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Returned to
                                        </p>
                                        <p className="font-medium">
                                            {returnStaff}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* Financial Information */}
                        <Card>
                            <h5 className="mb-4">Financial Information</h5>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <HiCash className="text-gray-400" />
                                    <div className="flex-1">
                                        <div className="flex justify-between">
                                            <p className="text-sm text-gray-500">
                                                Deposit Amount
                                            </p>
                                            <p className="font-medium">
                                                ₦
                                                {parseFloat(
                                                    lease.depositAmount,
                                                ).toLocaleString()}
                                            </p>
                                        </div>

                                        <div className="flex justify-between mt-2">
                                            <p className="text-sm text-gray-500">
                                                Lease Amount
                                            </p>
                                            <p className="font-medium">
                                                ₦
                                                {parseFloat(
                                                    lease.leaseAmount,
                                                ).toLocaleString()}
                                            </p>
                                        </div>

                                        {lease.refundAmount && (
                                            <div className="flex justify-between mt-2">
                                                <p className="text-sm text-gray-500">
                                                    Refund Amount
                                                </p>
                                                <p className="font-medium text-green-600">
                                                    ₦
                                                    {parseFloat(
                                                        lease.refundAmount,
                                                    ).toLocaleString()}
                                                </p>
                                            </div>
                                        )}

                                        <div className="flex justify-between mt-2 pt-2 border-t">
                                            <p className="text-sm font-medium">
                                                Total Paid
                                            </p>
                                            <p className="font-medium">
                                                ₦
                                                {(
                                                    parseFloat(
                                                        lease.depositAmount,
                                                    ) +
                                                    parseFloat(
                                                        lease.leaseAmount,
                                                    )
                                                ).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Notes */}
                    {lease.notes && (
                        <Card className="mt-6">
                            <h5 className="mb-4">Notes</h5>
                            <p className="text-gray-700">{lease.notes}</p>
                        </Card>
                    )}
                </Tabs.TabContent>

                <Tabs.TabContent value="history">
                    <div className="grid gap-6 mt-6">
                        {/* Lease Timeline */}
                        <Card>
                            <h5 className="mb-4">Lease Timeline</h5>
                            <div className="relative">
                                <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-200"></div>

                                <div className="space-y-6">
                                    {/* Lease Created */}
                                    <div className="flex gap-4">
                                        <div className="relative z-10 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                            <HiClock className="text-white text-sm" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium">
                                                Lease Created
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {format(leaseDate, 'PPP p')}
                                            </p>
                                            <p className="text-sm text-gray-600 mt-1">
                                                By{' '}
                                                {staff
                                                    ? `${staff.firstName} ${staff.lastName}`
                                                    : 'Unknown'}{' '}
                                                at {outlet?.name}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Expected Return */}
                                    <div className="flex gap-4">
                                        <div
                                            className={`relative z-10 w-8 h-8 ${status === 'overdue' ? 'bg-red-500' : 'bg-gray-400'} rounded-full flex items-center justify-center`}
                                        >
                                            <HiCalendar className="text-white text-sm" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium">
                                                Expected Return
                                                {status === 'overdue' && (
                                                    <span className="text-red-600 ml-2">
                                                        (Overdue)
                                                    </span>
                                                )}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {format(expectedReturn, 'PPP')}
                                            </p>
                                            {status === 'overdue' && (
                                                <p className="text-sm text-red-600 mt-1">
                                                    {daysOverdue} days overdue
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actual Return */}
                                    {actualReturn && (
                                        <div className="flex gap-4">
                                            <div className="relative z-10 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                                <HiCheckCircle className="text-white text-sm" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium">
                                                    Returned
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {format(
                                                        actualReturn,
                                                        'PPP p',
                                                    )}
                                                </p>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    To{' '}
                                                    {returnStaff
                                                        ? `${returnStaff}`
                                                        : 'Unknown'}
                                                </p>
                                                {lease.refundAmount && (
                                                    <p className="text-sm text-green-600 mt-1">
                                                        Refund processed: ₦
                                                        {parseFloat(
                                                            lease.refundAmount,
                                                        ).toLocaleString()}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>

                        {/* Cylinder Lease History */}
                        <Card>
                            <h5 className="mb-4">Cylinder Lease History</h5>
                            {cylinderHistory &&
                            cylinderHistory.data &&
                            cylinderHistory.data.length > 0 ? (
                                <div className="space-y-3">
                                    {cylinderHistory.data
                                        .filter((l) => l.id !== lease.id) // Exclude current lease
                                        .slice(0, 5) // Show only recent 5
                                        .map((historicalLease) => (
                                            <div
                                                key={historicalLease.id}
                                                className="p-3 bg-gray-50 rounded-lg"
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-medium text-sm">
                                                            {
                                                                historicalLease
                                                                    .customer
                                                                    ?.firstName
                                                            }{' '}
                                                            {
                                                                historicalLease
                                                                    .customer
                                                                    ?.lastName
                                                            }
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {format(
                                                                new Date(
                                                                    historicalLease.leaseDate,
                                                                ),
                                                                'MMM dd, yyyy',
                                                            )}{' '}
                                                            -
                                                            {historicalLease.actualReturnDate
                                                                ? format(
                                                                      new Date(
                                                                          historicalLease.actualReturnDate,
                                                                      ),
                                                                      'MMM dd, yyyy',
                                                                  )
                                                                : 'Active'}
                                                        </p>
                                                    </div>
                                                    <Tag
                                                        className={`text-xs ${
                                                            historicalLease.leaseStatus ===
                                                            'returned'
                                                                ? 'text-green-700 bg-green-100'
                                                                : 'text-blue-700 bg-blue-100'
                                                        }`}
                                                    >
                                                        {
                                                            historicalLease.leaseStatus
                                                        }
                                                    </Tag>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-8">
                                    No previous lease history for this cylinder
                                </p>
                            )}
                        </Card>
                    </div>
                </Tabs.TabContent>

                <Tabs.TabContent value="payments">
                    <div className="grid gap-6 mt-6">
                        {/* Payment Summary */}
                        <Card>
                            <h5 className="mb-4">Payment Summary</h5>
                            <div className="grid md:grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-500">
                                        Total Paid
                                    </p>
                                    <p className="text-2xl font-bold">
                                        ₦
                                        {(
                                            parseFloat(lease.depositAmount) +
                                            parseFloat(lease.leaseAmount)
                                        ).toLocaleString()}
                                    </p>
                                </div>

                                <div className="text-center p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-500">
                                        Deposit Held
                                    </p>
                                    <p className="text-2xl font-bold">
                                        ₦
                                        {parseFloat(
                                            lease.depositAmount,
                                        ).toLocaleString()}
                                    </p>
                                </div>

                                <div className="text-center p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-500">
                                        {lease.refundAmount
                                            ? 'Refunded'
                                            : 'Refundable'}
                                    </p>
                                    <p
                                        className={`text-2xl font-bold ${lease.refundAmount ? 'text-green-600' : ''}`}
                                    >
                                        ₦
                                        {lease.refundAmount
                                            ? parseFloat(
                                                  lease.refundAmount,
                                              ).toLocaleString()
                                            : parseFloat(
                                                  lease.depositAmount,
                                              ).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </Card>

                        {/* Payment Transactions */}
                        <Card>
                            <h5 className="mb-4">Transaction History</h5>
                            <div className="space-y-4">
                                {/* Initial Payment */}
                                <div className="border-l-4 border-blue-500 pl-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-medium">
                                                Initial Payment
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {format(leaseDate, 'PPP p')}
                                            </p>
                                            <div className="mt-2 space-y-1">
                                                <p className="text-sm">
                                                    <span className="text-gray-500">
                                                        Deposit:
                                                    </span>
                                                    <span className="font-medium ml-2">
                                                        ₦
                                                        {parseFloat(
                                                            lease.depositAmount,
                                                        ).toLocaleString()}
                                                    </span>
                                                </p>
                                                <p className="text-sm">
                                                    <span className="text-gray-500">
                                                        Lease Fee:
                                                    </span>
                                                    <span className="font-medium ml-2">
                                                        ₦
                                                        {parseFloat(
                                                            lease.leaseAmount,
                                                        ).toLocaleString()}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-lg">
                                                ₦
                                                {(
                                                    parseFloat(
                                                        lease.depositAmount,
                                                    ) +
                                                    parseFloat(
                                                        lease.leaseAmount,
                                                    )
                                                ).toLocaleString()}
                                            </p>
                                            <Tag className="text-xs text-blue-700 bg-blue-100 mt-1">
                                                Paid
                                            </Tag>
                                        </div>
                                    </div>
                                </div>

                                {/* Refund Transaction */}
                                {lease.refundAmount && actualReturn && (
                                    <div className="border-l-4 border-green-500 pl-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-medium">
                                                    Deposit Refund
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {format(
                                                        actualReturn,
                                                        'PPP p',
                                                    )}
                                                </p>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Processed by{' '}
                                                    {returnStaff
                                                        ? `${returnStaff}`
                                                        : 'Unknown'}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-lg text-green-600">
                                                    ₦
                                                    {parseFloat(
                                                        lease.refundAmount,
                                                    ).toLocaleString()}
                                                </p>
                                                <Tag className="text-xs text-green-700 bg-green-100 mt-1">
                                                    Refunded
                                                </Tag>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* Payment Details */}
                        <Card>
                            <h5 className="mb-4">Payment Details</h5>
                            <div className="space-y-3">
                                <div className="flex justify-between py-2 border-b">
                                    <span className="text-gray-600">
                                        Payment Method
                                    </span>
                                    <span className="font-medium">Cash</span>
                                </div>

                                <div className="flex justify-between py-2 border-b">
                                    <span className="text-gray-600">
                                        Receipt Number
                                    </span>
                                    <span className="font-medium">
                                        #{lease.id}-
                                        {format(leaseDate, 'yyyyMMdd')}
                                    </span>
                                </div>

                                <div className="flex justify-between py-2 border-b">
                                    <span className="text-gray-600">
                                        Payment Status
                                    </span>
                                    <Tag className="text-green-700 bg-green-100">
                                        Completed
                                    </Tag>
                                </div>

                                {lease.refundAmount && (
                                    <div className="flex justify-between py-2 border-b">
                                        <span className="text-gray-600">
                                            Refund Status
                                        </span>
                                        <Tag className="text-green-700 bg-green-100">
                                            Processed
                                        </Tag>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>
                </Tabs.TabContent>
            </Tabs>
        </Container>
    )
}
