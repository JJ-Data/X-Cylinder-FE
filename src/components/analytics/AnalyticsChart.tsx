'use client'

import { ReactNode } from 'react'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Chart from '@/components/shared/Chart'
import Skeleton from '@/components/ui/Skeleton'
import type { ApexOptions } from 'apexcharts'
import type { ChartProps } from '@/components/shared/Chart'

interface AnalyticsChartProps extends ChartProps {
  title: string
  subtitle?: string
  loading?: boolean
  error?: boolean
  actions?: ReactNode
  containerClassName?: string
}

export default function AnalyticsChart({
  title,
  subtitle,
  loading = false,
  error = false,
  actions,
  containerClassName,
  donutTitle,
  donutText,
  ...chartProps
}: AnalyticsChartProps) {
  return (
    <AdaptiveCard className={containerClassName}>
      <div className="p-4 md:p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
          {actions && <div>{actions}</div>}
        </div>

        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <p>Failed to load chart data</p>
          </div>
        ) : (
          <Chart {...chartProps} donutTitle={donutTitle} donutText={donutText} />
        )}
      </div>
    </AdaptiveCard>
  )
}