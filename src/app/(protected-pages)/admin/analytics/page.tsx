'use client'

import { useRouter } from 'next/navigation'
import { useAnalyticsOverview } from '@/hooks/useAnalytics'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import { Spinner, EmptyState } from '@/components/ui'
import { 
  PiChartLineDuotone,
  PiCurrencyCircleDollarDuotone,
  PiBuildingsDuotone,
  PiCubeDuotone,
  PiUsersDuotone,
  PiUserDuotone,
  PiArrowRightDuotone
} from 'react-icons/pi'

interface AnalyticsSection {
  title: string
  description: string
  icon: React.ReactNode
  iconBgColor: string
  href: string
  metrics?: {
    label: string
    value: string
  }[]
}

const sectionConfigs = [
  {
    title: 'Revenue Analytics',
    description: 'Track revenue trends, growth patterns, and financial performance across all outlets',
    icon: <PiCurrencyCircleDollarDuotone className="text-purple-600" />,
    iconBgColor: 'bg-purple-50',
    href: '/admin/analytics/revenue'
  },
  {
    title: 'Outlet Performance',
    description: 'Compare outlet performance, efficiency metrics, and operational insights',
    icon: <PiBuildingsDuotone className="text-blue-600" />,
    iconBgColor: 'bg-blue-50',
    href: '/admin/analytics/outlets'
  },
  {
    title: 'Cylinder Utilization',
    description: 'Monitor cylinder usage patterns, availability, and maintenance schedules',
    icon: <PiCubeDuotone className="text-green-600" />,
    iconBgColor: 'bg-green-50',
    href: '/admin/analytics/cylinders'
  },
  {
    title: 'Customer Analytics',
    description: 'Understand customer behavior, retention rates, and growth trends',
    icon: <PiUsersDuotone className="text-orange-600" />,
    iconBgColor: 'bg-orange-50',
    href: '/admin/analytics/customers'
  },
  {
    title: 'Operator Performance',
    description: 'Evaluate operator efficiency, productivity, and performance metrics',
    icon: <PiUserDuotone className="text-indigo-600" />,
    iconBgColor: 'bg-indigo-50',
    href: '/admin/analytics/operators'
  }
]

export default function AnalyticsOverviewPage() {
  const router = useRouter()
  const { data: overviewData, isLoading, error } = useAnalyticsOverview()

  if (isLoading) {
    return (
      <Container>
        <div className="flex items-center justify-center h-64">
          <Spinner size={40} />
        </div>
      </Container>
    )
  }

  if (error) {
    return (
      <Container>
        <EmptyState
          title="Error loading analytics"
          description="Unable to fetch analytics data. Please try again."
          icon={<PiChartLineDuotone className="text-5xl text-gray-400" />}
        />
      </Container>
    )
  }

  // Map the API data to sections with metrics
  const analyticsSections: AnalyticsSection[] = sectionConfigs.map((config, index) => {
    const sectionData = overviewData?.sections?.[index]
    return {
      ...config,
      metrics: sectionData?.metrics || []
    }
  })

  return (
    <Container>
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Analytics Overview
            </h1>
            <p className="text-gray-600">
              Comprehensive insights and data analysis for your business
            </p>
          </div>
          <div className="flex items-center gap-2">
            <PiChartLineDuotone className="text-3xl text-gray-400" />
          </div>
        </div>
      </div>

      {/* Analytics Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {analyticsSections.map((section) => (
          <AdaptiveCard
            key={section.href}
            className="hover:shadow-lg transition-all duration-200 cursor-pointer group"
            onClick={() => router.push(section.href)}
          >
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className={`p-4 rounded-xl ${section.iconBgColor}`}>
                  <div className="text-3xl">{section.icon}</div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {section.title}
                    </h3>
                    <PiArrowRightDuotone className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4">
                    {section.description}
                  </p>
                  
                  {section.metrics && (
                    <div className="flex items-center gap-4">
                      {section.metrics.map((metric) => (
                        <div key={metric.label} className="flex-1">
                          <p className="text-xs text-gray-500">{metric.label}</p>
                          <p className="text-lg font-semibold text-gray-900">{metric.value}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </AdaptiveCard>
        ))}
      </div>

      {/* Quick Stats Summary */}
      {overviewData?.summary && (
        <AdaptiveCard className="mt-8">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              System Summary
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{overviewData.summary.monthlyRevenue}</p>
                <p className="text-sm text-gray-600 mt-1">Monthly Revenue</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{overviewData.summary.totalCustomers}</p>
                <p className="text-sm text-gray-600 mt-1">Total Customers</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{overviewData.summary.activeCylinders}</p>
                <p className="text-sm text-gray-600 mt-1">Active Cylinders</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{overviewData.summary.activeOutlets}</p>
                <p className="text-sm text-gray-600 mt-1">Active Outlets</p>
              </div>
            </div>
          </div>
        </AdaptiveCard>
      )}
    </Container>
  )
}