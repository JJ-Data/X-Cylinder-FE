import AxiosBase from '@/services/axios/AxiosBase'

const apiClient = AxiosBase
import type { LeaseRecord, LeaseStatus } from '@/types/cylinder'
import type { PaginatedResponse, QueryParams } from '@/types/common'

export interface LeaseFilters extends QueryParams {
  customerId?: number
  cylinderId?: number
  outletId?: number
  staffId?: number
  status?: LeaseStatus
  leaseStatus?: string  // Backend uses leaseStatus column
  fromDate?: string
  toDate?: string
  page?: number
  limit?: number
  pageSize?: number  // For backward compatibility
}

export interface CreateLeaseDto {
  customerId: number
  cylinderId: number
  depositAmount: number
  leaseAmount: number
  paymentMethod?: 'cash' | 'pos' | 'bank_transfer'
  notes?: string
}

export interface ReturnLeaseDto {
  returnDate?: string
  notes?: string
  condition?: 'good' | 'damaged' | 'needs_maintenance'
}

export interface LeaseStatistics {
  totalLeases: number
  activeLeases: number
  returnedLeases: number
  overdueLeases: number
  totalRevenue: number
  averageLeaseAmount: number
  averageLeaseDuration: number
}

class LeaseService {
  private baseURL = '/leases'

  // Get all leases with filters
  async getLeases(filters?: LeaseFilters): Promise<PaginatedResponse<LeaseRecord>> {
    let params = ''
    
    if (filters) {
      const searchParams = new URLSearchParams()
      
      // Convert pageSize to limit for API compatibility
      const processedFilters = { ...filters }
      if (processedFilters.pageSize && !processedFilters.limit) {
        processedFilters.limit = processedFilters.pageSize
        delete processedFilters.pageSize
      }
      
      // Only add defined values to the query parameters
      Object.entries(processedFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value))
        }
      })
      
      params = searchParams.toString()
    }
    
    const response = await apiClient.get(`${this.baseURL}${params ? `?${params}` : ''}`)
    
    // Transform the API response to match PaginatedResponse interface
    const apiData = response.data.data
    return {
      data: apiData.leases || [],
      meta: {
        page: apiData.page || 1,
        limit: apiData.limit || filters?.limit || filters?.pageSize || 20,
        total: apiData.total || 0,
        totalPages: apiData.totalPages || 1
      }
    }
  }

  // Get lease by ID
  async getLeaseById(id: number): Promise<LeaseRecord> {
    const response = await apiClient.get(`${this.baseURL}/${id}`)
    return response.data.data
  }

  // Create new lease
  async createLease(data: CreateLeaseDto): Promise<LeaseRecord> {
    const response = await apiClient.post(this.baseURL, data)
    return response.data.data
  }

  // Process lease return
  async returnLease(id: number, data: ReturnLeaseDto): Promise<LeaseRecord> {
    const response = await apiClient.post(`${this.baseURL}/${id}/return`, data)
    return response.data.data
  }

  // Get customer's active leases
  async getCustomerActiveLeases(customerId: number): Promise<LeaseRecord[]> {
    const response = await apiClient.get(`${this.baseURL}/customer/${customerId}/active`)
    return response.data.data
  }

  // Get customer's lease history
  async getCustomerLeaseHistory(customerId: number): Promise<LeaseRecord[]> {
    const response = await apiClient.get(`${this.baseURL}/customer/${customerId}/history`)
    return response.data.data
  }

  // Get outlet lease statistics
  async getOutletStatistics(outletId: number, timeRange?: {
    startDate: string
    endDate: string
  }): Promise<LeaseStatistics> {
    let params = ''
    
    if (timeRange) {
      const searchParams = new URLSearchParams()
      
      // Only add defined values to the query parameters
      Object.entries(timeRange).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value))
        }
      })
      
      params = searchParams.toString()
    }
    
    const response = await apiClient.get(
      `${this.baseURL}/outlet/${outletId}/statistics${params ? `?${params}` : ''}`
    )
    return response.data.data
  }

  // Get overdue leases
  async getOverdueLeases(outletId?: number): Promise<LeaseRecord[]> {
    const params = outletId ? `?outletId=${outletId}` : ''
    const response = await apiClient.get(`${this.baseURL}/overdue${params}`)
    return response.data.data
  }

  // Check lease eligibility for customer
  async checkLeaseEligibility(customerId: number): Promise<{
    eligible: boolean
    reason?: string
    activeLeases?: number
    maxAllowed?: number
  }> {
    const response = await apiClient.get(`${this.baseURL}/customer/${customerId}/eligibility`)
    return response.data.data
  }
}

export const leaseService = new LeaseService()
export default leaseService