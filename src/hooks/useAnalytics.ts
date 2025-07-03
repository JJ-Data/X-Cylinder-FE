import useSWR from 'swr'
import { analyticsService, type TimeRange, type AnalyticsFilters } from '@/services/api/analytics.service'

// Analytics Overview Hook
export const useAnalyticsOverview = () => {
  return useSWR('analytics-overview', () => analyticsService.getAnalyticsOverview(), {
    revalidateOnFocus: false,
    refreshInterval: 60000, // Refresh every minute
  })
}

// Dashboard Metrics Hook
export const useDashboardMetrics = (filters?: TimeRange) => {
  const key = filters 
    ? ['dashboard-metrics', filters.startDate, filters.endDate] 
    : 'dashboard-metrics'
  
  return useSWR(key, () => analyticsService.getDashboardMetrics(filters), {
    revalidateOnFocus: false,
    refreshInterval: 60000, // Refresh every minute
  })
}

// Outlet Performance Hook
export const useOutletPerformance = (filters?: AnalyticsFilters) => {
  const key = filters
    ? ['outlet-performance', JSON.stringify(filters)]
    : 'outlet-performance'
  
  return useSWR(key, () => analyticsService.getOutletPerformance(filters), {
    revalidateOnFocus: false,
  })
}

// Cylinder Utilization Hook
export const useCylinderUtilization = (filters?: AnalyticsFilters) => {
  const key = filters
    ? ['cylinder-utilization', JSON.stringify(filters)]
    : 'cylinder-utilization'
  
  return useSWR(key, () => analyticsService.getCylinderUtilization(filters), {
    revalidateOnFocus: false,
  })
}

// Revenue Analytics Hook
export const useRevenueAnalytics = (filters?: TimeRange) => {
  // Revenue analytics requires date parameters, so validate them
  const validFilters = filters && filters.startDate && filters.endDate ? filters : null
  
  const key = validFilters
    ? ['revenue-analytics', validFilters.startDate, validFilters.endDate, validFilters.period]
    : null // Don't fetch without valid dates
  
  return useSWR(
    key, 
    () => validFilters ? analyticsService.getRevenueAnalytics(validFilters) : null,
    {
      revalidateOnFocus: false,
    }
  )
}

// Customer Analytics Hook
export const useCustomerAnalytics = (filters?: TimeRange) => {
  const key = filters
    ? ['customer-analytics', filters.startDate, filters.endDate]
    : 'customer-analytics'
  
  return useSWR(key, () => analyticsService.getCustomerAnalytics(filters), {
    revalidateOnFocus: false,
  })
}

// All Operators Hook
export const useAllOperators = (filters?: TimeRange) => {
  const key = filters
    ? ['all-operators', filters.startDate, filters.endDate]
    : 'all-operators'
  
  return useSWR(key, () => analyticsService.getAllOperators(filters), {
    revalidateOnFocus: false,
  })
}

// Operator Performance Hook
export const useOperatorPerformance = (operatorId?: number, filters?: TimeRange) => {
  const key = operatorId
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