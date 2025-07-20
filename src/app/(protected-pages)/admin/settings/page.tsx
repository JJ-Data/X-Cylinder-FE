'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  PiGearDuotone,
  PiFolderDuotone,
  PiCurrencyDollarDuotone,
  PiCalculatorDuotone,
  PiPlusDuotone,
  PiDownloadDuotone,
  PiUploadDuotone,
  PiTrendUpDuotone,
  PiShieldCheckDuotone,
  PiClockCounterClockwiseDuotone,
  PiEyeDuotone,
  PiPencilDuotone,
  PiTrashDuotone,
  PiWarningDuotone,
  PiCheckCircleDuotone,
  PiCalendarDuotone,
  PiTagDuotone,
  PiChartLineUpDuotone,
  PiSlidersHorizontalDuotone,
} from 'react-icons/pi'
import { useSettingCategories, useSettingsStatistics, useSettingsImportExport } from '@/hooks/useSettings'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Skeleton from '@/components/ui/Skeleton'
import useWindowSize from '@/components/ui/hooks/useWindowSize'
import { formatNumber } from '@/utils/format'
import { SETTING_CATEGORIES } from '@/types/settings'
import type { SettingCategory, SettingsStatistics } from '@/types/settings'

// Category configuration with colors and icons
const categoryConfig = {
  [SETTING_CATEGORIES.PRICING]: {
    icon: PiCurrencyDollarDuotone,
    color: 'emerald',
    description: 'General pricing settings and base rates'
  },
  [SETTING_CATEGORIES.LEASE]: {
    icon: PiCalendarDuotone,
    color: 'blue',
    description: 'Cylinder lease operations and pricing'
  },
  [SETTING_CATEGORIES.REFILL]: {
    icon: PiSlidersHorizontalDuotone,
    color: 'purple',
    description: 'Gas refill operations and volume pricing'
  },
  [SETTING_CATEGORIES.SWAP]: {
    icon: PiTagDuotone,
    color: 'orange',
    description: 'Cylinder swap operations and condition fees'
  },
  [SETTING_CATEGORIES.REGISTRATION]: {
    icon: PiShieldCheckDuotone,
    color: 'cyan',
    description: 'Customer registration and onboarding'
  },
  [SETTING_CATEGORIES.PENALTIES]: {
    icon: PiWarningDuotone,
    color: 'red',
    description: 'Penalty rates and late fees'
  },
  [SETTING_CATEGORIES.DEPOSITS]: {
    icon: PiTrendUpDuotone,
    color: 'yellow',
    description: 'Security deposit amounts'
  },
  [SETTING_CATEGORIES.BUSINESS_RULES]: {
    icon: PiGearDuotone,
    color: 'gray',
    description: 'General business operation rules'
  },
  [SETTING_CATEGORIES.DISCOUNTS]: {
    icon: PiChartLineUpDuotone,
    color: 'green',
    description: 'Customer tier and volume discounts'
  },
  [SETTING_CATEGORIES.TAXES]: {
    icon: PiCalculatorDuotone,
    color: 'indigo',
    description: 'Tax rates and calculations'
  }
}

