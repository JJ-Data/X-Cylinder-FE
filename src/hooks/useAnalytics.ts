import useSWR from 'swr'
import { useSession, getSession } from 'next-auth/react'
import { analyticsService, type TimeRange, type AnalyticsFilters } from '@/services/api/analytics.service'

// Analytics Overview Hook
export const useAnalyticsOverview = () => {
  const { data: session, status } = useSession()
  
  return useSWR(
    status === 'authenticated' && session ? 'analytics-overview' : null, 
    () => analyticsService.getAnalyticsOverview(), 
    {
      revalidateOnFocus: false,
      refreshInterval: 60000, // Refresh every minute
    }
  )
}

// Dashboard Metrics Hook
export const useDashboardMetrics = (filters?: TimeRange) => {
  const { data: session, status } = useSession()
  
  // Only create key when authenticated
  const key = status === 'authenticated' && session
    ? filters 
      ? ['dashboard-metrics', filters.startDate, filters.endDate] 
      : 'dashboard-metrics'
    : null
  
  return useSWR(key, () => analyticsService.getDashboardMetrics(filters), {
    revalidateOnFocus: false,
    refreshInterval: 60000, // Refresh every minute
    shouldRetryOnError: true,
    errorRetryCount: 3,
    errorRetryInterval: 1000, // Retry after 1 second if auth fails
    onError: (error) => {
      console.error('[useDashboardMetrics] Error:', error)
    },
    onSuccess: (data) => {
      console.log('[useDashboardMetrics] Success:', data ? 'Data received' : 'No data')
    }
  })
}

// Outlet Performance Hook
export const useOutletPerformance = (filters?: AnalyticsFilters) => {
  const { data: session, status } = useSession()
  
  const key = status === 'authenticated' && session
    ? filters
      ? ['outlet-performance', JSON.stringify(filters)]
      : 'outlet-performance'
    : null
  
  return useSWR(key, () => analyticsService.getOutletPerformance(filters), {
    revalidateOnFocus: false,
  })
}

// Cylinder Utilization Hook
export const useCylinderUtilization = (filters?: AnalyticsFilters) => {
  const { data: session, status } = useSession()
  
  const key = status === 'authenticated' && session
    ? filters
      ? ['cylinder-utilization', JSON.stringify(filters)]
      : 'cylinder-utilization'
    : null
  
  return useSWR(key, () => analyticsService.getCylinderUtilization(filters), {
    revalidateOnFocus: false,
  })
}

// Revenue Analytics Hook
export const useRevenueAnalytics = (filters?: TimeRange) => {
  const { data: session, status } = useSession()
  
  // Revenue analytics requires date parameters, so validate them
  const validFilters = filters && filters.startDate && filters.endDate ? filters : null
  
  const key = status === 'authenticated' && session && validFilters
    ? ['revenue-analytics', validFilters.startDate, validFilters.endDate, validFilters.period]
    : null // Don't fetch without valid dates and auth
  
  return useSWR(
    key, 
    () => validFilters ? analyticsService.getRevenueAnalytics(validFilters) : null,
    {
      revalidateOnFocus: false,
      shouldRetryOnError: true,
      errorRetryCount: 3,
      errorRetryInterval: 1000,
      onError: (error) => {
        console.error('[useRevenueAnalytics] Error:', error)
      }
    }
  )
}

// Customer Analytics Hook
export const useCustomerAnalytics = (filters?: TimeRange) => {
  const { data: session, status } = useSession()
  
  const key = status === 'authenticated' && session
    ? filters
      ? ['customer-analytics', filters.startDate, filters.endDate]
      : 'customer-analytics'
    : null
  
  return useSWR(key, () => analyticsService.getCustomerAnalytics(filters), {
    revalidateOnFocus: false,
  })
}

// All Operators Hook
export const useAllOperators = (filters?: TimeRange) => {
  const { data: session, status } = useSession()
  
  const key = status === 'authenticated' && session
    ? filters
      ? ['all-operators', filters.startDate, filters.endDate]
      : 'all-operators'
    : null
  
  return useSWR(key, () => analyticsService.getAllOperators(filters), {
    revalidateOnFocus: false,
  })
}

// Operator Performance Hook
export const useOperatorPerformance = (operatorId?: number, filters?: TimeRange) => {
  const { data: session, status } = useSession()
  
  const key = status === 'authenticated' && session && operatorId
    ? ['operator-performance', operatorId, filters?.startDate, filters?.endDate]
    : null
  
  return useSWR(
    key,
    () => analyticsService.getOperatorPerformance(operatorId, filters),
    {
      revalidateOnFocus: false,
    }
  )
}