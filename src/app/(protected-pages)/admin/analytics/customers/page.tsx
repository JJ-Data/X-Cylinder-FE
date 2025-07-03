'use client'

import { useState, useMemo } from 'react'
import { useCustomerAnalytics } from '@/hooks/useAnalytics'
import AnalyticsLayout from '@/components/analytics/AnalyticsLayout'
import MetricCard from '@/components/analytics/MetricCard'
import AnalyticsChart from '@/components/analytics/AnalyticsChart'
import DateRangeFilter, { DateRange } from '@/components/analytics/DateRangeFilter'
import ExportButton from '@/components/analytics/ExportButton'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import DataTable from '@/components/shared/DataTable'
import Badge from '@/components/ui/Badge'
import Progress from '@/components/ui/Progress'
import { formatCurrency } from '@/utils/format'
import { format, subDays } from 'date-fns'
import { 
  PiUsersDuotone,
  PiUserPlusDuotone,
  PiTrendUpDuotone,
  PiTrendDownDuotone,
  PiChartLineDuotone,
  PiCurrencyCircleDollarDuotone,
  PiCheckCircleDuotone,
  PiXCircleDuotone,
  PiClockDuotone,
  PiStarDuotone
} from 'react-icons/pi'
import { ColumnDef } from '@tanstack/react-table'
import type { CustomerAnalytics } from '@/types/analytics'