// Statistics card component
function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color = 'blue',
  trend,
  onClick 
}: {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ComponentType<any>
  color?: string
  trend?: { value: number; isPositive: boolean }
  onClick?: () => void
}) {
  return (
    <Card
      className={`p-6 hover:shadow-lg transition-shadow cursor-pointer ${onClick ? 'hover:bg-gray-50' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className={`flex items-center mt-2 text-sm ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              <PiTrendUpDuotone className={`h-4 w-4 mr-1 ${
                !trend.isPositive ? 'rotate-180' : ''
              }`} />
              {Math.abs(trend.value)}% vs last month
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-${color}-100`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
      </div>
    </Card>
  )
}

// Category card component
function CategoryCard({ 
  category, 
  settingsCount, 
  onClick 
}: { 
  category: SettingCategory
  settingsCount?: number
  onClick?: () => void 
}) {
  const config = categoryConfig[category.name as keyof typeof categoryConfig]
  const Icon = config?.icon || PiFolderDuotone

  return (
    <Card
      className="p-6 hover:shadow-lg transition-all cursor-pointer hover:scale-[1.02]"
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-lg bg-${config?.color || 'gray'}-100`}>
            <Icon className={`h-6 w-6 text-${config?.color || 'gray'}-600`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
            <p className="text-sm text-gray-600 mt-1">
              {config?.description || category.description || 'Business settings category'}
            </p>
            <div className="flex items-center space-x-4 mt-2">
              <span className="text-sm text-gray-500">
                {settingsCount || 0} settings
              </span>
              <Badge
                content={category.isActive ? 'Active' : 'Inactive'}
                innerClass={category.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
              />
            </div>
          </div>
        </div>
        <PiEyeDuotone className="h-5 w-5 text-gray-400" />
      </div>
    </Card>
  )
}

export default function SettingsPage() {
  const router = useRouter()
  const windowSize = useWindowSize()
  const isMobile = (windowSize.width || 0) < 768
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  // Data hooks
  const { categories, isLoading: categoriesLoading, error: categoriesError } = useSettingCategories()
  const { statistics, isLoading: statsLoading, error: statsError } = useSettingsStatistics()
  const { exportSettings, downloadTemplate, isExporting } = useSettingsImportExport()

  // Handle category navigation
  const handleCategoryClick = (categoryName: string) => {
    router.push(`/admin/settings/category/${categoryName.toLowerCase()}`)
  }

  // Handle quick actions
  const handlePricingCalculator = () => {
    router.push('/admin/settings/pricing/calculator')
  }

  const handleCreateSetting = () => {
    router.push('/admin/settings/new')
  }

  const handleAuditTrail = () => {
    router.push('/admin/settings/audit')
  }

  if (categoriesError || statsError) {
    return (
      <Container>
        <Card className="p-8 text-center">
          <PiWarningDuotone className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Settings</h3>
          <p className="text-gray-600 mb-4">
            {categoriesError?.message || statsError?.message || 'Failed to load settings data'}
          </p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </Card>
      </Container>
    )
  }

  return (
    <Container>
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <PiGearDuotone className="h-8 w-8 mr-3 text-blue-600" />
              Settings Management
            </h1>
            <p className="text-gray-600 mt-2">
              Configure business rules, pricing, and operational parameters
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <Button
              variant="plain"
              onClick={handleAuditTrail}
              className="flex items-center"
            >
              <PiClockCounterClockwiseDuotone className="h-4 w-4 mr-2" />
              Audit Trail
            </Button>
            <Button
              variant="plain"
              onClick={() => exportSettings()}
              loading={isExporting}
              className="flex items-center"
            >
              <PiDownloadDuotone className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button
              onClick={handleCreateSetting}
              className="flex items-center"
            >
              <PiPlusDuotone className="h-4 w-4 mr-2" />
              New Setting
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics Overview */}
      {statsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-4 w-32" />
            </Card>
          ))}
        </div>
      ) : statistics ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Settings"
            value={formatNumber(statistics.totalSettings)}
            subtitle={`${statistics.activeSettings} active`}
            icon={PiGearDuotone}
            color="blue"
          />
          <StatCard
            title="Categories"
            value={formatNumber(statistics.categoriesCount)}
            subtitle="Business areas"
            icon={PiFolderDuotone}
            color="purple"
          />
          <StatCard
            title="Recent Changes"
            value={formatNumber(statistics.recentChanges)}
            subtitle="Last 30 days"
            icon={PiClockCounterClockwiseDuotone}
            color="orange"
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Price Overrides"
            value={formatNumber(statistics.priceOverrides)}
            subtitle="Custom pricing rules"
            icon={PiCurrencyDollarDuotone}
            color="green"
          />
        </div>
      ) : null}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card
          className="p-6 hover:shadow-lg transition-shadow cursor-pointer hover:bg-blue-50"
          onClick={handlePricingCalculator}
        >
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100 mr-4">
              <PiCalculatorDuotone className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Pricing Calculator</h3>
              <p className="text-sm text-gray-600">Test and calculate prices in real-time</p>
            </div>
          </div>
        </Card>

        <Card
          className="p-6 hover:shadow-lg transition-shadow cursor-pointer hover:bg-green-50"
          onClick={() => downloadTemplate()}
        >
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100 mr-4">
              <PiUploadDuotone className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Import Settings</h3>
              <p className="text-sm text-gray-600">Bulk import from CSV or JSON</p>
            </div>
          </div>
        </Card>

        <Card
          className="p-6 hover:shadow-lg transition-shadow cursor-pointer hover:bg-purple-50"
          onClick={() => router.push('/admin/settings/templates')}
        >
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100 mr-4">
              <PiTagDuotone className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Templates</h3>
              <p className="text-sm text-gray-600">Pre-configured setting templates</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Categories Grid */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Settings Categories</h2>
          <div className="flex items-center space-x-2">
            <Button
              variant="plain"
              size="sm"
              onClick={() => setViewMode('grid')}
              className={viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : ''}
            >
              Grid
            </Button>
            <Button
              variant="plain"
              size="sm"
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'bg-blue-50 text-blue-600' : ''}
            >
              List
            </Button>
          </div>
        </div>
      </div>

      {categoriesLoading ? (
        <div className={`grid gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1'
        }`}>
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-6">
              <div className="flex items-start space-x-3">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-4 w-48 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className={`grid gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1'
        }`}>
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              settingsCount={statistics?.settingsByCategory?.[category.name] || 0}
              onClick={() => handleCategoryClick(category.name)}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!categoriesLoading && categories.length === 0 && (
        <Card className="p-12 text-center">
          <PiFolderDuotone className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Categories Found</h3>
          <p className="text-gray-600 mb-6">
            Get started by creating your first settings category
          </p>
          <Button onClick={() => router.push('/admin/settings/categories/new')}>
            <PiPlusDuotone className="h-4 w-4 mr-2" />
            Create Category
          </Button>
        </Card>
      )}
    </Container>
  )
}