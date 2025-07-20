'use client'

import { useSession } from 'next-auth/react'
import { useAuthStore } from '@/stores'
import { useDashboardMetrics, useRevenueAnalytics } from '@/hooks/useAnalytics'
import { formatCurrency } from '@/utils/format'
import Link from 'next/link'
import { useEffect, useState, useMemo } from 'react'
import Container from '@/components/shared/Container'
import Alert from '@/components/ui/Alert'
import MetricCard from '@/components/analytics/MetricCard'
import AnalyticsChart from '@/components/analytics/AnalyticsChart'
import ActivityFeed from '@/components/analytics/ActivityFeed'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { 
  PiBuildingsDuotone,
  PiCubeDuotone,
  PiPackageDuotone,
  PiCurrencyCircleDollarDuotone,
  PiChartLineDuotone,
  PiArrowRightDuotone,
  PiGasPumpDuotone,
  PiUsersDuotone,
  PiTrendUpDuotone,
  PiWarningDuotone,
  PiPlusDuotone,
  PiGearDuotone,
  PiArrowsLeftRightDuotone
} from 'react-icons/pi'
import { useRouter } from 'next/navigation'
import { subDays, format } from 'date-fns'
import type { ActivityItem } from '@/components/analytics/ActivityFeed'
import { validateEnvironmentVariables } from '@/utils/validateEnv'

