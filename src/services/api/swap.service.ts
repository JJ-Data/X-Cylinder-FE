import { apiClient } from '../api-client';
import type {
  SwapRecord,
  CreateSwapDto,
  SwapFilters,
  SwapStatistics,
  SwapReceiptData,
  SwapsResponse,
} from '@/types/swap';

export const swapService = {
  /**
   * Create a new cylinder swap
   */
  async createSwap(data: CreateSwapDto) {
    const response = await apiClient.post('/swaps', data);
    return response.data.data;
  },

  /**
   * Get paginated list of swaps with filters
   */
  async getSwaps(filters?: SwapFilters) {
    const params = new URLSearchParams();
    
    if (filters?.leaseId) params.append('leaseId', filters.leaseId.toString());
    if (filters?.customerId) params.append('customerId', filters.customerId.toString());
    if (filters?.staffId) params.append('staffId', filters.staffId.toString());
    if (filters?.oldCylinderId) params.append('oldCylinderId', filters.oldCylinderId.toString());
    if (filters?.newCylinderId) params.append('newCylinderId', filters.newCylinderId.toString());
    if (filters?.condition) params.append('condition', filters.condition);
    if (filters?.outletId) params.append('outletId', filters.outletId.toString());
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.search) params.append('search', filters.search);

    const queryString = params.toString();
    const url = queryString ? `/swaps?${queryString}` : '/swaps';
    
    const response = await apiClient.get(url);
    return response.data.data;
  },

  /**
   * Get a specific swap by ID
   */
  async getSwapById(id: number) {
    const response = await apiClient.get(`/swaps/${id}`);
    return response.data.data;
  },

  /**
   * Get swap receipt data
   */
  async getSwapReceipt(id: number) {
    const response = await apiClient.get(`/swaps/${id}/receipt`);
    return response.data.data;
  },

  /**
   * Mark swap receipt as printed
   */
  async markReceiptPrinted(id: number) {
    const response = await apiClient.patch(`/swaps/${id}/receipt-printed`);
    return response.data.data;
  },

  /**
   * Get swap statistics
   */
  async getSwapStatistics(filters?: {
    dateFrom?: string;
    dateTo?: string;
    outletId?: number;
    staffId?: number;
  }) {
    const params = new URLSearchParams();
    
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);
    if (filters?.outletId) params.append('outletId', filters.outletId.toString());
    if (filters?.staffId) params.append('staffId', filters.staffId.toString());

    const queryString = params.toString();
    const url = queryString ? `/swaps/statistics?${queryString}` : '/swaps/statistics';
    
    const response = await apiClient.get(url);
    return response.data.data;
  },

  /**
   * Find cylinder by lease ID, cylinder code, or QR code
   */
  async findCylinder(identifier: {
    leaseId?: number;
    cylinderCode?: string;
    qrCode?: string;
  }) {
    const params = new URLSearchParams();
    
    if (identifier.leaseId) params.append('leaseId', identifier.leaseId.toString());
    if (identifier.cylinderCode) params.append('cylinderCode', identifier.cylinderCode);
    if (identifier.qrCode) params.append('qrCode', identifier.qrCode);

    const queryString = params.toString();
    
    const response = await apiClient.get(`/swaps/find-cylinder?${queryString}`);
    return response.data.data;
  },

  /**
   * Get available cylinders for swap
   */
  async getAvailableCylinders(type?: string) {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    
    const queryString = params.toString();
    const url = queryString ? `/swaps/available-cylinders?${queryString}` : '/swaps/available-cylinders';
    
    const response = await apiClient.get(url);
    return response.data.data;
  },
};