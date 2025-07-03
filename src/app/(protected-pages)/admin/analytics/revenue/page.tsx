'use client'

import { useState, useMemo } from 'react'
import { useRevenueAnalytics } from '@/hooks/useAnalytics'
import AnalyticsLayout from '@/components/analytics/AnalyticsLayout'
import MetricCard from '@/components/analytics/MetricCard'
import AnalyticsChart from '@/components/analytics/AnalyticsChart'
import DateRangeFilter, { DateRange } from '@/components/analytics/DateRangeFilter'
import ExportButton from '@/components/analytics/ExportButton'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import DataTable from '@/components/shared/DataTable'
import Badge from '@/components/ui/Badge'
import { formatCurrency } from '@/utils/format'
import { format, subDays } from 'date-fns'
import { 
  PiCurrencyCircleDollarDuotone,
  PiTrendUpDuotone,
  PiPackageDuotone,
  PiGasPumpDuotone,
  PiChartLineDuotone,
  PiBuildingsDuotone
} from 'react-icons/pi'
import { ColumnDef } from '@tanstack/react-table'

export default function RevenueAnalyticsPage() {
  // Always initialize with valid dates (last 30 days)
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: subDays(new Date(), 30),
    endDate: new Date()
  })

  // Always provide valid date strings
  const { data: revenueData, isLoading } = useRevenueAnalytics({
    startDate: format(dateRange.startDate || subDays(new Date(), 30), 'yyyy-MM-dd'),
    endDate: format(dateRange.endDate || new Date(), 'yyyy-MM-dd')
  })

  // Revenue trend chart data
  const revenueTrendData = useMemo(() => {
    if (!revenueData?.byPeriod) return { series: [], categories: [] }

    return {
      series: [
        {
          name: 'Total Revenue',
          data: revenueData.byPeriod.map(p => p.revenue)
        },
        {
          name: 'Lease Revenue',
          data: revenueData.byPeriod.map(p => p.leaseRevenue)
        },
        {
          name: 'Refill Revenue',
          data: revenueData.byPeriod.map(p => p.refillRevenue)
        }
      ],
      categories: revenueData.byPeriod.map(p => p.period)
    }
  }, [revenueData])

  // Revenue by outlet chart data
  const outletRevenueData = useMemo(() => {
    if (!revenueData?.byOutlet) return { series: [], categories: [] }

    const topOutlets = revenueData.byOutlet
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)

    return {
      series: [{
        name: 'Revenue',
        data: topOutlets.map(o => o.revenue)
      }],
      categories: topOutlets.map(o => o.outletName)
    }
  }, [revenueData])

  // Revenue breakdown donut chart
  const revenueBreakdownData = useMemo(() => {
    if (!revenueData?.summary) return { series: [], labels: [] }

    return {
      series: [
        revenueData.summary.leaseRevenue,
        revenueData.summary.refillRevenue
      ],
      labels: ['Lease Revenue', 'Refill Revenue']
    }
  }, [revenueData])

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    // TODO: Implement export functionality
    console.log(`Exporting revenue analytics as ${format}`)
  }

  // Top customers table columns
  const customerColumns: ColumnDef<any>[] = [
    {
      header: 'Customer',
      accessorKey: 'customerName',
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-gray-900">{row.original.customerName}</p>
          <p className="text-sm text-gray-500">ID: {row.original.customerId}</p>
        </div>
      )
    },
    {
      header: 'Total Spent',
      accessorKey: 'totalSpent',
      cell: ({ row }) => (
        <div className="text-right">
          <p className="font-medium">{formatCurrency(row.original.totalSpent)}</p>
        </div>
      )
    },
    {
      header: 'Transactions',
      accessorKey: 'transactionCount',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Badge 
            content={`${row.original.leaseCount} leases`}
            innerClass="bg-blue-100 text-blue-700"
          />
          <Badge 
            content={`${row.original.refillCount} refills`}
            innerClass="bg-green-100 text-green-700"
          />
        </div>
      )
    }
  ]

  return (
    <AnalyticsLayout
      title="Revenue Analytics"
      subtitle="Track revenue performance and financial metrics"
      actions={
        <>
          <DateRangeFilter value={dateRange} onChange={setDateRange} />
          <ExportButton onExport={handleExport} />
        </>
      }
    >
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(revenueData?.summary?.totalRevenue || 0)}
          subtitle="In selected period"
          icon={<PiCurrencyCircleDollarDuotone className="text-purple-600" />}
          iconBgColor="bg-purple-50"
          trend={revenueData?.summary?.growthRate ? {
            value: revenueData.summary.growthRate,
            type: revenueData.summary.growthRate > 0 ? 'increase' : 'decrease'
          } : undefined}
          loading={isLoading}
        />
        
        <MetricCard
          title="Lease Revenue"
          value={formatCurrency(revenueData?.summary?.leaseRevenue || 0)}
          subtitle="From cylinder leases"
          icon={<PiPackageDuotone className="text-blue-600" />}
          iconBgColor="bg-blue-50"
          loading={isLoading}
        />
        
        <MetricCard
          title="Refill Revenue"
          value={formatCurrency(revenueData?.summary?.refillRevenue || 0)}
          subtitle="From gas refills"
          icon={<PiGasPumpDuotone className="text-green-600" />}
          iconBgColor="bg-green-50"
          loading={isLoading}
        />
        
        <MetricCard
          title="Avg. Transaction"
          value={formatCurrency(revenueData?.summary?.averageTransaction || 0)}
          subtitle="Per transaction"
          icon={<PiChartLineDuotone className="text-orange-600" />}
          iconBgColor="bg-orange-50"
          loading={isLoading}
        />
      </div>

      {/* Revenue Trend Chart */}
      <div className="mb-8">
        <AnalyticsChart
          title="Revenue Trend"
          subtitle="Daily revenue breakdown over time"
          type="area"
          series={revenueTrendData.series}
          xAxis={revenueTrendData.categories}
          height={350}
          loading={isLoading}
          customOptions={{
            chart: {
              stacked: false
            },
            colors: ['#8b5cf6', '#3b82f6', '#10b981'],
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue by Outlet */}
        <AnalyticsChart
          title="Top Revenue Outlets"
          subtitle="Revenue by outlet location"
          type="bar"
          series={outletRevenueData.series}
          xAxis={outletRevenueData.categories}
          height={300}
          loading={isLoading}
          customOptions={{
            colors: ['#3b82f6'],
            plotOptions: {
              bar: {
                horizontal: true,
                borderRadius: 4
              }
            },
            dataLabels: {
              enabled: true,
              formatter: (val: number) => formatCurrency(val)
            }
          }}
        />

        {/* Revenue Breakdown */}
        <AnalyticsChart
          title="Revenue Breakdown"
          subtitle="Revenue distribution by type"
          type="donut"
          series={revenueBreakdownData.series}
          height={300}
          loading={isLoading}
          donutTitle="Total"
          donutText={formatCurrency(revenueData?.summary?.totalRevenue || 0)}
          customOptions={{
            colors: ['#3b82f6', '#10b981'],
            labels: revenueBreakdownData.labels,
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
      </div>

      {/* Top Customers Table */}
      <AdaptiveCard>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Top Customers by Revenue</h3>
            <Badge 
              content={`${revenueData?.topCustomers?.length || 0} customers`}
              innerClass="bg-gray-100 text-gray-700"
            />
          </div>
          <DataTable
            columns={customerColumns}
            data={revenueData?.topCustomers || []}
            loading={isLoading}
            noData={!isLoading && (!revenueData?.topCustomers || revenueData.topCustomers.length === 0)}
          />
        </div>
      </AdaptiveCard>
    </AnalyticsLayout>
  )
}