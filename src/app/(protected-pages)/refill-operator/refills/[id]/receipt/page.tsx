'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
    PiPrinterDuotone,
    PiDownloadDuotone,
    PiArrowLeftDuotone,
    PiGasPumpDuotone,
    PiCubeDuotone,
    PiUserDuotone,
    PiBuildingsDuotone,
    PiCalendarDuotone,
    PiReceiptDuotone,
    PiWalletDuotone,
} from 'react-icons/pi'
import Button from '@/components/ui/Button'
import Loading from '@/components/shared/Loading'
import { useRefill } from '@/hooks/useRefills'
import { format } from 'date-fns'
import { formatCurrency } from '@/utils/format'

export default function RefillReceiptPage() {
    const params = useParams()
    const router = useRouter()
    const refillId = params?.id as string
    const { data: refill, isLoading, error } = useRefill(parseInt(refillId))
    const [isPrinting, setIsPrinting] = useState(false)

    useEffect(() => {
        // Add print-specific class to body
        document.body.classList.add('receipt-page')
        return () => {
            document.body.classList.remove('receipt-page')
        }
    }, [])

    const handlePrint = () => {
        setIsPrinting(true)
        setTimeout(() => {
            window.print()
            setIsPrinting(false)
        }, 100)
    }

    const handleDownloadPDF = () => {
        // Use browser's print-to-PDF functionality
        setIsPrinting(true)
        setTimeout(() => {
            window.print()
            setIsPrinting(false)
        }, 100)
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loading loading={true} />
            </div>
        )
    }

    if (error || !refill) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-500 mb-4">Failed to load refill receipt</p>
                    <Button
                        variant="solid"
                        onClick={() => router.push('/refill-operator/refills')}
                        icon={<PiArrowLeftDuotone />}
                    >
                        Back to Refills
                    </Button>
                </div>
            </div>
        )
    }

    const volumeAdded = refill.volumeAdded || 0
    const refillCost = parseFloat(refill.refillCost || '0')
    const unitPrice = volumeAdded > 0 ? refillCost / volumeAdded : 0

    // Format payment method for display
    const getPaymentMethodLabel = (method?: string) => {
        switch (method) {
            case 'cash':
                return 'Cash'
            case 'pos':
                return 'POS (Card Payment)'
            case 'bank_transfer':
                return 'Bank Transfer'
            default:
                return 'Cash'
        }
    }

    return (
        <div className="min-h-screen bg-gray-100 print:bg-white">
            {/* Action Bar - Hidden during print */}
            <div className="action-bar bg-white shadow-md print:hidden">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <Button
                            variant="plain"
                            onClick={() => router.push('/refill-operator/refills')}
                            icon={<PiArrowLeftDuotone />}
                        >
                            Back to Refills
                        </Button>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="plain"
                                onClick={handleDownloadPDF}
                                icon={<PiDownloadDuotone />}
                                loading={isPrinting}
                            >
                                Download PDF
                            </Button>
                            <Button
                                variant="solid"
                                onClick={handlePrint}
                                icon={<PiPrinterDuotone />}
                                loading={isPrinting}
                            >
                                Print Receipt
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Receipt Content */}
            <div className="receipt-container py-6 print:py-0">
                <div className="receipt-paper max-w-[400px] mx-auto bg-white shadow-lg print:shadow-none">
                    <div className="p-8 print:p-6">
                        {/* Header */}
                        <div className="text-center mb-6 border-b-2 border-dashed border-gray-300 pb-6">
                            <div className="flex justify-center mb-3">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                                    <PiGasPumpDuotone className="text-3xl text-blue-600" />
                                </div>
                            </div>
                            <h1 className="text-xl font-bold text-gray-900 mb-1">
                                CylinderX Gas Services
                            </h1>
                            <p className="text-sm text-gray-600">
                                123 Main Street, City, State
                            </p>
                            <p className="text-sm text-gray-600">
                                Tel: +234 123 456 7890
                            </p>
                        </div>

                        {/* Receipt Info */}
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold text-center mb-4 flex items-center justify-center gap-2">
                                <PiReceiptDuotone className="text-gray-600" />
                                REFILL RECEIPT
                            </h2>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <span className="text-gray-600">Receipt No:</span>
                                    <span className="font-medium ml-1">
                                        #REF-{String(refill.id).padStart(6, '0')}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="text-gray-600">Date:</span>
                                    <span className="font-medium ml-1">
                                        {refill.refillDate
                                            ? format(new Date(refill.refillDate), 'dd/MM/yyyy')
                                            : '-'}
                                    </span>
                                </div>
                                {refill.batchNumber && (
                                    <div className="col-span-2">
                                        <span className="text-gray-600">Batch No:</span>
                                        <span className="font-medium ml-1">
                                            {refill.batchNumber}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Cylinder Details */}
                        <div className="mb-6 border-t border-b border-gray-300 py-4">
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                                <PiCubeDuotone className="text-gray-600" />
                                Cylinder Details
                            </h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Cylinder Code:</span>
                                    <span className="font-medium">
                                        {refill.cylinder?.cylinderCode || 'N/A'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Type:</span>
                                    <span className="font-medium">
                                        {refill.cylinder?.type || 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Refill Details */}
                        <div className="mb-6">
                            <h3 className="font-semibold mb-3">Refill Information</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Pre-Refill Volume:</span>
                                    <span className="font-medium">
                                        {parseFloat(refill.preRefillVolume || '0').toFixed(1)} kg
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Post-Refill Volume:</span>
                                    <span className="font-medium">
                                        {parseFloat(refill.postRefillVolume || '0').toFixed(1)} kg
                                    </span>
                                </div>
                                <div className="flex justify-between font-semibold">
                                    <span>Volume Added:</span>
                                    <span>{volumeAdded.toFixed(1)} kg</span>
                                </div>
                            </div>
                        </div>

                        {/* Payment Information */}
                        <div className="mb-6 bg-gray-50 p-4 rounded">
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                                <PiWalletDuotone className="text-gray-600" />
                                Payment Information
                            </h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Payment Method:</span>
                                    <span className="font-medium">
                                        {getPaymentMethodLabel(refill.paymentMethod)}
                                    </span>
                                </div>
                                {refill.paymentReference && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Reference:</span>
                                        <span className="font-medium">
                                            {refill.paymentReference}
                                        </span>
                                    </div>
                                )}
                                <div className="border-t pt-2 mt-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Unit Price:</span>
                                        <span className="font-medium">
                                            {formatCurrency(unitPrice)}/kg
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Quantity:</span>
                                        <span className="font-medium">{volumeAdded.toFixed(1)} kg</span>
                                    </div>
                                    <div className="flex justify-between font-semibold text-base border-t pt-2 mt-2">
                                        <span>Total Amount:</span>
                                        <span className="text-green-600">
                                            {formatCurrency(refillCost)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Operator Info */}
                        <div className="mb-6">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-600 mb-1 flex items-center gap-1">
                                        <PiUserDuotone />
                                        Operator:
                                    </p>
                                    <p className="font-medium">
                                        {refill.operator?.firstName} {refill.operator?.lastName}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-600 mb-1 flex items-center gap-1">
                                        <PiBuildingsDuotone />
                                        Outlet:
                                    </p>
                                    <p className="font-medium">
                                        {refill.outlet?.name || 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        {refill.notes && (
                            <div className="mb-6">
                                <p className="text-sm text-gray-600 mb-1">Notes:</p>
                                <p className="text-sm">{refill.notes}</p>
                            </div>
                        )}

                        {/* Footer */}
                        <div className="border-t-2 border-dashed border-gray-300 pt-4 mt-6">
                            <div className="text-center text-xs text-gray-600">
                                <p className="mb-2">Thank you for your business!</p>
                                <p>
                                    Generated on{' '}
                                    {format(new Date(), 'dd/MM/yyyy HH:mm:ss')}
                                </p>
                            </div>
                        </div>

                        {/* Signature Lines */}
                        <div className="mt-8 grid grid-cols-2 gap-4 print:block">
                            <div className="text-center">
                                <div className="border-t border-gray-400 pt-2">
                                    <p className="text-xs text-gray-600">Operator Signature</p>
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="border-t border-gray-400 pt-2">
                                    <p className="text-xs text-gray-600">Customer Signature</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Print Styles */}
            <style jsx global>{`
                @media print {
                    body.receipt-page {
                        margin: 0;
                        padding: 0;
                        background: white;
                    }

                    .receipt-page * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        color-adjust: exact !important;
                    }

                    .receipt-container {
                        margin: 0;
                        padding: 0;
                    }

                    .receipt-paper {
                        max-width: 100%;
                        margin: 0;
                        box-shadow: none;
                        page-break-after: avoid;
                    }

                    .action-bar {
                        display: none !important;
                    }

                    @page {
                        size: 80mm 297mm;
                        margin: 0;
                    }

                    /* For A4 printing */
                    @media (min-width: 210mm) {
                        @page {
                            size: A4;
                            margin: 10mm;
                        }
                        
                        .receipt-paper {
                            max-width: 400px;
                            margin: 0 auto;
                        }
                    }
                }
            `}</style>
        </div>
    )
}