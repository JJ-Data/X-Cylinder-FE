'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    PiArrowLeftDuotone,
    PiPencilDuotone,
    PiQrCodeDuotone,
    PiWarningDuotone,
    PiFileDuotone,
    PiFlaskDuotone,
    PiCubeDuotone,
    PiCheckCircleDuotone,
    PiClockDuotone,
    PiToolboxDuotone,
    PiArchiveDuotone,
    PiGasPumpDuotone,
    PiInfoDuotone,
    PiCalendarDuotone,
    PiBuildingsDuotone,
    PiUserDuotone,
    PiCurrencyCircleDollarDuotone,
    PiChartLineDuotone,
    PiHashDuotone,
    PiClipboardTextDuotone,
} from 'react-icons/pi'
import { useCylinder } from '@/hooks/useCylinders'
import { useCylinderLeaseHistory } from '@/hooks/useLeases'
import { useCylinderRefillHistory } from '@/hooks/useRefills'
import { useQRCode } from '@/hooks/useQRCode'
import Button from '@/components/ui/Button'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Badge from '@/components/ui/Badge'
import Tag from '@/components/ui/Tag'
import Alert from '@/components/ui/Alert'
import { Tabs } from '@/components/ui/Tabs'
import Progress from '@/components/ui/Progress'
import Skeleton from '@/components/ui/Skeleton'
import Container from '@/components/shared/Container'
import DataTable from '@/components/shared/DataTable'
import { VolumeGauge } from '@/components/shared/VolumeGauge'
import { formatDate, formatCurrency } from '@/utils/format'
import useWindowSize from '@/components/ui/hooks/useWindowSize'
import type { ColumnDef } from '@/components/shared/DataTable'
import type { LeaseRecord } from '@/types/cylinder'
import type { RefillRecord } from '@/services/api/refill.service'
import QRCodeModal from '@/components/cylinders/QRCodeModal'

const getStatusIcon = (status: string) => {
    switch (status) {
        case 'available':
            return <PiCheckCircleDuotone />
        case 'leased':
            return <PiClockDuotone />
        case 'refilling':
            return <PiGasPumpDuotone />
        case 'maintenance':
            return <PiToolboxDuotone />
        case 'damaged':
            return <PiWarningDuotone />
        case 'retired':
            return <PiArchiveDuotone />
        default:
            return <PiCubeDuotone />
    }
}

