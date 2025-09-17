'use client'

import { useState, useMemo } from 'react'
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns'
import {
  PiFileTextDuotone,
  PiChartLineDuotone,
  PiCurrencyNgnDuotone,
  PiTrendUpDuotone,
  PiTrendDownDuotone,
  PiDownloadDuotone,
  PiFilePdfDuotone,
  PiFileCsvDuotone,
  PiFileXlsDuotone,
  PiArrowUpDuotone,
  PiArrowDownDuotone,
  PiPackageDuotone,
  PiGasPumpDuotone,
  PiArrowsLeftRightDuotone,
  PiUsersDuotone,
  PiBuildingsDuotone,
  PiWarningDuotone,
  PiFunnelDuotone
} from 'react-icons/pi'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import MetricCard from '@/components/analytics/MetricCard'
import AnalyticsChart from '@/components/analytics/AnalyticsChart'
import DateRangeFilter, { DateRange } from '@/components/analytics/DateRangeFilter'
import DataTable from '@/components/shared/DataTable'
import Tabs from '@/components/ui/Tabs'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Alert from '@/components/ui/Alert'
import Dropdown from '@/components/ui/Dropdown'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Skeleton from '@/components/ui/Skeleton'
import TableExportButton from '@/components/shared/TableExportButton'
import { 
  useFinancialSummary, 
  useRevenueAnalysis, 
  useTransactionReport,
  useOperationalReport,
  useExportReport 
} from '@/hooks/useReports'
import { formatCurrency } from '@/utils/format'
import { toast } from 'react-hot-toast'
import type { ColumnDef } from '@tanstack/react-table'
import type { Transaction } from '@/types/reports'

