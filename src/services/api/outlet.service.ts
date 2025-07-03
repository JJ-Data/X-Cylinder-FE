import { apiClient } from '../api-client'
import type {
  Outlet,
  OutletCreationData,
  OutletUpdateData,
  OutletInventory,
  OutletListResponse,
  OutletFilters,
} from '@/types/outlet'

// API response wrapper type
interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

class OutletService {
  private basePath = '/outlets'

  /**
   * Get all outlets with optional filters and pagination
   */
  async getAllOutlets(filters?: OutletFilters): Promise<OutletListResponse> {
    const params = new URLSearchParams()
    
    if (filters) {
      // Only add defined values to the query parameters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value))
        }
      })
    }

    const queryString = params.toString()
    const url = queryString ? `${this.basePath}?${queryString}` : this.basePath
    
    const response = await apiClient.get<ApiResponse<OutletListResponse>>(url)
    return response.data.data
  }

  /**
   * Get a single outlet by ID
   */
  async getOutletById(id: number): Promise<Outlet> {
    const response = await apiClient.get<ApiResponse<Outlet>>(`${this.basePath}/${id}`)
    return response.data.data
  }

  /**
   * Create a new outlet
   */
  async createOutlet(data: OutletCreationData): Promise<Outlet> {
    const response = await apiClient.post<ApiResponse<Outlet>>(this.basePath, data)
    return response.data.data
  }

  /**
   * Update an existing outlet
   */
  async updateOutlet(id: number, data: OutletUpdateData): Promise<Outlet> {
    const response = await apiClient.put<ApiResponse<Outlet>>(`${this.basePath}/${id}`, data)
    return response.data.data
  }

  /**
   * Deactivate an outlet
   */
  async deactivateOutlet(id: number): Promise<void> {
    await apiClient.delete(`${this.basePath}/${id}`)
  }

  /**
   * Get outlet inventory statistics
   */
  async getOutletInventory(id: number): Promise<OutletInventory> {
    const response = await apiClient.get<ApiResponse<OutletInventory>>(
      `${this.basePath}/${id}/inventory`
    )
    return response.data.data
  }

  /**
   * Get outlets for dropdown selection (simplified list)
   */
  async getOutletsForSelect(): Promise<Array<{ value: number; label: string }>> {
    const { outlets } = await this.getAllOutlets({ status: 'active' })
    return outlets.map(outlet => ({
      value: outlet.id,
      label: outlet.name,
    }))
  }
}

export const outletService = new OutletService()