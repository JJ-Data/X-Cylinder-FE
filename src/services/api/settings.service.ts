import { apiClient } from '../api-client'
import type {
  SettingCategory,
  BusinessSetting,
  PricingRule,
  SettingsAudit,
  CreateSettingDto,
  UpdateSettingDto,
  SettingsFilters,
  PricingContext,
  PricingResult,
  BulkPricingRequest,
  BulkPricingResult,
  SettingsStatistics,
  ValidationResult,
  ApiResponse,
  PaginatedResponse
} from '@/types/settings'

class SettingsService {
  // Settings Categories
  async getCategories(): Promise<ApiResponse<SettingCategory[]>> {
    const response = await apiClient.get('/settings/categories')
    return response.data
  }

  async createCategory(data: {
    name: string
    description?: string
  }): Promise<ApiResponse<SettingCategory>> {
    const response = await apiClient.post('/settings/categories', data)
    return response.data
  }

  async updateCategory(
    id: number,
    data: { name?: string; description?: string; isActive?: boolean }
  ): Promise<ApiResponse<SettingCategory>> {
    const response = await apiClient.put(`/settings/categories/${id}`, data)
    return response.data
  }

  async deleteCategory(id: number): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`/settings/categories/${id}`)
    return response.data
  }

  // Business Settings
  async getSettings(filters?: SettingsFilters): Promise<ApiResponse<PaginatedResponse<BusinessSetting>>> {
    const response = await apiClient.get('/settings', {
      params: filters
    })
    return response.data
  }

  async getSetting(
    key: string,
    scope?: {
      outletId?: number
      cylinderType?: string
      customerTier?: string
      operationType?: string
    }
  ): Promise<ApiResponse<BusinessSetting>> {
    const response = await apiClient.get(`/settings/key/${key}`, {
      params: scope
    })
    return response.data
  }

  async getSettingsByCategory(
    category: string,
    filters?: Omit<SettingsFilters, 'category'>
  ): Promise<ApiResponse<PaginatedResponse<BusinessSetting>>> {
    const response = await apiClient.get(`/settings/category/${category}`, {
      params: filters
    })
    return response.data
  }

  async getSettingById(id: number): Promise<ApiResponse<BusinessSetting>> {
    const response = await apiClient.get(`/settings/${id}`)
    return response.data
  }

  async createSetting(data: CreateSettingDto): Promise<ApiResponse<BusinessSetting>> {
    const response = await apiClient.post('/settings', data)
    return response.data
  }

  async updateSetting(data: UpdateSettingDto): Promise<ApiResponse<BusinessSetting>> {
    const { id, ...updateData } = data
    const response = await apiClient.put(`/settings/${id}`, updateData)
    return response.data
  }

  async deleteSetting(id: number, reason?: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`/settings/${id}`, {
      data: { reason }
    })
    return response.data
  }

  async bulkUpdateSettings(
    updates: UpdateSettingDto[],
    reason?: string
  ): Promise<ApiResponse<BusinessSetting[]>> {
    const response = await apiClient.put('/settings/bulk', {
      updates,
      reason
    })
    return response.data
  }

  // Pricing Calculations
  async calculatePrice(context: PricingContext): Promise<ApiResponse<PricingResult>> {
    const response = await apiClient.post('/settings/price/calculate', context)
    return response.data
  }

  async calculateBulkPrice(request: BulkPricingRequest): Promise<ApiResponse<BulkPricingResult>> {
    const response = await apiClient.post('/settings/price/bulk', request)
    return response.data
  }

  async getQuote(params: {
    operationType: string
    cylinderType: string
    customerTier?: string
    quantity?: number
    duration?: number
    gasAmount?: number
    condition?: string
  }): Promise<ApiResponse<PricingResult>> {
    const response = await apiClient.get('/settings/quote', { params })
    return response.data
  }

  // Pricing Rules
  async getPricingRules(filters?: {
    categoryId?: number
    operationType?: string
    isActive?: boolean
    page?: number
    limit?: number
  }): Promise<ApiResponse<PaginatedResponse<PricingRule>>> {
    const response = await apiClient.get('/settings/pricing-rules', {
      params: filters
    })
    return response.data
  }

  async createPricingRule(data: {
    categoryId: number
    name: string
    description?: string
    conditions: any[]
    actions: any[]
    appliesTo: any
    priority?: number
    effectiveDate?: string
    expiryDate?: string
  }): Promise<ApiResponse<PricingRule>> {
    const response = await apiClient.post('/settings/pricing-rules', data)
    return response.data
  }

  async updatePricingRule(
    id: number,
    data: Partial<{
      name: string
      description: string
      conditions: any[]
      actions: any[]
      appliesTo: any
      priority: number
      isActive: boolean
      effectiveDate: string
      expiryDate: string
    }>
  ): Promise<ApiResponse<PricingRule>> {
    const response = await apiClient.put(`/settings/pricing-rules/${id}`, data)
    return response.data
  }

  async deletePricingRule(id: number): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`/settings/pricing-rules/${id}`)
    return response.data
  }

  // Validation and Analysis
  async validatePricingConfig(operationType: string): Promise<ApiResponse<ValidationResult>> {
    const response = await apiClient.get(`/settings/validate/${operationType}`)
    return response.data
  }

  async getRevenueProjection(
    operationType: string,
    params?: {
      period?: 'day' | 'week' | 'month' | 'quarter' | 'year'
      cylinderType?: string
      customerTier?: string
    }
  ): Promise<ApiResponse<{
    period: string
    projectedRevenue: number
    breakdown: any[]
    factors: string[]
  }>> {
    const response = await apiClient.get(`/settings/projection/${operationType}`, {
      params
    })
    return response.data
  }

  async getCompetitivePricing(
    operationType: string,
    params?: {
      cylinderType?: string
      region?: string
    }
  ): Promise<ApiResponse<{
    ourPrice: number
    marketAverage: number
    competitors: any[]
    recommendation: string
  }>> {
    const response = await apiClient.get(`/settings/competitive/${operationType}`, {
      params
    })
    return response.data
  }

  // Statistics and Analytics
  async getStatistics(filters?: {
    period?: string
    categoryId?: number
    outletId?: number
  }): Promise<ApiResponse<SettingsStatistics>> {
    const response = await apiClient.get('/settings/statistics', {
      params: filters
    })
    return response.data
  }

  // Audit Trail
  async getAuditLogs(filters?: {
    entityType?: 'BusinessSetting' | 'PricingRule' | 'SettingCategory'
    entityId?: number
    userId?: number
    action?: string
    dateFrom?: string
    dateTo?: string
    page?: number
    limit?: number
  }): Promise<ApiResponse<PaginatedResponse<SettingsAudit>>> {
    const response = await apiClient.get('/settings/audit', {
      params: filters
    })
    return response.data
  }

  // Import/Export
  async exportSettings(filters?: {
    categoryId?: number
    format?: 'json' | 'csv'
    includeInactive?: boolean
  }): Promise<Blob> {
    const response = await apiClient.get('/settings/export', {
      params: filters,
      responseType: 'blob'
    })
    return response.data
  }

  async importSettings(file: File, options?: {
    overwrite?: boolean
    validateOnly?: boolean
    reason?: string
  }): Promise<ApiResponse<{
    imported: number
    updated: number
    errors: string[]
    warnings: string[]
  }>> {
    const formData = new FormData()
    formData.append('file', file)
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        formData.append(key, String(value))
      })
    }

    const response = await apiClient.post('/settings/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  }

  async getImportTemplate(format: 'json' | 'csv' = 'csv'): Promise<Blob> {
    const response = await apiClient.get('/settings/import/template', {
      params: { format },
      responseType: 'blob'
    })
    return response.data
  }

  // Helper methods for common operations
  async getHierarchicalSettings(
    key: string,
    context?: {
      outletId?: number
      cylinderType?: string
      customerTier?: string
      operationType?: string
    }
  ): Promise<ApiResponse<{
    resolved: BusinessSetting
    hierarchy: BusinessSetting[]
    overrides: BusinessSetting[]
  }>> {
    const response = await apiClient.get(`/settings/hierarchy/${key}`, {
      params: context
    })
    return response.data
  }

  async testPricingRules(
    ruleId: number,
    testCases: PricingContext[]
  ): Promise<ApiResponse<{
    results: (PricingResult & { passed: boolean; errors: string[] })[]
    summary: {
      totalTests: number
      passed: number
      failed: number
    }
  }>> {
    const response = await apiClient.post(`/settings/pricing-rules/${ruleId}/test`, {
      testCases
    })
    return response.data
  }

  async duplicateSetting(
    id: number,
    newScope?: {
      outletId?: number
      cylinderType?: string
      customerTier?: string
      operationType?: string
    },
    reason?: string
  ): Promise<ApiResponse<BusinessSetting>> {
    const response = await apiClient.post(`/settings/${id}/duplicate`, {
      newScope,
      reason
    })
    return response.data
  }

  // Simplified settings methods
  async getAllSettings(): Promise<ApiResponse<{ settings: any[] }>> {
    const response = await apiClient.get('/settings')
    return {
      success: true,
      data: {
        settings: response.data.data || []
      }
    }
  }

  async batchUpdateSettings(
    updates: Array<{
      key: string
      value: any
      dataType: string
    }>
  ): Promise<ApiResponse<void>> {
    // Create or update each setting individually
    // Since we don't have IDs, we'll use the create/update endpoint
    try {
      for (const update of updates) {
        await apiClient.post('/settings', {
          categoryId: 1, // Default category for pricing settings
          settingKey: update.key,
          settingValue: update.value,
          dataType: update.dataType || 'STRING'
        })
      }
      return {
        success: true,
        message: 'Settings updated successfully'
      }
    } catch (error) {
      throw error
    }
  }
}

export const settingsService = new SettingsService()
export default settingsService