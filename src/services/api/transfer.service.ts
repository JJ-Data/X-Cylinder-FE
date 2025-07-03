import { apiClient } from '../api-client'
import type { 
  Transfer, 
  TransferFormData, 
  TransferFilters, 
  TransferStatistics, 
  TransferListResponse,
  TransferExportParams 
} from '@/types/transfer'

export const transferService = {
  // Get transfer history with filters
  getTransferHistory: async (filters: TransferFilters): Promise<TransferListResponse> => {
    const response = await apiClient.get('/transfers', { params: filters })
    return response.data.data
  },

  // Get single transfer details
  getTransferById: async (id: number): Promise<Transfer> => {
    const response = await apiClient.get(`/transfers/${id}`)
    return response.data.data
  },

  // Get transfer statistics
  getTransferStatistics: async (filters?: {
    fromDate?: string
    toDate?: string
    outletId?: number
  }): Promise<TransferStatistics> => {
    const response = await apiClient.get('/transfers/statistics', { params: filters })
    return response.data.data
  },

  // Create new transfer
  createTransfer: async (data: TransferFormData): Promise<Transfer> => {
    const response = await apiClient.post('/transfers', data)
    return response.data.data
  },

  // Accept transfer
  acceptTransfer: async (id: number, notes?: string): Promise<Transfer> => {
    const response = await apiClient.put(`/transfers/${id}/accept`, { notes })
    return response.data.data
  },

  // Reject transfer
  rejectTransfer: async (id: number, rejectionReason: string): Promise<Transfer> => {
    const response = await apiClient.put(`/transfers/${id}/reject`, { rejectionReason })
    return response.data.data
  },

  // Export transfers
  exportTransfers: async (params: TransferExportParams): Promise<Blob> => {
    const response = await apiClient.get('/transfers/export', {
      params,
      responseType: 'blob'
    })
    return response.data
  },

  // Helper method to trigger download
  downloadTransfers: (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  },

  // Legacy methods for backward compatibility
  getTransfer: async (id: number) => {
    return transferService.getTransferById(id)
  },

  getTransfers: async (params?: {
    page?: number
    pageSize?: number
    outletId?: number
  }) => {
    const filters: TransferFilters = {
      page: params?.page,
      limit: params?.pageSize,
      fromOutletId: params?.outletId
    }
    return transferService.getTransferHistory(filters)
  }
}