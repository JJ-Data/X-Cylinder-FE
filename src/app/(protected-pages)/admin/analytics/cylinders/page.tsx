'use client'

import { useState, useMemo } from 'react'
import { useCylinderUtilization } from '@/hooks/useAnalytics'
import AnalyticsLayout from '@/components/analytics/AnalyticsLayout'
import MetricCard from '@/components/analytics/MetricCard'
import AnalyticsChart from '@/components/analytics/AnalyticsChart'
import DateRangeFilter, { DateRange } from '@/components/analytics/DateRangeFilter'
import ExportButton from '@/components/analytics/ExportButton'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import DataTable from '@/components/shared/DataTable'
import Badge from '@/components/ui/Badge'
import Progress from '@/components/ui/Progress'
import Select from '@/components/ui/Select'
import { format, subDays } from 'date-fns'
import { 
  PiCubeDuotone,
  PiCheckCircleDuotone,
  PiPackageDuotone,
  PiGasPumpDuotone,
  PiWrenchDuotone,
  PiWarningDuotone,
  PiChartDonutDuotone,
  PiTrendUpDuotone
} from 'react-icons/pi'
import { ColumnDef } from '@tanstack/react-table'
import type { CylinderUtilization } from '@/types/analytics'

const cylinderStatusColors = {
  available: { bg: 'bg-green-50', text: 'text-green-600', icon: <PiCheckCircleDuotone /> },
  leased: { bg: 'bg-blue-50', text: 'text-blue-600', icon: <PiPackageDuotone /> },
  inRefill: { bg: 'bg-orange-50', text: 'text-orange-600', icon: <PiGasPumpDuotone /> },
  maintenance: { bg: 'bg-purple-50', text: 'text-purple-600', icon: <PiWrenchDuotone /> },
  damaged: { bg: 'bg-red-50', text: 'text-red-600', icon: <PiWarningDuotone /> }
}

