import AxiosBase from '@/services/axios/AxiosBase'

const apiClient = AxiosBase
import type { PaginatedResponse, QueryParams } from '@/types/common'

export interface RefillRecord {
    id: number
    cylinderId: number
    cylinder?: {
        id: number
        cylinderCode: string
        type: string
        qrCode: string
    }
    operatorId: number
    operator?: {
        id: number
        email: string
        firstName: string
        lastName: string
    }
    outletId: number
    outlet?: {
        id: number
        name: string
        location: string
        contactPhone: string
    }
    refillDate: string
    volumeAdded: number
    preRefillVolume: string
    postRefillVolume: string
    refillCost: string
    paymentMethod?: 'cash' | 'pos' | 'bank_transfer'
    paymentReference?: string
    notes?: string
    batchNumber: string
    createdAt: string
    updatedAt: string
}

export enum PaymentMethod {
    CASH = 'CASH',
    CARD = 'CARD',
    TRANSFER = 'TRANSFER',
    MOBILE_MONEY = 'MOBILE_MONEY',
}

export interface RefillFilters extends QueryParams {
    cylinderId?: number
    operatorId?: number
    outletId?: number
    fromDate?: string
    toDate?: string
    paymentMethod?: PaymentMethod
    pageSize?: number // For compatibility with DataTable
}

export interface CreateRefillDto {
    cylinderId: number
    preRefillVolume: number
    postRefillVolume: number
    refillCost?: number
    paymentMethod?: 'cash' | 'pos' | 'bank_transfer'
    paymentReference?: string
    notes?: string
    batchNumber?: string
}

export interface BulkRefillDto {
    batchNumber: string
    refills: Array<{
        cylinderCode: string
        preRefillVolume: number
        postRefillVolume: number
        refillCost?: number
    }>
    notes?: string
}

export interface RefillStatistics {
    totalRefills: number
    totalVolume: number
    totalRevenue: number
    averageVolume: number
    averageCost: number
    dailyAverage: number
    topCylinders: {
        cylinderId: number
        cylinderCode: string
        refillCount: number
        totalVolume: number
    }[]
}

class RefillService {
    private baseURL = '/refills'

    // Get all refills with filters - uses outlet-based endpoint
    async getRefills(
        filters?: RefillFilters,
    ): Promise<PaginatedResponse<RefillRecord>> {
        // For now, we'll use outlet 1 as default. This should be updated to use user's outlet
        const outletId = filters?.outletId || 1

        let params = ''

        if (filters) {
            const searchParams = new URLSearchParams()

            // Only add defined values to the query parameters (excluding outletId since it's in the path)
            Object.entries(filters).forEach(([key, value]) => {
                if (
                    key !== 'outletId' &&
                    value !== undefined &&
                    value !== null &&
                    value !== ''
                ) {
                    // Convert pageSize to limit for API compatibility
                    if (key === 'pageSize') {
                        searchParams.append('limit', String(value))
                    } else {
                        searchParams.append(key, String(value))
                    }
                }
            })

            params = searchParams.toString()
        }

        const response = await apiClient.get(
            `${this.baseURL}/outlet/${outletId}${params ? `?${params}` : ''}`,
        )

        // Transform the API response to match PaginatedResponse interface
        const apiData = response.data.data
        return {
            data: apiData.refills || apiData || [],
            meta: {
                page: apiData.page || filters?.page || 1,
                limit:
                    apiData.limit || filters?.limit || filters?.pageSize || 20,
                total: apiData.total || 0,
                totalPages: apiData.totalPages || 1,
            },
        }
    }

    // Get refill by ID
    async getRefillById(id: number): Promise<RefillRecord> {
        const response = await apiClient.get(`${this.baseURL}/${id}`)
        return response.data.data
    }

    // Create new refill
    async createRefill(data: CreateRefillDto): Promise<RefillRecord> {
        const response = await apiClient.post(this.baseURL, data)
        return response.data.data
    }

    // Create bulk refills
    async createBulkRefills(data: BulkRefillDto): Promise<{
        successful: number
        failed: Array<{ cylinderCode: string; error: string }>
    }> {
        const response = await apiClient.post(`${this.baseURL}/bulk`, data)
        return response.data.data
    }

    // Get cylinder refill history
    async getCylinderRefillHistory(
        cylinderId: number,
    ): Promise<RefillRecord[]> {
        const response = await apiClient.get(
            `${this.baseURL}/cylinder/${cylinderId}`,
        )
        // Extract refills array from paginated response
        return response.data.data.refills || []
    }

    // Get operator refill statistics
    async getOperatorStatistics(
        operatorId: number,
        timeRange?: { startDate: string; endDate: string },
    ): Promise<RefillStatistics> {
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
            `${this.baseURL}/operator/${operatorId}/statistics${params ? `?${params}` : ''}`,
        )
        return response.data.data
    }

    // Get outlet refill statistics
    async getOutletStatistics(
        outletId: number,
        timeRange?: { startDate: string; endDate: string },
    ): Promise<RefillStatistics> {
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
            `${this.baseURL}/outlet/${outletId}/statistics${params ? `?${params}` : ''}`,
        )
        return response.data.data
    }

    // Validate cylinder for refill
    async validateCylinderForRefill(cylinderCode: string): Promise<{
        valid: boolean
        cylinderId?: number
        reason?: string
        lastRefillDate?: string
    }> {
        const response = await apiClient.post(`${this.baseURL}/validate`, {
            cylinderCode,
        })
        return response.data.data
    }
}

export const refillService = new RefillService()
export default refillService