export default function AdminDashboard() {
    const { data: session, status, update } = useSession()
    const { activeRole: _activeRole } = useAuthStore()
    const [tokenCheckAttempts, setTokenCheckAttempts] = useState(0)
    const [sessionError, setSessionError] = useState<string | null>(null)
    
    // Enhanced session state tracking
    const accessToken = (session as any)?.accessToken
    const hasValidSession = status === 'authenticated' && session && accessToken
    
    const { data: metrics, error, isLoading, mutate: refreshMetrics } = useDashboardMetrics()
    
    // Provide default date range for revenue analytics (last 30 days)
    const defaultDateRange = useMemo(() => ({
        startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
        endDate: format(new Date(), 'yyyy-MM-dd')
    }), [])
    
    const { data: revenueData } = useRevenueAnalytics(defaultDateRange)
    const [isMounted, setIsMounted] = useState(false)
    const router = useRouter()

    // Track session and metrics state changes
    useEffect(() => {
        // State tracking removed for production
    }, [session, status, error, isLoading, metrics, accessToken, tokenCheckAttempts])

    useEffect(() => {
        setIsMounted(true)
        
        // Validate environment on mount
        const envValidation = validateEnvironmentVariables()
        // Environment validation check removed for production
        
    }, [])
    
    // Retry logic for session token availability
    useEffect(() => {
        if (status === 'authenticated' && session && !accessToken && tokenCheckAttempts < 5) {
            const timeout = setTimeout(async () => {
                // Force session update to get latest token
                await update()
                setTokenCheckAttempts(prev => prev + 1)
            }, 1000) // Wait 1 second between retries
            
            return () => clearTimeout(timeout)
        }
        
        if (tokenCheckAttempts >= 5 && !accessToken) {
            setSessionError('Failed to retrieve access token after multiple attempts. Please try signing out and back in.')
        }
    }, [status, session, accessToken, tokenCheckAttempts, update])

    // Convert recent activity to ActivityItem format
    const recentActivities = useMemo<ActivityItem[]>(() => {
        const activities: ActivityItem[] = []
        
        // Add recent leases
        if (metrics?.recentActivity?.leases) {
            metrics.recentActivity.leases.forEach(lease => {
                activities.push({
                    id: `lease-${lease.id}`,
                    type: 'lease',
                    title: `New lease by ${lease.customerName}`,
                    description: `${lease.cylinderCode} leased from ${lease.outletName}`,
                    timestamp: lease.leaseDate,
                    metadata: {
                        amount: lease.amount,
                        cylinderCode: lease.cylinderCode,
                        customerName: lease.customerName,
                        outletName: lease.outletName
                    }
                })
            })
        }
        
        // Add recent refills
        if (metrics?.recentActivity?.refills) {
            metrics.recentActivity.refills.forEach(refill => {
                activities.push({
                    id: `refill-${refill.id}`,
                    type: 'refill',
                    title: `Cylinder refilled by ${refill.operatorName}`,
                    description: `${refill.cylinderCode} refilled with ${refill.volume} kg`,
                    timestamp: refill.refillDate,
                    metadata: {
                        volume: refill.volume,
                        amount: refill.cost,
                        cylinderCode: refill.cylinderCode
                    }
                })
            })
        }
        
        // Sort by timestamp (newest first)
        return activities.sort((a, b) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
    }, [metrics?.recentActivity])

    // Prepare revenue chart data
    const revenueChartData = useMemo(() => {
        if (!revenueData?.byPeriod) return { series: [], categories: [] }
        
        const last7Days = revenueData.byPeriod.slice(-7)
        
        return {
            series: [{
                name: 'Revenue',
                data: last7Days.map(day => day.revenue)
            }],
            categories: last7Days.map(day => day.period)
        }
    }, [revenueData])

    // Show loading state while session is loading or component is mounting
    if (status === 'loading' || !isMounted) {
        return (
            <Container>
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-48 mb-8"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-white rounded-lg shadow-md p-6">
                                <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
                                <div className="h-6 bg-gray-200 rounded w-16"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </Container>
        )
    }

    // Only show loading for access token if we're in the first few attempts
    if (status === 'authenticated' && !accessToken && tokenCheckAttempts < 2) {
        return (
            <Container>
                <div className="flex flex-col items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mb-4"></div>
                    <p className="text-gray-600">Initializing dashboard...</p>
                </div>
            </Container>
        )
    }
    
    // Show session error if token check failed
    if (sessionError) {
        return (
            <Container>
                <Alert type="danger" className="mb-6">
                    <div>
                        <p className="font-semibold">Session Error</p>
                        <p className="text-sm mt-1">{sessionError}</p>
                        <div className="flex gap-2 mt-3">
                            <Button
                                size="sm"
                                variant="solid"
                                onClick={() => {
                                    setTokenCheckAttempts(0)
                                    setSessionError(null)
                                    update()
                                }}
                            >
                                Retry
                            </Button>
                            <Button
                                size="sm"
                                variant="plain"
                                onClick={() => router.push('/sign-in')}
                            >
                                Sign In Again
                            </Button>
                        </div>
                    </div>
                </Alert>
            </Container>
        )
    }

    // Check for authentication issues
    if (status === 'authenticated' && !session) {
        return (
            <Container>
                <Alert type="danger">
                    Authentication error: No session data available. Please sign in again.
                </Alert>
            </Container>
        )
    }

    // Check for role authorization
    const userRole = session?.user?.role
    const hasAdminRole = userRole === 'ADMIN' || session?.user?.authority?.includes('ADMIN')
    
    if (status === 'authenticated' && !hasAdminRole) {
        return (
            <Container>
                <Alert type="danger">
                    Access Denied: You do not have permission to view this page. Required role: ADMIN, Your role: {userRole}
                </Alert>
            </Container>
        )
    }


    return (
        <Container>
            {/* Header */}
            <div className="mb-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                            Admin Dashboard
                        </h1>
                        <p className="text-gray-600">
                            Welcome back, {session?.user?.name || 'Administrator'}!
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            System-wide management and analytics
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="plain"
                            icon={<PiChartLineDuotone />}
                            onClick={() => router.push('/admin/analytics')}
                        >
                            View Analytics
                        </Button>
                        <Button
                            variant="solid"
                            icon={<PiPlusDuotone />}
                            onClick={() => router.push('/admin/outlets/new')}
                        >
                            Add Outlet
                        </Button>
                    </div>
                </div>
            </div>

            {/* Enhanced Error State with debugging info */}
            {error && (
                <Alert type="danger" className="mb-6">
                    <div>
                        <p className="font-semibold">Failed to load dashboard metrics</p>
                        <p className="text-sm mt-1">Error: {error.message || 'Unknown error occurred'}</p>
                        {process.env.NODE_ENV === 'development' && (
                            <details className="mt-2">
                                <summary className="cursor-pointer text-sm font-medium">Debug Information</summary>
                                <pre className="text-xs mt-1 p-2 bg-gray-100 rounded overflow-auto">
                                    {JSON.stringify({
                                        errorDetails: error,
                                        sessionStatus: status,
                                        hasAccessToken: !!accessToken,
                                        apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'Not set'
                                    }, null, 2)}
                                </pre>
                            </details>
                        )}
                        <div className="flex gap-2 mt-3">
                            <Button
                                size="sm"
                                variant="solid"
                                onClick={() => refreshMetrics()}
                            >
                                Retry Request
                            </Button>
                            <Button
                                size="sm"
                                variant="plain"
                                onClick={() => window.location.reload()}
                            >
                                Reload Page
                            </Button>
                        </div>
                    </div>
                </Alert>
            )}

            {/* Loading State for Metrics */}
            {isLoading && !metrics && (
                <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-4">
                    <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700"></div>
                        <p>Loading dashboard metrics...</p>
                    </div>
                </div>
            )}
            
            {/* Empty State */}
            {!isLoading && !error && !metrics && (
                <Alert type="info" className="mb-6">
                    <p>No metrics data available. This might be due to:</p>
                    <ul className="list-disc list-inside mt-2 text-sm">
                        <li>First time loading the dashboard</li>
                        <li>Backend service is starting up</li>
                        <li>Network connectivity issues</li>
                    </ul>
                    <Button
                        size="sm"
                        variant="solid"
                        className="mt-3"
                        onClick={() => refreshMetrics()}
                    >
                        Refresh Dashboard
                    </Button>
                </Alert>
            )}
            
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <MetricCard
                    title="Total Outlets"
                    value={metrics?.summary?.totalOutlets || 0}
                    subtitle="Active locations"
                    icon={<PiBuildingsDuotone className="text-blue-600" />}
                    iconBgColor="bg-blue-50"
                    loading={isLoading}
                    onClick={() => router.push('/admin/outlets')}
                />
                
                <MetricCard
                    title="Total Cylinders"
                    value={metrics?.summary?.totalCylinders?.toLocaleString() || '0'}
                    subtitle="System inventory"
                    icon={<PiCubeDuotone className="text-green-600" />}
                    iconBgColor="bg-green-50"
                    trend={{
                        value: 5.2,
                        type: 'increase'
                    }}
                    loading={isLoading}
                    onClick={() => router.push('/admin/cylinders')}
                />
                
                <MetricCard
                    title="Active Leases"
                    value={metrics?.summary?.activeLeases?.toLocaleString() || '0'}
                    subtitle="Currently leased"
                    icon={<PiPackageDuotone className="text-orange-600" />}
                    iconBgColor="bg-orange-50"
                    loading={isLoading}
                    onClick={() => router.push('/admin/leases')}
                />
                
                <MetricCard
                    title="Monthly Revenue"
                    value={formatCurrency(metrics?.summary?.revenue?.thisMonth || 0)}
                    subtitle="Revenue this month"
                    icon={<PiCurrencyCircleDollarDuotone className="text-purple-600" />}
                    iconBgColor="bg-purple-50"
                    trend={metrics?.summary?.revenue?.growth ? {
                        value: metrics.summary.revenue.growth,
                        type: metrics.summary.revenue.growth > 0 ? 'increase' : 'decrease'
                    } : undefined}
                    loading={isLoading}
                    onClick={() => router.push('/admin/analytics/revenue')}
                />
            </div>

            {/* Secondary Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <MetricCard
                    title="Total Customers"
                    value={metrics?.summary?.totalCustomers?.toLocaleString() || '0'}
                    subtitle="Registered customers"
                    icon={<PiUsersDuotone className="text-indigo-600" />}
                    iconBgColor="bg-indigo-50"
                    loading={isLoading}
                    onClick={() => router.push('/admin/analytics/customers')}
                />
                
                <MetricCard
                    title="Today's Refills"
                    value={metrics?.summary?.todayRefills || 0}
                    subtitle="Refills completed today"
                    icon={<PiGasPumpDuotone className="text-emerald-600" />}
                    iconBgColor="bg-emerald-50"
                    loading={isLoading}
                    onClick={() => router.push('/admin/refills')}
                />
                
                <MetricCard
                    title="Active Cylinders"
                    value={metrics?.summary?.activeCylinders?.toLocaleString() || '0'}
                    subtitle="Currently in use"
                    icon={<PiCubeDuotone className="text-cyan-600" />}
                    iconBgColor="bg-cyan-50"
                    loading={isLoading}
                />
                
                <MetricCard
                    title="Today's Revenue"
                    value={formatCurrency(metrics?.summary?.revenue?.today || 0)}
                    subtitle="Revenue generated today"
                    icon={<PiTrendUpDuotone className="text-green-600" />}
                    iconBgColor="bg-green-50"
                    loading={isLoading}
                />
            </div>

            {/* Charts and Activity Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Revenue Chart */}
                <div className="lg:col-span-2">
                    <AnalyticsChart
                        title="Revenue Trend"
                        subtitle="Daily revenue for the last 7 days"
                        type="area"
                        series={revenueChartData.series}
                        xAxis={revenueChartData.categories}
                        height={300}
                        loading={!revenueData}
                        customOptions={{
                            colors: ['#8b5cf6'],
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
                            }
                        }}
                    />
                </div>

                {/* Recent Activity */}
                <div className="lg:col-span-1">
                    <ActivityFeed
                        activities={recentActivities}
                        loading={isLoading}
                        maxItems={5}
                        onViewAll={() => router.push('/admin/activity')}
                    />
                </div>
            </div>

            {/* System Alerts */}
            {metrics?.alerts && metrics.alerts.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">System Alerts</h3>
                    <div className="space-y-3">
                        {metrics.alerts.map((alert, index) => (
                            <Alert
                                key={index}
                                type={alert.type}
                                showIcon
                            >
                                <div className="flex items-start gap-2">
                                    <PiWarningDuotone className="text-lg flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-medium">{alert.title}</p>
                                        <p className="text-sm mt-1">{alert.message}</p>
                                    </div>
                                </div>
                            </Alert>
                        ))}
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Operations */}
                <AdaptiveCard>
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Operations
                        </h3>
                        <div className="space-y-3">
                            <Link
                                href="/admin/cylinders"
                                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <PiCubeDuotone className="text-xl text-gray-600" />
                                    <div>
                                        <p className="font-medium text-gray-900">Cylinders</p>
                                        <p className="text-sm text-gray-500">Manage inventory</p>
                                    </div>
                                </div>
                                <PiArrowRightDuotone className="text-gray-400" />
                            </Link>
                            <Link
                                href="/admin/refills"
                                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <PiGasPumpDuotone className="text-xl text-gray-600" />
                                    <div>
                                        <p className="font-medium text-gray-900">Refills</p>
                                        <p className="text-sm text-gray-500">Track refill operations</p>
                                    </div>
                                </div>
                                <PiArrowRightDuotone className="text-gray-400" />
                            </Link>
                            <Link
                                href="/admin/transfers"
                                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <PiArrowsLeftRightDuotone className="text-xl text-gray-600" />
                                    <div>
                                        <p className="font-medium text-gray-900">Transfers</p>
                                        <p className="text-sm text-gray-500">Inter-outlet transfers</p>
                                    </div>
                                </div>
                                <PiArrowRightDuotone className="text-gray-400" />
                            </Link>
                        </div>
                    </div>
                </AdaptiveCard>

                {/* Management */}
                <AdaptiveCard>
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Management
                        </h3>
                        <div className="space-y-3">
                            <Link
                                href="/admin/outlets"
                                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <PiBuildingsDuotone className="text-xl text-gray-600" />
                                    <div>
                                        <p className="font-medium text-gray-900">Outlets</p>
                                        <p className="text-sm text-gray-500">Manage locations</p>
                                    </div>
                                </div>
                                <Badge content={metrics?.summary?.totalOutlets || 0} />
                            </Link>
                            <Link
                                href="/admin/users"
                                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <PiUsersDuotone className="text-xl text-gray-600" />
                                    <div>
                                        <p className="font-medium text-gray-900">Users</p>
                                        <p className="text-sm text-gray-500">User management</p>
                                    </div>
                                </div>
                                <PiArrowRightDuotone className="text-gray-400" />
                            </Link>
                            <Link
                                href="/admin/customers"
                                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <PiUsersDuotone className="text-xl text-gray-600" />
                                    <div>
                                        <p className="font-medium text-gray-900">Customers</p>
                                        <p className="text-sm text-gray-500">Customer records</p>
                                    </div>
                                </div>
                                <Badge content={metrics?.summary?.totalCustomers || 0} />
                            </Link>
                        </div>
                    </div>
                </AdaptiveCard>

                {/* Analytics & Settings */}
                <AdaptiveCard>
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Analytics & Settings
                        </h3>
                        <div className="space-y-3">
                            <Link
                                href="/admin/analytics"
                                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <PiChartLineDuotone className="text-xl text-gray-600" />
                                    <div>
                                        <p className="font-medium text-gray-900">Analytics</p>
                                        <p className="text-sm text-gray-500">View detailed reports</p>
                                    </div>
                                </div>
                                <PiArrowRightDuotone className="text-gray-400" />
                            </Link>
                            <Link
                                href="/admin/settings"
                                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <PiGearDuotone className="text-xl text-gray-600" />
                                    <div>
                                        <p className="font-medium text-gray-900">Settings</p>
                                        <p className="text-sm text-gray-500">System configuration</p>
                                    </div>
                                </div>
                                <PiArrowRightDuotone className="text-gray-400" />
                            </Link>
                        </div>
                    </div>
                </AdaptiveCard>
            </div>
        </Container>
    )
}