export default function ReportsPage() {
  // State management
  const [activeTab, setActiveTab] = useState('financial')
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: startOfMonth(new Date()),
    endDate: endOfMonth(new Date())
  })
  const [transactionFilters, setTransactionFilters] = useState({
    type: '',
    status: '',
    outlet: '',
    minAmount: '',
    maxAmount: ''
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  // Format dates for API
  const filters = {
    startDate: dateRange.startDate ? format(dateRange.startDate, 'yyyy-MM-dd') : '',
    endDate: dateRange.endDate ? format(dateRange.endDate, 'yyyy-MM-dd') : '',
    period: 'daily' as const
  }

  // Fetch data
  const { data: financialData, isLoading: financialLoading } = useFinancialSummary(filters)
  const { data: revenueData, isLoading: revenueLoading } = useRevenueAnalysis(filters)
  const { 
    data: transactionData, 
    isLoading: transactionLoading 
  } = useTransactionReport({
    ...filters,
    transactionType: transactionFilters.type,
    status: transactionFilters.status,
    minAmount: transactionFilters.minAmount ? Number(transactionFilters.minAmount) : undefined,
    maxAmount: transactionFilters.maxAmount ? Number(transactionFilters.maxAmount) : undefined,
    page: currentPage,
    limit: pageSize
  })
  const { data: operationalData, isLoading: operationalLoading } = useOperationalReport(filters)
  const exportReport = useExportReport()

  // Calculate metrics
  const totalRevenue = financialData?.totalRevenue || 0
  const totalOutflows = financialData?.totalOutflows || 0
  const netIncome = financialData?.netIncome || 0
  const growthRate = financialData?.growthRate || 0

  // Chart data for revenue trend
  const revenueTrendData = useMemo(() => {
    if (!financialData?.dailyTrends) return { series: [], categories: [] }
    
    return {
      series: [
        {
          name: 'Revenue',
          data: financialData.dailyTrends.map(d => d.revenue)
        },
        {
          name: 'Net Income',
          data: financialData.dailyTrends.map(d => d.netIncome)
        }
      ],
      categories: financialData.dailyTrends.map(d => format(new Date(d.date), 'MMM dd'))
    }
  }, [financialData])

  // Chart data for revenue breakdown
  const revenueBreakdownData = useMemo(() => {
    if (!financialData?.revenueByCategory || !Array.isArray(financialData.revenueByCategory)) {
      return { series: [], labels: [] }
    }
    
    const validCategories = financialData.revenueByCategory.filter(c => 
      c && typeof c.amount === 'number' && c.label
    )
    
    if (validCategories.length === 0) {
      return { series: [], labels: [] }
    }
    
    return {
      series: validCategories.map(c => c.amount || 0),
      labels: validCategories.map(c => c.label || 'Unknown')
    }
  }, [financialData])

  // Chart data for outlet performance
  const outletPerformanceData = useMemo(() => {
    if (!revenueData?.byOutlet || !Array.isArray(revenueData.byOutlet) || revenueData.byOutlet.length === 0) {
      return { 
        series: [{
          name: 'Revenue',
          data: []
        }], 
        categories: [] 
      }
    }
    
    const topOutlets = revenueData.byOutlet
      .filter(o => o && typeof o.revenue === 'number')
      .slice(0, 10)
    
    if (topOutlets.length === 0) {
      return {
        series: [{
          name: 'Revenue',
          data: []
        }],
        categories: []
      }
    }
    
    return {
      series: [{
        name: 'Revenue',
        data: topOutlets.map(o => o.revenue || 0)
      }],
      categories: topOutlets.map(o => o.outletName || 'Unknown')
    }
  }, [revenueData])

  // Transaction table columns
  const transactionColumns: ColumnDef<Transaction>[] = [
    {
      header: 'Transaction ID',
      accessorKey: 'transactionId',
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.original.transactionId}</span>
      )
    },
    {
      header: 'Date',
      accessorKey: 'date',
      cell: ({ row }) => format(new Date(row.original.date), 'MMM dd, yyyy HH:mm')
    },
    {
      header: 'Type',
      accessorKey: 'type',
      cell: ({ row }) => (
        <Badge 
          content={row.original.type} 
          innerClass={`
            ${row.original.type === 'lease' ? 'bg-blue-100 text-blue-700' : ''}
            ${row.original.type === 'refill' ? 'bg-green-100 text-green-700' : ''}
            ${row.original.type === 'swap' ? 'bg-orange-100 text-orange-700' : ''}
            ${row.original.type === 'refund' ? 'bg-red-100 text-red-700' : ''}
          `}
        />
      )
    },
    {
      header: 'Customer',
      accessorKey: 'customer.name',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.customer.name}</p>
          <p className="text-xs text-gray-500">{row.original.customer.phone}</p>
        </div>
      )
    },
    {
      header: 'Outlet',
      accessorKey: 'outlet.name'
    },
    {
      header: 'Amount',
      accessorKey: 'amount',
      cell: ({ row }) => (
        <span className="font-medium">{formatCurrency(row.original.amount)}</span>
      )
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }) => (
        <Badge
          content={row.original.status}
          innerClass={`
            ${row.original.status === 'completed' ? 'bg-green-100 text-green-700' : ''}
            ${row.original.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : ''}
            ${row.original.status === 'failed' ? 'bg-red-100 text-red-700' : ''}
          `}
        />
      )
    },
    {
      header: 'Payment',
      accessorKey: 'paymentMethod',
      cell: ({ row }) => (
        <span className="capitalize">{row.original.paymentMethod.replace('_', ' ')}</span>
      )
    }
  ]

  // Export handlers
  const handleExport = async (format: 'pdf' | 'csv' | 'excel') => {
    try {
      await exportReport.mutateAsync({
        format,
        reportType: activeTab === 'financial' ? 'financial' : 
                   activeTab === 'revenue' ? 'revenue' : 
                   activeTab === 'transactions' ? 'transaction' : 'operational',
        filters,
        includeCharts: format === 'pdf',
        includeSummary: true
      })
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  return (
    <Container>
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
              <PiFileTextDuotone className="text-blue-600" />
              Reports & Analytics
            </h1>
            <p className="text-gray-600 mt-1">
              Comprehensive business reports and performance analytics
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* Date Range Filter */}
            <DateRangeFilter
              value={dateRange}
              onChange={setDateRange}
              showPresets={true}
            />
            
            {/* Export Options */}
            <Dropdown
              renderTitle={
                <Button
                  variant="solid"
                  size="sm"
                  icon={<PiDownloadDuotone />}
                  loading={exportReport.isPending}
                >
                  Export
                </Button>
              }
            >
              <Dropdown.Item onClick={() => handleExport('pdf')}>
                <span className="flex items-center gap-2">
                  <PiFilePdfDuotone className="text-red-600" />
                  Export as PDF
                </span>
              </Dropdown.Item>
              <Dropdown.Item onClick={() => handleExport('csv')}>
                <span className="flex items-center gap-2">
                  <PiFileCsvDuotone className="text-green-600" />
                  Export as CSV
                </span>
              </Dropdown.Item>
              <Dropdown.Item onClick={() => handleExport('excel')}>
                <span className="flex items-center gap-2">
                  <PiFileXlsDuotone className="text-blue-600" />
                  Export as Excel
                </span>
              </Dropdown.Item>
            </Dropdown>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          trend={financialData?.periodComparison?.revenueChange ? {
            value: financialData.periodComparison.revenueChange,
            type: financialData.periodComparison.revenueChange > 0 ? 'increase' : 'decrease'
          } : undefined}
          loading={financialLoading}
          icon={<PiCurrencyNgnDuotone className="text-green-600" />}
        />
        <MetricCard
          title="Total Outflows"
          value={formatCurrency(totalOutflows)}
          trend={financialData?.periodComparison?.outflowsChange ? {
            value: financialData.periodComparison.outflowsChange,
            type: financialData.periodComparison.outflowsChange > 0 ? 'increase' : 'decrease'
          } : undefined}
          loading={financialLoading}
          icon={<PiTrendDownDuotone className="text-red-600" />}
        />
        <MetricCard
          title="Net Income"
          value={formatCurrency(netIncome)}
          trend={growthRate ? {
            value: growthRate,
            type: growthRate > 0 ? 'increase' : growthRate < 0 ? 'decrease' : 'neutral'
          } : undefined}
          loading={financialLoading}
          icon={<PiChartLineDuotone className="text-blue-600" />}
        />
        <MetricCard
          title="Transactions"
          value={(transactionData as any)?.summary?.totalCount || 0}
          subtitle="Total transactions"
          loading={transactionLoading}
          icon={<PiPackageDuotone className="text-purple-600" />}
        />
      </div>

      {/* Report Tabs */}
      <AdaptiveCard>
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.TabList className="border-b px-4 md:px-6">
            <Tabs.TabNav value="financial">
              <span className="flex items-center gap-2">
                <PiCurrencyNgnDuotone />
                Financial Summary
              </span>
            </Tabs.TabNav>
            <Tabs.TabNav value="revenue">
              <span className="flex items-center gap-2">
                <PiChartLineDuotone />
                Revenue Analysis
              </span>
            </Tabs.TabNav>
            <Tabs.TabNav value="transactions">
              <span className="flex items-center gap-2">
                <PiPackageDuotone />
                Transactions
              </span>
            </Tabs.TabNav>
            <Tabs.TabNav value="operational">
              <span className="flex items-center gap-2">
                <PiBuildingsDuotone />
                Operations
              </span>
            </Tabs.TabNav>
          </Tabs.TabList>

          {/* Financial Summary Tab */}
          <Tabs.TabContent value="financial">
            <div className="p-4 md:p-6 space-y-6">
              {/* Revenue Trend Chart */}
              <AnalyticsChart
                title="Revenue Trend"
                subtitle="Daily revenue and net income trend"
                type="area"
                series={revenueTrendData.series}
                xAxis={revenueTrendData.categories}
                height={350}
                loading={financialLoading}
              />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Breakdown */}
                {revenueBreakdownData.series.length > 0 ? (
                  <AnalyticsChart
                    title="Revenue Breakdown"
                    subtitle="Revenue by category"
                    type="donut"
                    series={revenueBreakdownData.series}
                    xAxis={revenueBreakdownData.labels}
                    height={300}
                    loading={financialLoading}
                  />
                ) : (
                  <div className="bg-gray-50 rounded-lg p-8 text-center flex items-center justify-center">
                    <p className="text-gray-500">No revenue breakdown data available</p>
                  </div>
                )}

                {/* Revenue Categories Table */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Revenue Categories</h3>
                  {financialLoading ? (
                    <Skeleton className="h-64" />
                  ) : (
                    <div className="space-y-2">
                      {financialData?.revenueByCategory?.map((category, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <div className="flex items-center gap-3">
                            {category.category === 'lease' && <PiPackageDuotone className="text-blue-600" />}
                            {category.category === 'refill' && <PiGasPumpDuotone className="text-green-600" />}
                            {category.category === 'swap' && <PiArrowsLeftRightDuotone className="text-orange-600" />}
                            <div>
                              <p className="font-medium">{category.label}</p>
                              <p className="text-sm text-gray-500">{category.count} transactions</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{formatCurrency(category.amount)}</p>
                            <p className="text-sm text-gray-500">{category.percentage}%</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Tabs.TabContent>

          {/* Revenue Analysis Tab */}
          <Tabs.TabContent value="revenue">
            <div className="p-4 md:p-6 space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(revenueData?.summary?.totalRevenue || 0)}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Avg Transaction</p>
                  <p className="text-2xl font-bold">{formatCurrency(revenueData?.summary?.averageTransaction || 0)}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Total Transactions</p>
                  <p className="text-2xl font-bold">{revenueData?.summary?.transactionCount || 0}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Top Source</p>
                  <p className="text-2xl font-bold">{revenueData?.summary?.topRevenueSource || 'N/A'}</p>
                </div>
              </div>

              {/* Outlet Performance Chart */}
              {outletPerformanceData.categories.length > 0 ? (
                <AnalyticsChart
                  title="Top Performing Outlets"
                  subtitle="Revenue by outlet"
                  type="bar"
                  series={outletPerformanceData.series}
                  xAxis={outletPerformanceData.categories}
                  height={350}
                  loading={revenueLoading}
                />
              ) : (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <p className="text-gray-500">No outlet performance data available for the selected period</p>
                </div>
              )}

              {/* Top Customers Table */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Top Customers</h3>
                {revenueLoading ? (
                  <Skeleton className="h-64" />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Customer</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Total Revenue</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Transactions</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Avg Transaction</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {revenueData?.topCustomers?.map((customer, index) => (
                          <tr key={index}>
                            <td className="px-4 py-3">
                              <div>
                                <p className="font-medium">{customer.customerName}</p>
                                <p className="text-sm text-gray-500">{customer.customerEmail}</p>
                              </div>
                            </td>
                            <td className="px-4 py-3 font-medium">{formatCurrency(customer.totalRevenue)}</td>
                            <td className="px-4 py-3">{customer.transactionCount}</td>
                            <td className="px-4 py-3">{formatCurrency(customer.averageTransaction)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </Tabs.TabContent>

          {/* Transactions Tab */}
          <Tabs.TabContent value="transactions">
            <div className="p-4 md:p-6">
              {/* Filters */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Transaction Filters</h3>
                  <Button
                    variant="plain"
                    size="sm"
                    onClick={() => setTransactionFilters({
                      type: '',
                      status: '',
                      outlet: '',
                      minAmount: '',
                      maxAmount: ''
                    })}
                  >
                    Clear Filters
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  <Select
                    placeholder="Transaction Type"
                    value={transactionFilters.type ? { value: transactionFilters.type, label: transactionFilters.type } : null}
                    onChange={(option) => setTransactionFilters(prev => ({ ...prev, type: option?.value || '' }))}
                    options={[
                      { value: 'lease', label: 'Lease' },
                      { value: 'refill', label: 'Refill' },
                      { value: 'swap', label: 'Swap' },
                      { value: 'refund', label: 'Refund' }
                    ]}
                    isClearable
                  />
                  
                  <Select
                    placeholder="Status"
                    value={transactionFilters.status ? { value: transactionFilters.status, label: transactionFilters.status } : null}
                    onChange={(option) => setTransactionFilters(prev => ({ ...prev, status: option?.value || '' }))}
                    options={[
                      { value: 'completed', label: 'Completed' },
                      { value: 'pending', label: 'Pending' },
                      { value: 'failed', label: 'Failed' }
                    ]}
                    isClearable
                  />
                  
                  <Input
                    placeholder="Min Amount"
                    type="number"
                    value={transactionFilters.minAmount}
                    onChange={(e) => setTransactionFilters(prev => ({ ...prev, minAmount: e.target.value }))}
                  />
                  
                  <Input
                    placeholder="Max Amount"
                    type="number"
                    value={transactionFilters.maxAmount}
                    onChange={(e) => setTransactionFilters(prev => ({ ...prev, maxAmount: e.target.value }))}
                  />
                  
                  <Button
                    variant="solid"
                    icon={<PiFunnelDuotone />}
                    onClick={() => setCurrentPage(1)}
                  >
                    Apply Filters
                  </Button>
                </div>
              </div>

              {/* Transaction Summary */}
              {(transactionData as any)?.summary && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="text-xl font-bold">{formatCurrency((transactionData as any).summary.totalAmount)}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Total Transactions</p>
                    <p className="text-xl font-bold">{(transactionData as any).summary.totalCount}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Average Amount</p>
                    <p className="text-xl font-bold">{formatCurrency((transactionData as any).summary.averageAmount)}</p>
                  </div>
                </div>
              )}

              {/* Transactions Table */}
              <div className="flex justify-end mb-4">
                <TableExportButton
                  data={(transactionData as any)?.transactions || []}
                  columns={[
                    { key: 'transactionId', header: 'Transaction ID' },
                    { key: 'date', header: 'Date', formatter: (v: any) => format(new Date(v), 'MMM dd, yyyy HH:mm') },
                    { key: 'type', header: 'Type' },
                    { key: 'customer.name', header: 'Customer' },
                    { key: 'outlet.name', header: 'Outlet' },
                    { key: 'amount', header: 'Amount', formatter: (v: any) => formatCurrency(v) },
                    { key: 'status', header: 'Status' },
                    { key: 'paymentMethod', header: 'Payment Method' }
                  ]}
                  filename={`transactions-${format(new Date(), 'yyyy-MM-dd')}`}
                  title="Transaction Report"
                />
              </div>

              <DataTable
                columns={transactionColumns}
                data={(transactionData as any)?.transactions || []}
                loading={transactionLoading}
              />
            </div>
          </Tabs.TabContent>

          {/* Operational Tab */}
          <Tabs.TabContent value="operational">
            <div className="p-4 md:p-6 space-y-6">
              {/* Cylinder Metrics */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Cylinder Metrics</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-600">Total Cylinders</p>
                    <p className="text-2xl font-bold">{operationalData?.cylinderMetrics?.totalCylinders || 0}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-600">Available</p>
                    <p className="text-2xl font-bold">{operationalData?.cylinderMetrics?.availableCylinders || 0}</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <p className="text-sm text-orange-600">Leased</p>
                    <p className="text-2xl font-bold">{operationalData?.cylinderMetrics?.leasedCylinders || 0}</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-purple-600">Utilization Rate</p>
                    <p className="text-2xl font-bold">{operationalData?.cylinderMetrics?.utilizationRate || 0}%</p>
                  </div>
                </div>
              </div>

              {/* Outlet Metrics */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Outlet Performance</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Top Performing */}
                  <div>
                    <h4 className="font-medium mb-3 text-green-700">Top Performing Outlets</h4>
                    <div className="space-y-2">
                      {operationalData?.outletMetrics?.topPerformingOutlets?.map((outlet, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-green-50 rounded">
                          <div>
                            <p className="font-medium">{outlet.name}</p>
                            <p className="text-sm text-gray-600">{outlet.transactions} transactions</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{formatCurrency(outlet.revenue)}</p>
                            <p className="text-sm text-green-600">+{outlet.growthRate}%</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Low Performing */}
                  <div>
                    <h4 className="font-medium mb-3 text-red-700">Attention Required</h4>
                    <div className="space-y-2">
                      {operationalData?.outletMetrics?.lowPerformingOutlets?.map((outlet, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-red-50 rounded">
                          <div>
                            <p className="font-medium">{outlet.name}</p>
                            <p className="text-sm text-gray-600">{outlet.transactions} transactions</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{formatCurrency(outlet.revenue)}</p>
                            <Badge content="Low Performance" innerClass="bg-red-100 text-red-700 text-xs" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Metrics */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Customer Metrics</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <PiUsersDuotone className="text-purple-600" />
                      <p className="text-sm text-gray-600">Total Customers</p>
                    </div>
                    <p className="text-2xl font-bold">{operationalData?.customerMetrics?.totalCustomers || 0}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <PiArrowUpDuotone className="text-green-600" />
                      <p className="text-sm text-gray-600">Active Customers</p>
                    </div>
                    <p className="text-2xl font-bold">{operationalData?.customerMetrics?.activeCustomers || 0}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <PiTrendUpDuotone className="text-blue-600" />
                      <p className="text-sm text-gray-600">New This Month</p>
                    </div>
                    <p className="text-2xl font-bold">{operationalData?.customerMetrics?.newCustomers || 0}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <PiChartLineDuotone className="text-orange-600" />
                      <p className="text-sm text-gray-600">Retention Rate</p>
                    </div>
                    <p className="text-2xl font-bold">{operationalData?.customerMetrics?.retentionRate || 0}%</p>
                  </div>
                </div>
              </div>
            </div>
          </Tabs.TabContent>
        </Tabs>
      </AdaptiveCard>

      {/* Footer Alert */}
      <Alert showIcon className="mt-6" type="info">
        <p>
          Reports are generated based on the selected date range. 
          For more detailed analysis, you can export the data in various formats.
        </p>
      </Alert>
    </Container>
  )
}