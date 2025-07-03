'use client'

import Card from '@/components/ui/Card'
import { NumericFormat } from 'react-number-format'
import { 
    TbCylinder, 
    TbPackage, 
    TbHome2, 
    TbRefresh, 
    TbAlertTriangle 
} from 'react-icons/tb'
import type { OutletInventory } from '@/types/outlet'

type OutletInventoryProps = {
    inventory: OutletInventory
    isLoading?: boolean
}

const MetricCard = ({
    title,
    value,
    icon,
    bgColor,
}: {
    title: string
    value: number
    icon: React.ReactNode
    bgColor: string
}) => {
    return (
        <Card>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        {title}
                    </p>
                    <h3 className="text-2xl font-semibold">
                        <NumericFormat
                            value={value}
                            displayType="text"
                            thousandSeparator=","
                        />
                    </h3>
                </div>
                <div
                    className={`w-12 h-12 rounded-full ${bgColor} flex items-center justify-center`}
                >
                    {icon}
                </div>
            </div>
        </Card>
    )
}

const CylinderTypeRow = ({
    cylinderType,
    count,
}: {
    cylinderType: string
    count: number
}) => {
    return (
        <tr>
            <td className="py-3 px-4 font-medium">{cylinderType}</td>
            <td className="py-3 px-4 text-center">
                <NumericFormat
                    value={count}
                    displayType="text"
                    thousandSeparator=","
                />
            </td>
        </tr>
    )
}

const OutletInventory = ({ inventory, isLoading = false }: OutletInventoryProps) => {
    if (isLoading) {
        return (
            <div className="space-y-4">
                {/* Loading skeleton for metric cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {[...Array(5)].map((_, index) => (
                        <Card key={index}>
                            <div className="animate-pulse">
                                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                                <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                            </div>
                        </Card>
                    ))}
                </div>
                {/* Loading skeleton for table */}
                <Card>
                    <div className="animate-pulse">
                        <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
                        <div className="space-y-3">
                            {[...Array(3)].map((_, index) => (
                                <div key={index} className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
                            ))}
                        </div>
                    </div>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Summary Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <MetricCard
                    title="Total Cylinders"
                    value={inventory.totalCylinders}
                    icon={<TbCylinder className="text-xl text-gray-700" />}
                    bgColor="bg-gray-200"
                />
                <MetricCard
                    title="Available"
                    value={inventory.availableCylinders}
                    icon={<TbPackage className="text-xl text-emerald-700" />}
                    bgColor="bg-emerald-200"
                />
                <MetricCard
                    title="Leased"
                    value={inventory.leasedCylinders}
                    icon={<TbHome2 className="text-xl text-blue-700" />}
                    bgColor="bg-blue-200"
                />
                <MetricCard
                    title="Refilling"
                    value={inventory.refillingCylinders}
                    icon={<TbRefresh className="text-xl text-orange-700" />}
                    bgColor="bg-orange-200"
                />
                <MetricCard
                    title="Damaged"
                    value={inventory.damagedCylinders}
                    icon={<TbAlertTriangle className="text-xl text-red-700" />}
                    bgColor="bg-red-200"
                />
            </div>

            {/* Detailed Breakdown by Cylinder Type */}
            <Card>
                <h4 className="mb-4">Inventory Breakdown by Cylinder Type</h4>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                                    Cylinder Type
                                </th>
                                <th className="text-center py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                                    Count
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {Object.entries(inventory.byType).map(([cylinderType, count]) => (
                                <CylinderTypeRow
                                    key={cylinderType}
                                    cylinderType={cylinderType}
                                    count={count}
                                />
                            ))}
                            {/* Total Row */}
                            <tr className="font-semibold bg-gray-50 dark:bg-gray-800">
                                <td className="py-3 px-4">Total</td>
                                <td className="py-3 px-4 text-center">
                                    <NumericFormat
                                        value={inventory.totalCylinders}
                                        displayType="text"
                                        thousandSeparator=","
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    )
}

export default OutletInventory