const segmentColors = {
  active: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
  inactive: { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200' },
  new: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
  churned: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' }
}

export default function CustomerAnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: subDays(new Date(), 30),
    endDate: new Date()
  })

  const { data: customerData, isLoading } = useCustomerAnalytics({
    startDate: dateRange.startDate ? format(dateRange.startDate, 'yyyy-MM-dd') : '',
    endDate: dateRange.endDate ? format(dateRange.endDate, 'yyyy-MM-dd') : ''
  })

  // Customer growth chart
  const growthChartData = useMemo(() => {
    if (!customerData?.growth || customerData.growth.length === 0) {
      return { series: [], categories: [] }
    }

    return {
      series: [
        {
          name: 'Total Customers',
          data: customerData.growth.map(g => g.totalCustomers)
        },
        {
          name: 'New Customers',
          data: customerData.growth.map(g => g.newCustomers)
        },
        {
          name: 'Active Customers',
          data: customerData.growth.map(g => g.activeCustomers)
        }
      ],
      categories: customerData.growth.map(g => format(new Date(g.date), 'MMM dd'))
    }
  }, [customerData])

  // Customer segments donut chart
  const segmentsChartData = useMemo(() => {
    if (!customerData?.segments || customerData.segments.length === 0) {
      return { series: [], labels: [] }
    }

    return {
      series: customerData.segments.map(s => s.count),
      labels: customerData.segments.map(s => 
        s.segment.charAt(0).toUpperCase() + s.segment.slice(1)
      )
    }
  }, [customerData])

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    // TODO: Implement export functionality
    console.log(`Exporting customer analytics as ${format}`)
  }

  // Top customers table columns
  const customerColumns: ColumnDef<any>[] = [
    {
      header: 'Customer',
      accessorKey: 'customerName',
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-gray-900">{row.original.customerName}</p>
          <p className="text-sm text-gray-500">
            Joined {format(new Date(row.original.joinDate), 'MMM dd, yyyy')}
          </p>
        </div>
      )
    },
    {
      header: 'Activity',
      accessorKey: 'totalLeases',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Badge 
            content={`${row.original.totalLeases} leases`}
            innerClass="bg-blue-100 text-blue-700"
          />
          <Badge 
            content={`${row.original.totalRefills} refills`}
            innerClass="bg-green-100 text-green-700"
          />
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
      header: 'Last Activity',
      accessorKey: 'lastActivity',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <PiClockDuotone />
          {format(new Date(row.original.lastActivity), 'MMM dd, yyyy')}
        </div>
      )
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }) => {
        const daysSinceLastActivity = Math.floor(
          (new Date().getTime() - new Date(row.original.lastActivity).getTime()) / (1000 * 60 * 60 * 24)
        )
        const isActive = daysSinceLastActivity <= 30
        
        return (
          <Badge 
            content={isActive ? 'Active' : 'Inactive'}
            innerClass={isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}
          />
        )
      }
    }
  ]

  return (
    <AnalyticsLayout
      title="Customer Analytics"
      subtitle="Understand customer behavior and growth patterns"
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
          title="Total Customers"
          value={customerData?.summary?.totalCustomers || 0}
          subtitle="All registered customers"
          icon={<PiUsersDuotone className="text-blue-600" />}
          iconBgColor="bg-blue-50"
          loading={isLoading}
        />
        
        <MetricCard
          title="Active Customers"
          value={customerData?.summary?.activeCustomers || 0}
          subtitle="Active in last 30 days"
          icon={<PiCheckCircleDuotone className="text-green-600" />}
          iconBgColor="bg-green-50"
          loading={isLoading}
        />
        
        <MetricCard
          title="New Customers"
          value={customerData?.summary?.newCustomers || 0}
          subtitle="This month"
          icon={<PiUserPlusDuotone className="text-purple-600" />}
          iconBgColor="bg-purple-50"
          trend={{
            value: 12.5,
            type: 'increase'
          }}
          loading={isLoading}
        />
        
        <MetricCard
          title="Retention Rate"
          value={`${customerData?.summary?.retentionRate || 0}%`}
          subtitle="Customer retention"
          icon={<PiTrendUpDuotone className="text-orange-600" />}
          iconBgColor="bg-orange-50"
          loading={isLoading}
        />
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <MetricCard
          title="Churn Rate"
          value={`${customerData?.summary?.churnRate || 0}%`}
          subtitle="Monthly churn"
          icon={<PiXCircleDuotone className="text-red-600" />}
          iconBgColor="bg-red-50"
          trend={{
            value: customerData?.summary?.churnRate || 0,
            type: 'decrease'
          }}
          loading={isLoading}
        />
        
        <MetricCard
          title="Avg. Lifetime Value"
          value={formatCurrency(customerData?.summary?.averageLifetimeValue || 0)}
          subtitle="Per customer"
          icon={<PiCurrencyCircleDollarDuotone className="text-emerald-600" />}
          iconBgColor="bg-emerald-50"
          loading={isLoading}
        />
        
        <MetricCard
          title="Customer Satisfaction"
          value="4.5/5"
          subtitle="Average rating"
          icon={<PiStarDuotone className="text-yellow-600" />}
          iconBgColor="bg-yellow-50"
          loading={isLoading}
        />
      </div>

      {/* Customer Growth Chart */}
      <div className="mb-8">
        <AnalyticsChart
          title="Customer Growth Trends"
          subtitle="Customer acquisition and activity over time"
          type="line"
          series={growthChartData.series}
          xAxis={growthChartData.categories}
          height={350}
          loading={isLoading}
          customOptions={{
            colors: ['#3b82f6', '#10b981', '#f59e0b'],
            stroke: {
              curve: 'smooth',
              width: 3
            },
            markers: {
              size: 4
            },
            legend: {
              position: 'top',
              horizontalAlign: 'right'
            }
          }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Customer Segments */}
        <AnalyticsChart
          title="Customer Segments"
          subtitle="Distribution by activity status"
          type="donut"
          series={segmentsChartData.series}
          height={300}
          loading={isLoading}
          customOptions={{
            colors: ['#10b981', '#6b7280', '#3b82f6', '#ef4444'],
            labels: segmentsChartData.labels,
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

        {/* Segment Details */}
        <AdaptiveCard>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Segment Analysis
            </h3>
            
            {customerData?.segments && customerData.segments.length > 0 ? (
              <div className="space-y-3">
                {customerData.segments.map((segment) => (
                  <div 
                    key={segment.segment}
                    className={`p-4 rounded-lg border ${segmentColors[segment.segment].bg} ${segmentColors[segment.segment].border}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`font-medium ${segmentColors[segment.segment].text}`}>
                        {segment.segment.charAt(0).toUpperCase() + segment.segment.slice(1)} Customers
                      </span>
                      <Badge 
                        content={`${segment.percentage.toFixed(1)}%`}
                        innerClass={`${segmentColors[segment.segment].bg} ${segmentColors[segment.segment].text} border ${segmentColors[segment.segment].border}`}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Count</p>
                        <p className="text-lg font-semibold">{segment.count}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Avg. Value</p>
                        <p className="text-lg font-semibold">{formatCurrency(segment.averageValue)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No segment data available</p>
            )}
          </div>
        </AdaptiveCard>
      </div>

      {/* Top Customers Table */}
      <AdaptiveCard>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Top Customers</h3>
            <Badge 
              content={`${customerData?.topCustomers?.length || 0} customers`}
              innerClass="bg-gray-100 text-gray-700"
            />
          </div>
          <DataTable
            columns={customerColumns}
            data={customerData?.topCustomers || []}
            loading={isLoading}
            noData={!isLoading && (!customerData?.topCustomers || customerData.topCustomers.length === 0)}
          />
        </div>
      </AdaptiveCard>
    </AnalyticsLayout>
  )
}