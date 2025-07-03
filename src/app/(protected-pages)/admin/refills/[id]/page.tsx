'use client'

import {} from 'react'
import { useParams, useRouter } from 'next/navigation'
import { format, parseISO } from 'date-fns'
import {
    PiArrowLeftDuotone,
    PiPrinterDuotone,
    PiCalendarDuotone,
    PiFlaskDuotone,
    PiUserCircleDuotone,
    PiClipboardTextDuotone,
    PiChartLineDuotone,
    PiCylinderDuotone,
} from 'react-icons/pi'
import Container from '@/components/shared/Container'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Tag from '@/components/ui/Tag'
import Alert from '@/components/ui/Alert'
import Spinner from '@/components/ui/Spinner'
import Timeline from '@/components/ui/Timeline'
import {
    useRefill,
    useCylinderRefillHistory,
    useOperatorRefillStatistics,
} from '@/hooks/useRefills'
import type { RefillRecord } from '@/services/api/refill.service'

interface RefillHistoryItem {
    date: string
    title: string
    description: string
    type: 'refill' | 'current'
}

export default function RefillDetailPage() {
    const params = useParams()
    const router = useRouter()
    const refillId = Number(params.id)

    const { data: refill, isLoading, error } = useRefill(refillId)
    const { data: cylinderHistory } = useCylinderRefillHistory(
        refill?.cylinderId,
    )
    const { data: operatorStats } = useOperatorRefillStatistics(
        refill?.operatorId,
    )

    if (isLoading) {
        return (
            <Container>
                <div className="flex items-center justify-center min-h-[400px]">
                    <Spinner size="lg" />
                </div>
            </Container>
        )
    }

    if (error || !refill) {
        return (
            <Container>
                <Alert showIcon type="danger">
                    Failed to load refill details. Please try again.
                </Alert>
                <Button
                    className="mt-4"
                    onClick={() => router.push('/admin/refills')}
                    icon={<PiArrowLeftDuotone />}
                >
                    Back to Refills
                </Button>
            </Container>
        )
    }

    // Prepare timeline data
    const timelineData: RefillHistoryItem[] =
        cylinderHistory
            ?.map((record: RefillRecord) => ({
                date: record.refillDate,
                title:
                    record.id === refillId
                        ? 'Current Refill'
                        : 'Previous Refill',
                description: `${record.volumeAdded.toFixed(2)} kg added (${record.preRefillVolume} → ${record.postRefillVolume} kg)`,
                type: (record.id === refillId ? 'current' : 'refill') as
                    | 'current'
                    | 'refill',
            }))
            .sort(
                (a, b) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime(),
            ) || []

    const handlePrint = () => {
        router.push(`/admin/refills/${refillId}/receipt`)
    }

    return (
        <Container>
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <Button
                            size="sm"
                            variant="plain"
                            icon={<PiArrowLeftDuotone />}
                            onClick={() => router.push('/admin/refills')}
                            className="mb-2"
                        >
                            Back to Refills
                        </Button>
                        <h3 className="mb-1">Refill Details</h3>
                        <p className="text-sm text-gray-500">
                            View complete information about this refill
                            operation
                        </p>
                    </div>
                    <Button
                        variant="solid"
                        icon={<PiPrinterDuotone />}
                        onClick={handlePrint}
                    >
                        Print Receipt
                    </Button>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left Column - Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Refill Information */}
                    <Card>
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="flex items-center gap-2">
                                <PiClipboardTextDuotone className="text-lg" />
                                Refill Information
                            </h4>
                            <Tag className="bg-green-100 text-green-700">
                                Completed
                            </Tag>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">
                                    Refill ID
                                </p>
                                <p className="font-semibold">#{refill.id}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">
                                    Batch Number
                                </p>
                                <p className="font-mono text-sm">
                                    {refill.batchNumber}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">
                                    Refill Date
                                </p>
                                <p className="font-medium">
                                    {format(parseISO(refill.refillDate), 'PPP')}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">
                                    Time
                                </p>
                                <p className="font-medium">
                                    {format(parseISO(refill.refillDate), 'p')}
                                </p>
                            </div>
                        </div>
                    </Card>

                    {/* Volume Information */}
                    <Card>
                        <h4 className="flex items-center gap-2 mb-4">
                            <PiFlaskDuotone className="text-lg" />
                            Volume Information
                        </h4>

                        <div className="grid md:grid-cols-3 gap-4 mb-4">
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-500 mb-1">
                                    Pre-Refill
                                </p>
                                <p className="text-2xl font-bold">
                                    {parseFloat(refill.preRefillVolume).toFixed(
                                        2,
                                    )}
                                </p>
                                <p className="text-sm text-gray-600">kg</p>
                            </div>
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <p className="text-sm text-gray-500 mb-1">
                                    Volume Added
                                </p>
                                <p className="text-2xl font-bold text-blue-600">
                                    +{refill.volumeAdded.toFixed(2)}
                                </p>
                                <p className="text-sm text-gray-600">kg</p>
                            </div>
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                <p className="text-sm text-gray-500 mb-1">
                                    Post-Refill
                                </p>
                                <p className="text-2xl font-bold text-green-600">
                                    {parseFloat(
                                        refill.postRefillVolume,
                                    ).toFixed(2)}
                                </p>
                                <p className="text-sm text-gray-600">kg</p>
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">
                                        Total Cost
                                    </p>
                                    <p className="text-2xl font-bold">
                                        ₦
                                        {parseFloat(
                                            refill.refillCost,
                                        ).toLocaleString()}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500 mb-1">
                                        Price per kg
                                    </p>
                                    <p className="font-medium">
                                        ₦
                                        {(
                                            parseFloat(refill.refillCost) /
                                            refill.volumeAdded
                                        ).toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Notes */}
                    {refill.notes && (
                        <Card>
                            <h4 className="mb-3">Notes</h4>
                            <p className="text-gray-600">{refill.notes}</p>
                        </Card>
                    )}
                </div>

                {/* Right Column - Additional Info */}
                <div className="space-y-6">
                    {/* Cylinder Information */}
                    <Card>
                        <h4 className="flex items-center gap-2 mb-4">
                            <PiCylinderDuotone className="text-lg" />
                            Cylinder Information
                        </h4>
                        {refill.cylinder ? (
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Cylinder Code
                                    </p>
                                    <p className="font-semibold">
                                        {refill.cylinder.cylinderCode}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Type
                                    </p>
                                    <p className="font-medium">
                                        {refill.cylinder.type}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">
                                        QR Code
                                    </p>
                                    <p className="font-mono text-xs break-all">
                                        {refill.cylinder.qrCode}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-500">
                                No cylinder information
                            </p>
                        )}
                    </Card>

                    {/* Operator Information */}
                    <Card>
                        <h4 className="flex items-center gap-2 mb-4">
                            <PiUserCircleDuotone className="text-lg" />
                            Operator Information
                        </h4>
                        {refill.operator ? (
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Name
                                    </p>
                                    <p className="font-semibold">
                                        {refill.operator.firstName}{' '}
                                        {refill.operator.lastName}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Email
                                    </p>
                                    <p className="text-sm">
                                        {refill.operator.email}
                                    </p>
                                </div>
                                {operatorStats && (
                                    <div className="pt-3 border-t">
                                        <p className="text-sm text-gray-500 mb-2">
                                            Performance
                                        </p>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div>
                                                <p className="text-gray-600">
                                                    Total Refills
                                                </p>
                                                <p className="font-medium">
                                                    {operatorStats.totalRefills}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600">
                                                    Avg Volume
                                                </p>
                                                <p className="font-medium">
                                                    {operatorStats.averageVolume.toFixed(
                                                        1,
                                                    )}{' '}
                                                    kg
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-gray-500">
                                No operator information
                            </p>
                        )}
                    </Card>

                    {/* Timestamps */}
                    <Card>
                        <h4 className="flex items-center gap-2 mb-4">
                            <PiCalendarDuotone className="text-lg" />
                            Timestamps
                        </h4>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-gray-500">
                                    Created At
                                </p>
                                <p className="text-sm">
                                    {format(parseISO(refill.createdAt), 'PPp')}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">
                                    Last Updated
                                </p>
                                <p className="text-sm">
                                    {format(parseISO(refill.updatedAt), 'PPp')}
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Cylinder Refill History */}
            {cylinderHistory && cylinderHistory.length > 1 && (
                <Card className="mt-6">
                    <h4 className="flex items-center gap-2 mb-4">
                        <PiChartLineDuotone className="text-lg" />
                        Cylinder Refill History
                    </h4>
                    <Timeline>
                        {timelineData.map((item, index) => (
                            <Timeline.Item
                                key={index}
                                isLast={index === timelineData.length - 1}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p
                                            className={`font-medium ${item.type === 'current' ? 'text-green-600' : ''}`}
                                        >
                                            {item.title}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {item.description}
                                        </p>
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        {format(
                                            parseISO(item.date),
                                            'MMM dd, yyyy',
                                        )}
                                    </p>
                                </div>
                            </Timeline.Item>
                        ))}
                    </Timeline>
                </Card>
            )}
        </Container>
    )
}
