'use client'

import { useState, useMemo } from 'react'
import { useOperatorPerformance, useAllOperators } from '@/hooks/useAnalytics'
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
import Avatar from '@/components/ui/Avatar'
import { formatCurrency } from '@/utils/format'
import { format, subDays } from 'date-fns'
import { 
  PiUserDuotone,
  PiGasPumpDuotone,
  PiChartLineDuotone,
  PiTrendUpDuotone,
  PiStarDuotone,
  PiTimerDuotone,
  PiTargetDuotone,
  PiMedalDuotone,
  PiCurrencyCircleDollarDuotone
} from 'react-icons/pi'
import { ColumnDef } from '@tanstack/react-table'
import type { OperatorPerformance } from '@/types/analytics'

export default function OperatorAnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: subDays(new Date(), 30),
    endDate: new Date()
  })
  const [selectedOperatorId, setSelectedOperatorId] = useState<number | null>(null)

  const { data: performanceData, isLoading } = useOperatorPerformance(
    selectedOperatorId || undefined,
    {
      startDate: dateRange.startDate ? format(dateRange.startDate, 'yyyy-MM-dd') : '',
      endDate: dateRange.endDate ? format(dateRange.endDate, 'yyyy-MM-dd') : ''
    }
  )

  const { data: allOperatorsData, isLoading: isLoadingAll } = useAllOperators(
    {
      startDate: dateRange.startDate ? format(dateRange.startDate, 'yyyy-MM-dd') : '',
      endDate: dateRange.endDate ? format(dateRange.endDate, 'yyyy-MM-dd') : ''
    }
  )

  // Daily performance chart
  const dailyPerformanceData = useMemo(() => {
    if (!performanceData?.daily || performanceData.daily.length === 0) {
      return { series: [], categories: [] }
    }

    return {
      series: [
        {
          name: 'Refills',
          data: performanceData.daily.map(d => d.refillCount)
        },
        {
          name: 'Volume (kg)',
          data: performanceData.daily.map(d => d.volumeProcessed)
        }
      ],
      categories: performanceData.daily.map(d => format(new Date(d.date), 'MMM dd'))
    }
  }, [performanceData])

  // Performance comparison chart
  const comparisonData = useMemo(() => {
    if (!performanceData?.comparison || performanceData.comparison.length === 0) {
      return { series: [], categories: [] }
    }

    return {
      series: [{
        name: 'Operator',
        data: performanceData.comparison.map(c => c.value)
      }, {
        name: 'Average',
        data: performanceData.comparison.map(c => c.average)
      }],
      categories: performanceData.comparison.map(c => c.metric)
    }
  }, [performanceData])

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    // TODO: Implement export functionality
    console.log(`Exporting operator analytics as ${format}`)
  }

  // Mock operator list for demo
  const operatorOptions = [
    { value: '', label: 'All Operators' },
    { value: '1', label: 'John Doe' },
    { value: '2', label: 'Jane Smith' },
    { value: '3', label: 'Mike Johnson' },
    { value: '4', label: 'Sarah Williams' }
  ]

  // Performance metrics for all operators (when no specific operator is selected)
  const allOperatorsMetrics = allOperatorsData?.summary || {
    totalOperators: 0,
    activeOperators: 0,
    averageRefillsPerDay: 0,
    averageEfficiency: 0,
    totalRefillsToday: 0
  }

  return (
    <AnalyticsLayout
      title="Operator Performance Analytics"
      subtitle="Monitor and evaluate operator efficiency"
      actions={
        <>
          <Select
            options={operatorOptions}
            value={operatorOptions.find(opt => 
              opt.value === (selectedOperatorId?.toString() || '')
            )}
            onChange={(option) => 
              setSelectedOperatorId(option?.value ? Number(option.value) : null)
            }
            placeholder="Select operator"
          />
          <DateRangeFilter value={dateRange} onChange={setDateRange} />
          <ExportButton onExport={handleExport} />
        </>
      }
    >
      {/* Key Metrics */}
      {selectedOperatorId ? (
        // Individual Operator Metrics
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <MetricCard
            title="Total Refills"
            value={performanceData?.metrics?.totalRefills || 0}
            subtitle="In selected period"
            icon={<PiGasPumpDuotone className="text-green-600" />}
            iconBgColor="bg-green-50"
            loading={isLoadingAll}
          />
          
          <MetricCard
            title="Daily Average"
            value={performanceData?.metrics?.dailyAverage?.toFixed(1) || '0'}
            subtitle="Refills per day"
            icon={<PiChartLineDuotone className="text-blue-600" />}
            iconBgColor="bg-blue-50"
            loading={isLoadingAll}
          />
          
          <MetricCard
            title="Efficiency"
            value={`${performanceData?.metrics?.efficiency || 0}%`}
            subtitle="Performance rate"
            icon={<PiTargetDuotone className="text-purple-600" />}
            iconBgColor="bg-purple-50"
            trend={{
              value: 3.2,
              type: 'increase'
            }}
            loading={isLoadingAll}
          />
          
          <MetricCard
            title="Accuracy"
            value={`${performanceData?.metrics?.accuracy || 0}%`}
            subtitle="Error-free rate"
            icon={<PiMedalDuotone className="text-orange-600" />}
            iconBgColor="bg-orange-50"
            loading={isLoadingAll}
          />
          
          <MetricCard
            title="Rating"
            value={`${performanceData?.metrics?.rating || 0}/5`}
            subtitle="Customer rating"
            icon={<PiStarDuotone className="text-yellow-600" />}
            iconBgColor="bg-yellow-50"
            loading={isLoadingAll}
          />
        </div>
      ) : (
        // All Operators Summary Metrics
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard
            title="Total Operators"
            value={allOperatorsMetrics.totalOperators}
            subtitle="Total operators"
            icon={<PiUserDuotone className="text-blue-600" />}
            iconBgColor="bg-blue-50"
            loading={isLoadingAll}
          />
          
          <MetricCard
            title="Avg. Refills/Day"
            value={allOperatorsMetrics.averageRefillsPerDay}
            subtitle="Per operator"
            icon={<PiGasPumpDuotone className="text-green-600" />}
            iconBgColor="bg-green-50"
            loading={isLoadingAll}
          />
          
          <MetricCard
            title="Avg. Efficiency"
            value={`${allOperatorsMetrics.averageEfficiency}%`}
            subtitle="Overall efficiency"
            icon={<PiChartLineDuotone className="text-purple-600" />}
            iconBgColor="bg-purple-50"
            loading={isLoadingAll}
          />
          
          <MetricCard
            title="Today's Refills"
            value={allOperatorsMetrics.totalRefillsToday}
            subtitle="Completed today"
            icon={<PiTimerDuotone className="text-orange-600" />}
            iconBgColor="bg-orange-50"
            trend={{
              value: 8.5,
              type: 'increase'
            }}
            loading={isLoadingAll}
          />
        </div>
      )}

      {selectedOperatorId && (
        <>
          {/* Operator Profile Card */}
          <AdaptiveCard className="mb-8">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <Avatar 
                  size="lg"
                  src={`https://ui-avatars.com/api/?name=${performanceData?.operatorName || 'Operator'}&background=3b82f6&color=fff`}
                />
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {performanceData?.operatorName || 'Operator'}
                  </h3>
                  <p className="text-gray-600">{performanceData?.outletName || 'Outlet'}</p>
                  <div className="flex items-center gap-4 mt-3">
                    <Badge 
                      content="Active"
                      innerClass="bg-green-100 text-green-700"
                    />
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <PiStarDuotone 
                          key={star}
                          className={`text-lg ${
                            star <= (performanceData?.metrics?.rating || 0) 
                              ? 'text-yellow-500' 
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="text-sm text-gray-600 ml-1">
                        ({performanceData?.metrics?.rating || 0}/5)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AdaptiveCard>

          {/* Daily Performance Chart */}
          <div className="mb-8">
            <AnalyticsChart
              title="Daily Performance"
              subtitle="Refill activity over time"
              type="line"
              series={dailyPerformanceData.series}
              xAxis={dailyPerformanceData.categories}
              height={350}
              loading={isLoadingAll}
              customOptions={{
                colors: ['#10b981', '#3b82f6'],
                stroke: {
                  curve: 'smooth',
                  width: 3
                },
                markers: {
                  size: 4
                },
                yaxis: [
                  {
                    title: {
                      text: 'Refill Count'
                    }
                  },
                  {
                    opposite: true,
                    title: {
                      text: 'Volume (kg)'
                    }
                  }
                ],
                legend: {
                  position: 'top',
                  horizontalAlign: 'right'
                }
              }}
            />
          </div>

          {/* Performance Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <AnalyticsChart
              title="Performance vs Average"
              subtitle="Comparison with other operators"
              type="radar"
              series={comparisonData.series}
              height={300}
              loading={isLoadingAll}
              customOptions={{
                colors: ['#3b82f6', '#e5e7eb'],
                xaxis: {
                  categories: comparisonData.categories
                },
                yaxis: {
                  show: false
                },
                markers: {
                  size: 4
                }
              }}
            />

            {/* Performance Breakdown */}
            <AdaptiveCard>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Performance Breakdown
                </h3>
                
                <div className="space-y-4">
                  {performanceData?.comparison?.map((metric) => (
                    <div key={metric.metric}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          {metric.metric}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">
                            {metric.value} / {metric.average} avg
                          </span>
                          <Badge 
                            content={`${metric.percentile}th percentile`}
                            innerClass={
                              metric.percentile >= 75 ? 'bg-green-100 text-green-700' :
                              metric.percentile >= 50 ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }
                          />
                        </div>
                      </div>
                      <Progress 
                        percent={metric.percentile}
                        customColorClass={
                          metric.percentile >= 75 ? 'bg-green-500' :
                          metric.percentile >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                        }
                        size="sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </AdaptiveCard>
          </div>
        </>
      )}

      {/* All Operators Table (when no specific operator is selected) */}
      {!selectedOperatorId && (
        <AdaptiveCard>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Operator Rankings</h3>
              <Badge 
                content={`${allOperatorsMetrics.totalOperators} operators`}
                innerClass="bg-gray-100 text-gray-700"
              />
            </div>
            
            {/* Mock table for all operators */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Operator
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Outlet
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Refills
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Efficiency
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue Generated
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(allOperatorsData?.operators || []).map((operator: any) => (
                    <tr key={operator.operatorId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {operator.rank <= 3 && (
                            <PiMedalDuotone className={`text-xl mr-2 ${
                              operator.rank === 1 ? 'text-yellow-500' :
                              operator.rank === 2 ? 'text-gray-400' :
                              'text-orange-600'
                            }`} />
                          )}
                          <span className="font-medium">{operator.rank}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Avatar 
                            size="sm"
                            src={`https://ui-avatars.com/api/?name=${operator.operatorName}&background=3b82f6&color=fff`}
                          />
                          <span className="ml-2 font-medium text-gray-900">{operator.operatorName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {operator.outletName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge 
                          content={operator.totalRefills}
                          innerClass="bg-blue-100 text-blue-700"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Progress 
                            percent={operator.efficiency}
                            customColorClass="bg-green-500"
                            size="sm"
                            className="w-20"
                          />
                          <span className="text-sm font-medium">{operator.efficiency}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <PiStarDuotone className="text-yellow-500" />
                          <span className="text-sm font-medium">{operator.rating}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {formatCurrency(operator.revenueGenerated)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </AdaptiveCard>
      )}
    </AnalyticsLayout>
  )
}