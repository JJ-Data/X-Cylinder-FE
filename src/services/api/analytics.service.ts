import AxiosBase from '@/services/axios/AxiosBase'

const apiClient = AxiosBase
import type { 
  DashboardMetrics, 
  OutletPerformance, 
  CylinderUtilization,
  RevenueAnalytics,
  CustomerAnalytics,
  OperatorPerformance
} from '@/types/analytics'

export interface TimeRange {
  startDate: string
  endDate: string
  period?: 'daily' | 'weekly' | 'monthly' | 'yearly'
}

export interface AnalyticsFilters extends TimeRange {
  outletId?: number
  cylinderType?: string
  operatorId?: number
}

class AnalyticsService {
  private baseURL = '/analytics'

  // Analytics Overview
  async getAnalyticsOverview(): Promise<any> {
    const response = await apiClient.get(`${this.baseURL}/overview`)
    return response.data.data
  }

  // Dashboard Metrics
  async getDashboardMetrics(filters?: TimeRange): Promise<DashboardMetrics> {
    let params = ''
    
    if (filters) {
      const searchParams = new URLSearchParams()
      
      // Map frontend parameter names to backend parameter names
      if (filters.startDate) {
        searchParams.append('dateFrom', filters.startDate)
      }
      if (filters.endDate) {
        searchParams.append('dateTo', filters.endDate)
      }
      
      params = searchParams.toString()
    }
    
    const response = await apiClient.get(`${this.baseURL}/dashboard${params ? `?${params}` : ''}`)
    return response.data.data
  }

  // Outlet Performance
  async getOutletPerformance(filters?: AnalyticsFilters): Promise<OutletPerformance[]> {
    let params = ''
    
    if (filters) {
      const searchParams = new URLSearchParams()
      
      // Map frontend parameter names to backend parameter names
      if (filters.startDate) {
        searchParams.append('dateFrom', filters.startDate)
      }
      if (filters.endDate) {
        searchParams.append('dateTo', filters.endDate)
      }
      if (filters.outletId) {
        searchParams.append('outletId', String(filters.outletId))
      }
      
      params = searchParams.toString()
    }
    
    const response = await apiClient.get(`${this.baseURL}/outlets${params ? `?${params}` : ''}`)
    return response.data.data
  }

  // Cylinder Utilization
  async getCylinderUtilization(filters?: AnalyticsFilters): Promise<CylinderUtilization> {
    let params = ''
    
    if (filters) {
      const searchParams = new URLSearchParams()
      
      // Map frontend parameter names to backend parameter names
      if (filters.startDate) {
        searchParams.append('dateFrom', filters.startDate)
      }
      if (filters.endDate) {
        searchParams.append('dateTo', filters.endDate)
      }
      if (filters.cylinderType) {
        searchParams.append('cylinderType', filters.cylinderType)
      }
      
      params = searchParams.toString()
    }
    
    const response = await apiClient.get(`${this.baseURL}/cylinders${params ? `?${params}` : ''}`)
    return response.data.data
  }

  // Revenue Analytics
  async getRevenueAnalytics(filters?: TimeRange): Promise<RevenueAnalytics> {
    const searchParams = new URLSearchParams()
    
    // Revenue analytics always requires date parameters
    if (filters) {
      // Map frontend parameter names to backend parameter names
      // Skip empty strings but ensure dates are always provided for revenue
      if (filters.startDate && filters.startDate.trim() !== '') {
        searchParams.append('dateFrom', filters.startDate)
      }
      if (filters.endDate && filters.endDate.trim() !== '') {
        searchParams.append('dateTo', filters.endDate)
      }
      if (filters.period) {
        searchParams.append('period', filters.period)
      } else {
        // Default to daily
        searchParams.append('period', 'daily')
      }
    }
    
    const params = searchParams.toString()
    const response = await apiClient.get(`${this.baseURL}/revenue${params ? `?${params}` : ''}`)
    return response.data.data
  }

  // Customer Analytics
  async getCustomerAnalytics(filters?: TimeRange): Promise<CustomerAnalytics> {
    let params = ''
    
    if (filters) {
      const searchParams = new URLSearchParams()
      
      // Map frontend parameter names to backend parameter names
      if (filters.startDate) {
        searchParams.append('dateFrom', filters.startDate)
      }
      if (filters.endDate) {
        searchParams.append('dateTo', filters.endDate)
      }
      
      params = searchParams.toString()
    }
    
    const response = await apiClient.get(`${this.baseURL}/customers${params ? `?${params}` : ''}`)
    return response.data.data
  }

  // All Operators
  async getAllOperators(filters?: TimeRange): Promise<any> {
    let params = ''
    
    if (filters) {
      const searchParams = new URLSearchParams()
      
      // Map frontend parameter names to backend parameter names
      if (filters.startDate) {
        searchParams.append('dateFrom', filters.startDate)
      }
      if (filters.endDate) {
        searchParams.append('dateTo', filters.endDate)
      }
      
      params = searchParams.toString()
    }
    
    const response = await apiClient.get(`${this.baseURL}/operators${params ? `?${params}` : ''}`)
    return response.data.data
  }

  // Operator Performance
  async getOperatorPerformance(
    operatorId?: number,
    filters?: TimeRange
  ): Promise<OperatorPerformance> {
    let params = ''
    
    if (filters) {
      const searchParams = new URLSearchParams()
      
      // Map frontend parameter names to backend parameter names
      if (filters.startDate) {
        searchParams.append('dateFrom', filters.startDate)
      }
      if (filters.endDate) {
        searchParams.append('dateTo', filters.endDate)
      }
      
      params = searchParams.toString()
    }
    
    const url = operatorId 
      ? `${this.baseURL}/operators/${operatorId}${params ? `?${params}` : ''}`
      : `${this.baseURL}/operators${params ? `?${params}` : ''}`
    
    const response = await apiClient.get(url)
    return response.data.data
  }
}

export const analyticsService = new AnalyticsService()
export default analyticsService