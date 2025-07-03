'use client'

import { useState, useMemo } from 'react'
import { useOutletPerformance } from '@/hooks/useAnalytics'
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
import { formatCurrency } from '@/utils/format'
import { format, subDays } from 'date-fns'
import { 
  PiBuildingsDuotone,
  PiChartLineDuotone,
  PiCubeDuotone,
  PiPackageDuotone,
  PiGasPumpDuotone,
  PiTrendUpDuotone,
  PiTrendDownDuotone,
  PiCurrencyCircleDollarDuotone
} from 'react-icons/pi'
import { ColumnDef } from '@tanstack/react-table'
import type { OutletPerformance } from '@/types/analytics'

export default function OutletAnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: subDays(new Date(), 30),
    endDate: new Date()
  })
  const [selectedOutletId, setSelectedOutletId] = useState<number | null>(null)

  const { data: performanceData, isLoading } = useOutletPerformance({
    startDate: dateRange.startDate ? format(dateRange.startDate, 'yyyy-MM-dd') : '',
    endDate: dateRange.endDate ? format(dateRange.endDate, 'yyyy-MM-dd') : '',
    outletId: selectedOutletId || undefined
  })

  // Calculate summary metrics
  const summaryMetrics = useMemo(() => {
    if (!performanceData || performanceData.length === 0) {
      return {
        totalOutlets: 0,
        avgUtilization: 0,
        totalRevenue: 0,
        avgGrowth: 0
      }
    }

    const totalOutlets = performanceData.length
    const avgUtilization = performanceData.reduce((sum, outlet) => 
      sum + outlet.metrics.utilizationRate, 0) / totalOutlets
    const totalRevenue = performanceData.reduce((sum, outlet) => 
      sum + outlet.metrics.monthlyRevenue, 0)
    const avgGrowth = performanceData.reduce((sum, outlet) => 
      sum + outlet.metrics.growthRate, 0) / totalOutlets

    return { totalOutlets, avgUtilization, totalRevenue, avgGrowth }
  }, [performanceData])

  // Outlet comparison chart data
  const comparisonChartData = useMemo(() => {
    if (!performanceData || performanceData.length === 0) {
      return { series: [], categories: [] }
    }

    const sortedOutlets = [...performanceData]
      .sort((a, b) => b.metrics.monthlyRevenue - a.metrics.monthlyRevenue)
      .slice(0, 10)

    return {
      series: [
        {
          name: 'Revenue',
          data: sortedOutlets.map(o => o.metrics.monthlyRevenue)
        },
        {
          name: 'Leases',
          data: sortedOutlets.map(o => o.metrics.monthlyLeases * 1000) // Scale for visibility
        },
        {
          name: 'Refills',
          data: sortedOutlets.map(o => o.metrics.monthlyRefills * 500) // Scale for visibility
        }
      ],
      categories: sortedOutlets.map(o => o.outletName)
    }
  }, [performanceData])

  // Utilization rate chart
  const utilizationChartData = useMemo(() => {
    if (!performanceData || performanceData.length === 0) {
      return { series: [], categories: [] }
    }

    const sortedByUtilization = [...performanceData]
      .sort((a, b) => b.metrics.utilizationRate - a.metrics.utilizationRate)

    return {
      series: [{
        name: 'Utilization Rate',
        data: sortedByUtilization.map(o => o.metrics.utilizationRate)
      }],
      categories: sortedByUtilization.map(o => o.outletName)
    }
  }, [performanceData])

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    // TODO: Implement export functionality
    console.log(`Exporting outlet analytics as ${format}`)
  }

  // Outlet performance table columns
  const outletColumns: ColumnDef<OutletPerformance>[] = [
    {
      header: 'Outlet',
      accessorKey: 'outletName',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <PiBuildingsDuotone className="text-gray-400" />
          <div>
            <p className="font-medium text-gray-900">{row.original.outletName}</p>
            <p className="text-sm text-gray-500">ID: {row.original.outletId}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Cylinders',
      accessorKey: 'metrics.totalCylinders',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.metrics.totalCylinders}</p>
          <p className="text-sm text-gray-500">
            {row.original.metrics.activeCylinders} active
          </p>
        </div>
      )
    },
    {
      header: 'Utilization',
      accessorKey: 'metrics.utilizationRate',
      cell: ({ row }) => (
        <div className="w-32">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium">
              {row.original.metrics.utilizationRate.toFixed(1)}%
            </span>
          </div>
          <Progress 
            percent={row.original.metrics.utilizationRate}
            customColorClass={
              row.original.metrics.utilizationRate >= 80 ? 'bg-green-500' :
              row.original.metrics.utilizationRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'
            }
            size="sm"
          />
        </div>
      )
    },
    {
      header: 'Monthly Performance',
      accessorKey: 'metrics.monthlyRevenue',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{formatCurrency(row.original.metrics.monthlyRevenue)}</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge 
              content={`${row.original.metrics.monthlyLeases} leases`}
              innerClass="bg-blue-100 text-blue-700 text-xs"
            />
            <Badge 
              content={`${row.original.metrics.monthlyRefills} refills`}
              innerClass="bg-green-100 text-green-700 text-xs"
            />
          </div>
        </div>
      )
    },
    {
      header: 'Growth',
      accessorKey: 'metrics.growthRate',
      cell: ({ row }) => {
        const growth = row.original.metrics.growthRate
        const isPositive = growth > 0
        return (
          <div className={`flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? <PiTrendUpDuotone /> : <PiTrendDownDuotone />}
            <span className="font-medium">{Math.abs(growth).toFixed(1)}%</span>
          </div>
        )
      }
    }
  ]

  // Outlet options for filter
  const outletOptions = useMemo(() => {
    if (!performanceData) return []
    
    return [
      { value: '', label: 'All Outlets' },
      ...performanceData.map(outlet => ({
        value: outlet.outletId.toString(),
        label: outlet.outletName
      }))
    ]
  }, [performanceData])

  return (
    <AnalyticsLayout
      title="Outlet Performance Analytics"
      subtitle="Monitor and compare outlet performance metrics"
      actions={
        <>
          <Select
            options={outletOptions}
            value={outletOptions.find(opt => 
              opt.value === (selectedOutletId?.toString() || '')
            )}
            onChange={(option) => 
              setSelectedOutletId(option?.value ? Number(option.value) : null)
            }
            placeholder="Filter by outlet"
          />
          <DateRangeFilter value={dateRange} onChange={setDateRange} />
          <ExportButton onExport={handleExport} />
        </>
      }
    >
      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          title="Total Outlets"
          value={summaryMetrics.totalOutlets}
          subtitle="Active locations"
          icon={<PiBuildingsDuotone className="text-blue-600" />}
          iconBgColor="bg-blue-50"
          loading={isLoading}
        />
        
        <MetricCard
          title="Avg. Utilization"
          value={`${summaryMetrics.avgUtilization.toFixed(1)}%`}
          subtitle="Average cylinder utilization"
          icon={<PiChartLineDuotone className="text-green-600" />}
          iconBgColor="bg-green-50"
          loading={isLoading}
        />
        
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(summaryMetrics.totalRevenue)}
          subtitle="Combined monthly revenue"
          icon={<PiCurrencyCircleDollarDuotone className="text-purple-600" />}
          iconBgColor="bg-purple-50"
          loading={isLoading}
        />
        
        <MetricCard
          title="Avg. Growth"
          value={`${summaryMetrics.avgGrowth.toFixed(1)}%`}
          subtitle="Average growth rate"
          icon={<PiTrendUpDuotone className="text-orange-600" />}
          iconBgColor="bg-orange-50"
          trend={{
            value: Math.abs(summaryMetrics.avgGrowth),
            type: summaryMetrics.avgGrowth > 0 ? 'increase' : 'decrease'
          }}
          loading={isLoading}
        />
      </div>

      {/* Outlet Comparison Chart */}
      <div className="mb-8">
        <AnalyticsChart
          title="Outlet Performance Comparison"
          subtitle="Top 10 outlets by revenue with operational metrics"
          type="bar"
          series={comparisonChartData.series}
          xAxis={comparisonChartData.categories}
          height={350}
          loading={isLoading}
          customOptions={{
            chart: {
              stacked: false
            },
            colors: ['#8b5cf6', '#3b82f6', '#10b981'],
            plotOptions: {
              bar: {
                borderRadius: 4,
                columnWidth: '60%'
              }
            },
            legend: {
              position: 'top',
              horizontalAlign: 'right'
            },
            yaxis: {
              title: {
                text: 'Value'
              },
              labels: {
                formatter: (val: number) => {
                  if (val >= 1000000) return `₦${(val / 1000000).toFixed(1)}M`
                  if (val >= 1000) return `₦${(val / 1000).toFixed(0)}K`
                  return `₦${val}`
                }
              }
            },
            tooltip: {
              y: {
                formatter: (val: number, opts: any) => {
                  const seriesName = opts.w.globals.seriesNames[opts.seriesIndex]
                  if (seriesName === 'Revenue') return formatCurrency(val)
                  if (seriesName === 'Leases') return `${(val / 1000).toFixed(0)} leases`
                  if (seriesName === 'Refills') return `${(val / 500).toFixed(0)} refills`
                  return val.toString()
                }
              }
            }
          }}
        />
      </div>

      {/* Utilization Rate Chart */}
      <div className="mb-8">
        <AnalyticsChart
          title="Cylinder Utilization by Outlet"
          subtitle="Percentage of cylinders currently in use"
          type="bar"
          series={utilizationChartData.series}
          xAxis={utilizationChartData.categories}
          height={300}
          loading={isLoading}
          customOptions={{
            colors: ['#10b981'],
            plotOptions: {
              bar: {
                horizontal: true,
                borderRadius: 4,
                dataLabels: {
                  position: 'top'
                }
              }
            },
            dataLabels: {
              enabled: true,
              formatter: (val: number) => `${val.toFixed(1)}%`,
              offsetX: -10,
              style: {
                fontSize: '12px'
              }
            },
            xaxis: {
              max: 100,
              labels: {
                formatter: (val: string) => `${val}%`
              }
            }
          }}
        />
      </div>

      {/* Outlet Performance Table */}
      <AdaptiveCard>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Outlet Performance Details</h3>
            <Badge 
              content={`${performanceData?.length || 0} outlets`}
              innerClass="bg-gray-100 text-gray-700"
            />
          </div>
          <DataTable
            columns={outletColumns}
            data={performanceData || []}
            loading={isLoading}
            noData={!isLoading && (!performanceData || performanceData.length === 0)}
          />
        </div>
      </AdaptiveCard>
    </AnalyticsLayout>
  )
}