import AxiosBase from '@/services/axios/AxiosBase'

const apiClient = AxiosBase
import type { Cylinder, CylinderStatus, CylinderType } from '@/types/cylinder'
import type { PaginatedResponse, QueryParams } from '@/types/common'

export interface CylinderFilters extends QueryParams {
  status?: CylinderStatus | string  // Allow string for API compatibility
  type?: CylinderType | string      // Allow string for API compatibility
  outletId?: number
  code?: string
  isActive?: boolean
}

export interface CreateCylinderDto {
  code: string
  type: CylinderType
  capacity: number
  manufactureDate: string
  lastInspectionDate?: string
  outletId: number
}

export interface UpdateCylinderDto {
  status?: CylinderStatus
  outletId?: number
  lastInspectionDate?: string
  isActive?: boolean
}

export interface BulkQRCodeDto {
  cylinderIds: number[]
  format?: 'png' | 'svg' | 'dataUrl'
}

class CylinderService {
  private baseURL = '/cylinders'

  // Get all cylinders with filters
  async getCylinders(filters?: CylinderFilters): Promise<PaginatedResponse<Cylinder>> {
    let params = ''
    
    if (filters) {
      const searchParams = new URLSearchParams()
      
      // Only add defined values to the query parameters
      Object.entries(filters).forEach(([key, value]) => {
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
      data: apiData.cylinders || [],
      meta: {
        page: apiData.page || 1,
        limit: filters?.limit || 20,
        total: apiData.total || 0,
        totalPages: apiData.totalPages || 1
      }
    }
  }

  // Get cylinder by ID
  async getCylinderById(id: number): Promise<Cylinder> {
    const response = await apiClient.get(`${this.baseURL}/${id}`)
    return response.data.data
  }

  // Get cylinder by QR code
  async getCylinderByCode(code: string): Promise<Cylinder> {
    const response = await apiClient.get(`${this.baseURL}/code/${code}`)
    return response.data.data
  }

  // Create new cylinder
  async createCylinder(data: CreateCylinderDto): Promise<Cylinder> {
    const response = await apiClient.post(this.baseURL, data)
    return response.data.data
  }

  // Update cylinder
  async updateCylinder(id: number, data: UpdateCylinderDto): Promise<Cylinder> {
    const response = await apiClient.put(`${this.baseURL}/${id}`, data)
    return response.data.data
  }

  // Delete cylinder
  async deleteCylinder(id: number): Promise<void> {
    await apiClient.delete(`${this.baseURL}/${id}`)
  }

  // Generate QR code for cylinder
  async generateQRCode(
    id: number, 
    format: 'png' | 'svg' | 'dataUrl' = 'png'
  ): Promise<string | Blob> {
    const response = await apiClient.get(
      `${this.baseURL}/${id}/qr-code?format=${format}`,
      format === 'png' ? { responseType: 'blob' } : {}
    )
    return format === 'png' ? response.data : response.data.data
  }

  // Generate bulk QR codes
  async generateBulkQRCodes(data: BulkQRCodeDto): Promise<any> {
    const response = await apiClient.post(`${this.baseURL}/qr-codes/bulk`, data)
    return response.data.data
  }

  // Transfer cylinder to another outlet
  async transferCylinder(id: number, targetOutletId: number): Promise<Cylinder> {
    const response = await apiClient.post(`${this.baseURL}/${id}/transfer`, {
      targetOutletId
    })
    return response.data.data
  }

  // Get cylinder history
  async getCylinderHistory(id: number): Promise<any[]> {
    const response = await apiClient.get(`${this.baseURL}/${id}/history`)
    return response.data.data
  }
}

export const cylinderService = new CylinderService()
export default cylinderService