export default function CylinderAnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: subDays(new Date(), 30),
    endDate: new Date()
  })
  const [selectedType, setSelectedType] = useState<string>('')

  const { data: utilizationData, isLoading } = useCylinderUtilization({
    startDate: dateRange.startDate ? format(dateRange.startDate, 'yyyy-MM-dd') : '',
    endDate: dateRange.endDate ? format(dateRange.endDate, 'yyyy-MM-dd') : '',
    cylinderType: selectedType || undefined
  })

  // Calculate utilization rate
  const utilizationRate = useMemo(() => {
    if (!utilizationData?.summary) return 0
    const { total, leased } = utilizationData.summary
    return total > 0 ? (leased / total) * 100 : 0
  }, [utilizationData])

  // Status distribution chart
  const statusDistributionData = useMemo(() => {
    if (!utilizationData?.summary) return { series: [], labels: [] }

    const { available, leased, inRefill, maintenance, damaged } = utilizationData.summary
    
    return {
      series: [available, leased, inRefill, maintenance, damaged],
      labels: ['Available', 'Leased', 'In Refill', 'Maintenance', 'Damaged']
    }
  }, [utilizationData])

  // Utilization by type chart
  const typeUtilizationData = useMemo(() => {
    if (!utilizationData?.byType || utilizationData.byType.length === 0) {
      return { series: [], categories: [] }
    }

    return {
      series: [
        {
          name: 'Available',
          data: utilizationData.byType.map(t => t.available)
        },
        {
          name: 'Leased',
          data: utilizationData.byType.map(t => t.leased)
        }
      ],
      categories: utilizationData.byType.map(t => t.type)
    }
  }, [utilizationData])

  // Utilization trends chart
  const utilizationTrendsData = useMemo(() => {
    if (!utilizationData?.trends || utilizationData.trends.length === 0) {
      return { series: [], categories: [] }
    }

    return {
      series: [
        {
          name: 'Available',
          data: utilizationData.trends.map(t => t.available)
        },
        {
          name: 'Leased',
          data: utilizationData.trends.map(t => t.leased)
        },
        {
          name: 'In Refill',
          data: utilizationData.trends.map(t => t.inRefill)
        }
      ],
      categories: utilizationData.trends.map(t => format(new Date(t.date), 'MMM dd'))
    }
  }, [utilizationData])

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    // TODO: Implement export functionality
    console.log(`Exporting cylinder analytics as ${format}`)
  }

  // Outlet inventory table columns
  const outletColumns: ColumnDef<any>[] = [
    {
      header: 'Outlet',
      accessorKey: 'outletName',
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-gray-900">{row.original.outletName}</p>
          <p className="text-sm text-gray-500">ID: {row.original.outletId}</p>
        </div>
      )
    },
    {
      header: 'Total Cylinders',
      accessorKey: 'total',
      cell: ({ row }) => (
        <div className="text-center">
          <p className="font-medium">{row.original.total}</p>
        </div>
      )
    },
    {
      header: 'Available',
      accessorKey: 'available',
      cell: ({ row }) => (
        <Badge 
          content={row.original.available}
          innerClass="bg-green-100 text-green-700"
        />
      )
    },
    {
      header: 'Leased',
      accessorKey: 'leased',
      cell: ({ row }) => (
        <Badge 
          content={row.original.leased}
          innerClass="bg-blue-100 text-blue-700"
        />
      )
    },
    {
      header: 'Utilization Rate',
      accessorKey: 'utilizationRate',
      cell: ({ row }) => (
        <div className="w-32">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium">
              {row.original.utilizationRate.toFixed(1)}%
            </span>
          </div>
          <Progress 
            percent={row.original.utilizationRate}
            customColorClass={
              row.original.utilizationRate >= 80 ? 'bg-green-500' :
              row.original.utilizationRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'
            }
            size="sm"
          />
        </div>
      )
    }
  ]

  // Cylinder type options
  const typeOptions = useMemo(() => {
    if (!utilizationData?.byType) return []
    
    return [
      { value: '', label: 'All Types' },
      ...utilizationData.byType.map(type => ({
        value: type.type,
        label: type.type
      }))
    ]
  }, [utilizationData])

  return (
    <AnalyticsLayout
      title="Cylinder Utilization Analytics"
      subtitle="Monitor cylinder availability and usage patterns"
      actions={
        <>
          <Select
            options={typeOptions}
            value={typeOptions.find(opt => opt.value === selectedType)}
            onChange={(option) => setSelectedType(option?.value || '')}
            placeholder="Filter by type"
          />
          <DateRangeFilter value={dateRange} onChange={setDateRange} />
          <ExportButton onExport={handleExport} />
        </>
      }
    >
      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <MetricCard
          title="Total Cylinders"
          value={utilizationData?.summary?.total || 0}
          subtitle="In the system"
          icon={<PiCubeDuotone className="text-gray-600" />}
          iconBgColor="bg-gray-50"
          loading={isLoading}
        />
        
        <MetricCard
          title="Available"
          value={utilizationData?.summary?.available || 0}
          subtitle="Ready for lease"
          icon={<PiCheckCircleDuotone className="text-green-600" />}
          iconBgColor="bg-green-50"
          loading={isLoading}
        />
        
        <MetricCard
          title="Leased"
          value={utilizationData?.summary?.leased || 0}
          subtitle="Currently with customers"
          icon={<PiPackageDuotone className="text-blue-600" />}
          iconBgColor="bg-blue-50"
          loading={isLoading}
        />
        
        <MetricCard
          title="In Refill"
          value={utilizationData?.summary?.inRefill || 0}
          subtitle="Being refilled"
          icon={<PiGasPumpDuotone className="text-orange-600" />}
          iconBgColor="bg-orange-50"
          loading={isLoading}
        />
        
        <MetricCard
          title="Utilization Rate"
          value={`${utilizationRate.toFixed(1)}%`}
          subtitle="Cylinders in use"
          icon={<PiChartDonutDuotone className="text-purple-600" />}
          iconBgColor="bg-purple-50"
          trend={{
            value: 5.2,
            type: 'increase'
          }}
          loading={isLoading}
        />
      </div>

      {/* Status Distribution and Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Status Distribution */}
        <AnalyticsChart
          title="Cylinder Status Distribution"
          subtitle="Current status breakdown"
          type="donut"
          series={statusDistributionData.series}
          height={300}
          loading={isLoading}
          customOptions={{
            colors: ['#10b981', '#3b82f6', '#f97316', '#8b5cf6', '#ef4444'],
            labels: statusDistributionData.labels,
            plotOptions: {
              pie: {
                donut: {
                  size: '65%'
                }
              }
            },
            dataLabels: {
              enabled: true,
              formatter: (val: number) => `${val.toFixed(1)}%`
            },
            legend: {
              position: 'bottom'
            }
          }}
        />

        {/* Maintenance & Damaged Overview */}
        <AdaptiveCard>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Cylinders Requiring Attention
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <PiWrenchDuotone className="text-xl text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">In Maintenance</p>
                    <p className="text-sm text-gray-600">Scheduled maintenance</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-purple-600">
                    {utilizationData?.summary?.maintenance || 0}
                  </p>
                  <p className="text-sm text-gray-500">cylinders</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <PiWarningDuotone className="text-xl text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Damaged</p>
                    <p className="text-sm text-gray-600">Requires repair</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-red-600">
                    {utilizationData?.summary?.damaged || 0}
                  </p>
                  <p className="text-sm text-gray-500">cylinders</p>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-start gap-2">
                <PiWarningDuotone className="text-yellow-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-800">Attention Required</p>
                  <p className="text-yellow-700 mt-1">
                    {(utilizationData?.summary?.maintenance || 0) + (utilizationData?.summary?.damaged || 0)} cylinders 
                    need immediate attention
                  </p>
                </div>
              </div>
            </div>
          </div>
        </AdaptiveCard>
      </div>

      {/* Utilization Trends */}
      <div className="mb-8">
        <AnalyticsChart
          title="Utilization Trends"
          subtitle="Cylinder status over time"
          type="area"
          series={utilizationTrendsData.series}
          xAxis={utilizationTrendsData.categories}
          height={350}
          loading={isLoading}
          customOptions={{
            chart: {
              stacked: true
            },
            colors: ['#10b981', '#3b82f6', '#f97316'],
            stroke: {
              curve: 'smooth',
              width: 2
            },
            fill: {
              type: 'gradient',
              gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.45,
                opacityTo: 0.05,
                stops: [0, 100]
              }
            },
            legend: {
              position: 'top',
              horizontalAlign: 'right'
            }
          }}
        />
      </div>

      {/* Utilization by Type */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <AnalyticsChart
          title="Utilization by Cylinder Type"
          subtitle="Availability and usage by type"
          type="bar"
          series={typeUtilizationData.series}
          xAxis={typeUtilizationData.categories}
          height={300}
          loading={isLoading}
          customOptions={{
            chart: {
              stacked: true
            },
            colors: ['#10b981', '#3b82f6'],
            plotOptions: {
              bar: {
                borderRadius: 4,
                columnWidth: '60%'
              }
            },
            legend: {
              position: 'top',
              horizontalAlign: 'right'
            }
          }}
        />

        {/* Type Performance Metrics */}
        <AdaptiveCard>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Performance by Type
            </h3>
            
            {utilizationData?.byType && utilizationData.byType.length > 0 ? (
              <div className="space-y-3">
                {utilizationData.byType.map((type) => (
                  <div key={type.type} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{type.type}</span>
                      <Badge 
                        content={`${type.utilizationRate.toFixed(1)}% utilized`}
                        innerClass={
                          type.utilizationRate >= 80 ? 'bg-green-100 text-green-700' :
                          type.utilizationRate >= 60 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Total:</span>
                        <span className="ml-1 font-medium">{type.total}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Available:</span>
                        <span className="ml-1 font-medium text-green-600">{type.available}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Leased:</span>
                        <span className="ml-1 font-medium text-blue-600">{type.leased}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No data available</p>
            )}
          </div>
        </AdaptiveCard>
      </div>

      {/* Outlet Inventory Table */}
      <AdaptiveCard>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Cylinder Inventory by Outlet</h3>
            <Badge 
              content={`${utilizationData?.byOutlet?.length || 0} outlets`}
              innerClass="bg-gray-100 text-gray-700"
            />
          </div>
          <DataTable
            columns={outletColumns}
            data={utilizationData?.byOutlet || []}
            loading={isLoading}
            noData={!isLoading && (!utilizationData?.byOutlet || utilizationData.byOutlet.length === 0)}
          />
        </div>
      </AdaptiveCard>
    </AnalyticsLayout>
  )
}