export default function CylinderDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const cylinderId = Number(params.id)
    const [showQRModal, setShowQRModal] = useState(false)
    const { width } = useWindowSize()
    const isMobile = width ? width < 768 : false

    const { data: cylinder, error, isLoading } = useCylinder(cylinderId)
    const { data: leaseHistoryResponse } = useCylinderLeaseHistory(cylinderId)
    const { data: refillHistory } = useCylinderRefillHistory(cylinderId)
    const { qrCodeData, isLoading: qrLoading, fetchQRCode } = useQRCode()

    // Extract lease history from paginated response
    const leaseHistory = leaseHistoryResponse?.data || []

    if (error) {
        return (
            <Container>
                <Alert showIcon type="danger">
                    Failed to load cylinder details. Please try again.
                </Alert>
            </Container>
        )
    }

    if (isLoading) {
        return (
            <Container>
                <div className="space-y-4">
                    <Skeleton className="h-8 w-64" />
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <Skeleton key={i} className="h-32" />
                        ))}
                    </div>
                    <Skeleton className="h-96" />
                </div>
            </Container>
        )
    }

    if (!cylinder) {
        return (
            <Container>
                <Alert showIcon type="warning">
                    Cylinder not found.
                </Alert>
            </Container>
        )
    }

    const leaseColumns: ColumnDef<LeaseRecord>[] = [
        {
            accessorKey: 'leaseDate',
            header: 'Date',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <PiCalendarDuotone className="text-gray-400" />
                    {formatDate(row.original.leaseDate)}
                </div>
            ),
        },
        {
            accessorKey: 'customer',
            header: 'Customer',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <PiUserDuotone className="text-gray-400" />
                    <div>
                        <div className="font-medium">
                            {row.original.customer?.firstName}{' '}
                            {row.original.customer?.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                            {row.original.customer?.email}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'leaseAmount',
            header: 'Amount',
            cell: ({ row }) => (
                <div className="flex items-center gap-1">
                    <PiCurrencyCircleDollarDuotone className="text-gray-400" />
                    {formatCurrency(Number(row.original.leaseAmount) || 0)}
                </div>
            ),
        },
        {
            accessorKey: 'leaseStatus',
            header: 'Status',
            cell: ({ row }) => (
                <Badge
                    content={
                        row.original.leaseStatus.charAt(0).toUpperCase() +
                        row.original.leaseStatus.slice(1)
                    }
                    innerClass={getLeaseStatusClass(row.original.leaseStatus)}
                />
            ),
        },
        {
            accessorKey: 'actualReturnDate',
            header: 'Return Date',
            cell: ({ row }) =>
                row.original.actualReturnDate
                    ? formatDate(row.original.actualReturnDate)
                    : '-',
        },
    ]

    const refillColumns: ColumnDef<RefillRecord>[] = [
        {
            accessorKey: 'refillDate',
            header: 'Date',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <PiCalendarDuotone className="text-gray-400" />
                    {formatDate(row.original.refillDate)}
                </div>
            ),
        },
        {
            accessorKey: 'operator',
            header: 'Operator',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <PiUserDuotone className="text-gray-400" />
                    <div>
                        <div className="font-medium">
                            {row.original.operator
                                ? `${row.original.operator.firstName || ''} ${row.original.operator.lastName || ''}`
                                : '-'}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'volume',
            header: 'Volume',
            cell: ({ row }) => (
                <Tag className="bg-blue-100 text-blue-700">
                    <PiFlaskDuotone className="mr-1" />
                    {row.original.volumeAdded || 0} kg
                </Tag>
            ),
        },
        {
            accessorKey: 'cost',
            header: 'Cost',
            cell: ({ row }) => (
                <div className="flex items-center gap-1">
                    <PiCurrencyCircleDollarDuotone className="text-gray-400" />
                    {row.original.refillCost
                        ? formatCurrency(
                              typeof row.original.refillCost === 'string'
                                  ? parseFloat(row.original.refillCost)
                                  : row.original.refillCost,
                          )
                        : '-'}
                </div>
            ),
        },
    ]

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

    const getLeaseStatusClass = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-500 text-white'
            case 'returned':
                return 'bg-emerald-500 text-white'
            case 'overdue':
                return 'bg-red-500 text-white'
            case 'cancelled':
                return 'bg-gray-500 text-white'
            default:
                return 'bg-gray-500 text-white'
        }
    }

    const getGasLevelColor = () => {
        const percentage =
            (parseFloat(cylinder.currentGasVolume) /
                parseFloat(cylinder.maxGasVolume)) *
            100
        if (percentage >= 75) return 'green'
        if (percentage >= 50) return 'blue'
        if (percentage >= 25) return 'orange'
        return 'red'
    }

    const getGasLevelColorClass = () => {
        const color = getGasLevelColor()
        switch (color) {
            case 'green':
                return 'bg-green-500'
            case 'blue':
                return 'bg-blue-500'
            case 'orange':
                return 'bg-orange-500'
            case 'red':
                return 'bg-red-500'
            default:
                return 'bg-gray-500'
        }
    }

    const gasPercentage =
        (parseFloat(cylinder.currentGasVolume) /
            parseFloat(cylinder.maxGasVolume)) *
        100

    return (
        <Container>
            {/* Header */}
            <div className="mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="plain"
                            size="sm"
                            icon={<PiArrowLeftDuotone />}
                            onClick={() => router.push('/admin/cylinders')}
                        >
                            {isMobile ? 'Back' : 'Back to Cylinders'}
                        </Button>
                        <div className="hidden md:block">
                            <nav className="flex items-center gap-2 text-sm">
                                <span className="text-gray-500">Cylinders</span>
                                <span className="text-gray-400">/</span>
                                <span className="font-medium">
                                    {cylinder.cylinderCode}
                                </span>
                            </nav>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="plain"
                            size="sm"
                            icon={<PiQrCodeDuotone />}
                            onClick={async () => {
                                setShowQRModal(true)
                                if (!qrCodeData) {
                                    await fetchQRCode(cylinderId)
                                }
                            }}
                        >
                            {isMobile ? '' : 'Generate QR'}
                        </Button>
                        <Link href={`/admin/cylinders/${cylinder.id}/edit`}>
                            <Button
                                variant="solid"
                                size="sm"
                                icon={<PiPencilDuotone />}
                            >
                                {isMobile ? '' : 'Edit'}
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Cylinder Header Card */}
            <AdaptiveCard className="mb-6">
                <div className="p-6">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                        <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center">
                            <PiCubeDuotone className="text-4xl text-gray-600" />
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {cylinder.cylinderCode}
                            </h2>
                            <p className="text-gray-500 flex items-center justify-center md:justify-start gap-2 mt-1">
                                <PiQrCodeDuotone />
                                {cylinder.qrCode}
                            </p>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-3">
                                <div className="flex items-center gap-1">
                                    {getStatusIcon(cylinder.status)}
                                    <Badge
                                        content={
                                            cylinder.status
                                                .charAt(0)
                                                .toUpperCase() +
                                            cylinder.status.slice(1)
                                        }
                                        innerClass={getCylinderStatusClass(
                                            cylinder.status,
                                        )}
                                    />
                                </div>
                                <Tag className="bg-blue-100 text-blue-700 border-blue-200 border">
                                    {cylinder.type}
                                </Tag>
                                {cylinder.currentOutlet && (
                                    <Tag className="bg-gray-100 text-gray-700 border-gray-200 border">
                                        <PiBuildingsDuotone className="mr-1" />
                                        {cylinder.currentOutlet.name}
                                    </Tag>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </AdaptiveCard>

            {/* Statistics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
                <AdaptiveCard className="hover:shadow-lg transition-shadow duration-200">
                    <div className="p-4 md:p-5">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-xs md:text-sm font-medium text-gray-600">
                                Gas Level
                            </p>
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <PiGasPumpDuotone className="text-lg md:text-xl text-blue-600" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-lg md:text-xl font-bold text-gray-900">
                                {gasPercentage.toFixed(0)}%
                            </p>
                            <Progress
                                percent={gasPercentage}
                                size="sm"
                                customColorClass={getGasLevelColorClass()}
                            />
                            <p className="text-xs text-gray-500">
                                {cylinder.currentGasVolume} /{' '}
                                {cylinder.maxGasVolume} kg
                            </p>
                        </div>
                    </div>
                </AdaptiveCard>

                <AdaptiveCard className="hover:shadow-lg transition-shadow duration-200">
                    <div className="p-4 md:p-5">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-xs md:text-sm font-medium text-gray-600">
                                Total Leases
                            </p>
                            <div className="p-2 bg-purple-50 rounded-lg">
                                <PiClipboardTextDuotone className="text-lg md:text-xl text-purple-600" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-lg md:text-xl font-bold text-gray-900">
                                {leaseHistory?.length || 0}
                            </p>
                            <p className="text-xs text-gray-500">
                                Lifetime leases
                            </p>
                        </div>
                    </div>
                </AdaptiveCard>

                <AdaptiveCard className="hover:shadow-lg transition-shadow duration-200">
                    <div className="p-4 md:p-5">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-xs md:text-sm font-medium text-gray-600">
                                Total Refills
                            </p>
                            <div className="p-2 bg-green-50 rounded-lg">
                                <PiFlaskDuotone className="text-lg md:text-xl text-green-600" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-lg md:text-xl font-bold text-gray-900">
                                {refillHistory?.length || 0}
                            </p>
                            <p className="text-xs text-gray-500">
                                Refill operations
                            </p>
                        </div>
                    </div>
                </AdaptiveCard>

                <AdaptiveCard className="hover:shadow-lg transition-shadow duration-200">
                    <div className="p-4 md:p-5">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-xs md:text-sm font-medium text-gray-600">
                                Last Inspection
                            </p>
                            <div className="p-2 bg-orange-50 rounded-lg">
                                <PiCalendarDuotone className="text-lg md:text-xl text-orange-600" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-lg md:text-xl font-bold text-gray-900">
                                {new Date(
                                    cylinder.lastInspectionDate,
                                ).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                })}
                            </p>
                            <p className="text-xs text-gray-500">
                                {new Date(
                                    cylinder.lastInspectionDate,
                                ).getFullYear()}
                            </p>
                        </div>
                    </div>
                </AdaptiveCard>
            </div>

            {/* Current Status Alert */}
            {cylinder.status === 'leased' && cylinder.currentLeaseId && (
                <AdaptiveCard className="mb-6">
                    <div className="p-4 md:p-6">
                        <Alert showIcon type="info" className="mb-4">
                            <PiInfoDuotone className="text-lg" />
                            This cylinder is currently leased.
                        </Alert>
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div>
                                <p className="text-sm text-gray-600">
                                    Current Lease ID
                                </p>
                                <p className="font-medium flex items-center gap-2">
                                    <PiHashDuotone className="text-gray-400" />#
                                    {cylinder.currentLeaseId}
                                </p>
                            </div>
                            <Link
                                href={`/admin/leases/${cylinder.currentLeaseId}`}
                            >
                                <Button size="sm" variant="solid">
                                    View Lease Details
                                </Button>
                            </Link>
                        </div>
                    </div>
                </AdaptiveCard>
            )}

            {cylinder.status === 'available' && (
                <Alert showIcon type="success" className="mb-6">
                    <PiCheckCircleDuotone className="text-lg" />
                    Cylinder is available for lease
                </Alert>
            )}

            {cylinder.status === 'refilling' && (
                <Alert showIcon type="warning" className="mb-6">
                    <PiGasPumpDuotone className="text-lg" />
                    Cylinder is currently being refilled
                </Alert>
            )}

            {cylinder.status === 'maintenance' && (
                <Alert showIcon type="warning" className="mb-6">
                    <PiToolboxDuotone className="text-lg" />
                    Cylinder is under maintenance
                </Alert>
            )}

            {cylinder.status === 'damaged' && (
                <Alert showIcon type="danger" className="mb-6">
                    <PiWarningDuotone className="text-lg" />
                    Cylinder is damaged and requires inspection
                </Alert>
            )}

            {cylinder.status === 'retired' && (
                <Alert showIcon className="mb-6">
                    <PiArchiveDuotone className="text-lg" />
                    Cylinder has been retired from service
                </Alert>
            )}

            {/* Information Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <AdaptiveCard>
                    <div className="p-4 md:p-6">
                        <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <PiInfoDuotone className="text-xl" />
                            Basic Information
                        </h4>
                        <dl className="space-y-3">
                            <div className="flex justify-between">
                                <dt className="text-sm text-gray-600">Code</dt>
                                <dd className="text-sm font-medium">
                                    {cylinder.cylinderCode}
                                </dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-sm text-gray-600">
                                    QR Code
                                </dt>
                                <dd className="text-sm font-mono">
                                    {cylinder.qrCode}
                                </dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-sm text-gray-600">Type</dt>
                                <dd className="text-sm font-medium">
                                    {cylinder.type}
                                </dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-sm text-gray-600">
                                    Manufacturing Date
                                </dt>
                                <dd className="text-sm">
                                    {formatDate(cylinder.manufactureDate)}
                                </dd>
                            </div>
                        </dl>
                    </div>
                </AdaptiveCard>

                <AdaptiveCard>
                    <div className="p-4 md:p-6">
                        <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <PiChartLineDuotone className="text-xl" />
                            Gas Level Details
                        </h4>
                        <div className="space-y-4">
                            <VolumeGauge
                                current={parseFloat(cylinder.currentGasVolume)}
                                max={parseFloat(cylinder.maxGasVolume)}
                                label="Current Volume"
                                colorScheme={
                                    getGasLevelColor() as
                                        | 'green'
                                        | 'blue'
                                        | 'orange'
                                        | 'red'
                                }
                                size="sm"
                            />
                            <dl className="space-y-3">
                                <div className="flex justify-between">
                                    <dt className="text-sm text-gray-600">
                                        Current Volume
                                    </dt>
                                    <dd className="text-sm font-medium">
                                        {cylinder.currentGasVolume} kg
                                    </dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-sm text-gray-600">
                                        Max Capacity
                                    </dt>
                                    <dd className="text-sm font-medium">
                                        {cylinder.maxGasVolume} kg
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    </div>
                </AdaptiveCard>
            </div>

            {/* History Tabs */}
            <AdaptiveCard>
                <Tabs defaultValue="lease" variant="underline">
                    <Tabs.TabList className="border-b px-4 md:px-6">
                        <Tabs.TabNav value="lease" icon={<PiFileDuotone />}>
                            Lease History
                        </Tabs.TabNav>
                        <Tabs.TabNav value="refill" icon={<PiFlaskDuotone />}>
                            Refill History
                        </Tabs.TabNav>
                    </Tabs.TabList>

                    <div className="p-4 md:p-6">
                        <Tabs.TabContent value="lease">
                            {leaseHistory.length > 0 ? (
                                <DataTable
                                    data={leaseHistory}
                                    columns={leaseColumns}
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <PiFileDuotone className="text-6xl text-gray-300 mb-4" />
                                    <p className="text-gray-500">
                                        No lease history found
                                    </p>
                                </div>
                            )}
                        </Tabs.TabContent>

                        <Tabs.TabContent value="refill">
                            {refillHistory && refillHistory.length > 0 ? (
                                <DataTable
                                    data={refillHistory}
                                    columns={refillColumns}
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <PiFlaskDuotone className="text-6xl text-gray-300 mb-4" />
                                    <p className="text-gray-500">
                                        No refill history found
                                    </p>
                                </div>
                            )}
                        </Tabs.TabContent>
                    </div>
                </Tabs>
            </AdaptiveCard>

            {/* QR Code Modal */}
            {cylinder && (
                <QRCodeModal
                    isOpen={showQRModal}
                    onClose={() => setShowQRModal(false)}
                    cylinder={cylinder}
                    qrCodeData={qrCodeData}
                    isLoading={qrLoading}
                />
            )}
        </Container>
    )
}
