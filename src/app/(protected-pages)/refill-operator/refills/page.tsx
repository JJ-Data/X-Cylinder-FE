'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
    Plus,
    Download,
    RefreshCw,
    Gauge,
    DollarSign,
    TrendingUp,
    Calendar,
} from 'lucide-react'
import { useRefills, useOutletRefillStatistics } from '@/hooks/useRefills'
import { useAuthStore } from '@/stores'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui'
import { SearchInput } from '@/components/ui/SearchInput'
import { formatCurrency, formatDate } from '@/utils/format'
import { StatusBadge } from '@/components/shared/StatusBadge'
import type { RefillFilters } from '@/services/api/refill.service'

export default function RefillsPage() {
    const router = useRouter()
    const { outletId } = useAuthStore()
    const [filters, sets] = useState<RefillFilters>({
        outletId: outletId ? parseInt(outletId) : undefined,
        operatorId: undefined, // TODO: Get operator ID from session
    })
    const [searchTerm, setSearchTerm] = useState('')

    const {
        data: refillsData,
        error: _error,
        isLoading,
        mutate,
    } = useRefills(filters)
    const { data: statistics } = useOutletRefillStatistics(
        outletId ? parseInt(outletId) : undefined,
    )

    const refills = refillsData?.data || []

    const handleSearch = useCallback((search: string) => {
        setSearchTerm(search)
        // TODO: Implement search by cylinder code
    }, [])

    const handleRefresh = useCallback(() => {
        mutate()
    }, [mutate])

    const handleExport = useCallback(async () => {
        // TODO: Implement export functionality
    }, [])

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Refill Records
                    </h1>
                    <p className="text-gray-600">
                        Track and manage cylinder refills
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="plain"
                        size="sm"
                        onClick={handleRefresh}
                        icon={
                            <RefreshCw
                                className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
                            />
                        }
                    >
                        Refresh
                    </Button>

                    <Button
                        variant="plain"
                        size="sm"
                        onClick={handleExport}
                        icon={<Download className="h-4 w-4" />}
                    >
                        Export
                    </Button>

                    <Button
                        variant="solid"
                        onClick={() =>
                            router.push('/refill-operator/refills/new')
                        }
                        icon={<Plus className="h-4 w-4" />}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        New Refill
                    </Button>
                </div>
            </div>

            {/* Statistics */}
            {statistics && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">
                                    Total Refills
                                </p>
                                <p className="text-2xl font-bold">
                                    {statistics.totalRefills}
                                </p>
                            </div>
                            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <Gauge className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">
                                    Total Volume
                                </p>
                                <p className="text-2xl font-bold">
                                    {statistics.totalVolume.toFixed(1)} kg
                                </p>
                            </div>
                            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                                <TrendingUp className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">
                                    Total Revenue
                                </p>
                                <p className="text-2xl font-bold">
                                    {formatCurrency(statistics.totalRevenue)}
                                </p>
                            </div>
                            <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                                <DollarSign className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">
                                    Daily Average
                                </p>
                                <p className="text-2xl font-bold">
                                    {statistics.dailyAverage.toFixed(0)}
                                </p>
                            </div>
                            <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                                <Calendar className="h-6 w-6 text-orange-600" />
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* s */}
            <Card className="p-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <SearchInput
                        value={searchTerm}
                        onChange={handleSearch}
                        placeholder="Search by cylinder code..."
                        className="flex-1"
                    />

                    <div className="flex gap-2">
                        <input
                            type="date"
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onChange={(e) =>
                                sets({ ...filters, fromDate: e.target.value })
                            }
                        />
                        <input
                            type="date"
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onChange={(e) =>
                                sets({ ...filters, toDate: e.target.value })
                            }
                        />
                    </div>

                    <select
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={(e) =>
                            sets({
                                ...filters,
                                paymentMethod: e.target.value as any,
                            })
                        }
                    >
                        <option value="">All Payment Methods</option>
                        <option value="CASH">Cash</option>
                        <option value="CARD">Card</option>
                        <option value="TRANSFER">Transfer</option>
                        <option value="MOBILE_MONEY">Mobile Money</option>
                    </select>
                </div>
            </Card>

            {/* Refills Table */}
            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date/Time
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Cylinder
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Volume
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Cost
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Payment
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Receipt
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {isLoading ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-6 py-4 text-center"
                                    >
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                    </td>
                                </tr>
                            ) : refills.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-6 py-4 text-center text-gray-500"
                                    >
                                        No refills found
                                    </td>
                                </tr>
                            ) : (
                                refills.map((refill) => (
                                    <tr
                                        key={refill.id}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {formatDate(refill.refillDate)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 font-mono">
                                                    {
                                                        refill.cylinder
                                                            ?.cylinderCode
                                                    }
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {refill.cylinder?.qrCode}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {refill.cylinder?.type}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <Gauge className="h-4 w-4 text-gray-400 mr-2" />
                                                <span className="text-sm text-gray-900">
                                                    {refill.volumeAdded} kg
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {formatCurrency(
                                                parseFloat(refill.refillCost),
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                                                Cash
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {refill.batchNumber || '-'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Top Cylinders */}
            {statistics?.topCylinders && statistics.topCylinders.length > 0 && (
                <Card className="mt-6 p-4">
                    <h3 className="text-lg font-medium mb-4">
                        Most Refilled Cylinders
                    </h3>
                    <div className="space-y-3">
                        {statistics.topCylinders
                            .slice(0, 5)
                            .map((cylinder, index) => (
                                <div
                                    key={cylinder.cylinderId}
                                    className="flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                                index === 0
                                                    ? 'bg-yellow-100 text-yellow-700'
                                                    : index === 1
                                                      ? 'bg-gray-100 text-gray-700'
                                                      : index === 2
                                                        ? 'bg-orange-100 text-orange-700'
                                                        : 'bg-blue-50 text-blue-700'
                                            }`}
                                        >
                                            {index + 1}
                                        </div>
                                        <div>
                                            <p className="font-medium font-mono">
                                                {cylinder.cylinderCode}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {cylinder.refillCount} refills •{' '}
                                                {cylinder.totalVolume} kg total
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                </Card>
            )}
        </div>
    )
}
