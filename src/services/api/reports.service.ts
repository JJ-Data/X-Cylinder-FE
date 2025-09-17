import AxiosBase from '@/services/axios/AxiosBase'
import type {
  ReportFilters,
  FinancialSummary,
  RevenueAnalysis,
  TransactionReport,
  OperationalReport,
  ReportDashboard,
  ExportOptions,
  ReportExport
} from '@/types/reports'

const apiClient = AxiosBase

class ReportsService {
  private baseURL = '/reports'

  // Get financial summary report
  async getFinancialSummary(filters: ReportFilters): Promise<FinancialSummary> {
    const params = this.buildQueryParams(filters)
    const response = await apiClient.get(`${this.baseURL}/financial-summary${params}`)
    return response.data.data
  }

  // Get revenue analysis report
  async getRevenueAnalysis(filters: ReportFilters): Promise<RevenueAnalysis> {
    const params = this.buildQueryParams(filters)
    const response = await apiClient.get(`${this.baseURL}/revenue-analysis${params}`)
    return response.data.data
  }

  // Get transaction report
  async getTransactionReport(filters: ReportFilters & { page?: number; limit?: number }): Promise<TransactionReport> {
    const params = this.buildQueryParams(filters)
    const response = await apiClient.get(`${this.baseURL}/transactions${params}`)
    return response.data.data
  }

  // Get operational report
  async getOperationalReport(filters: ReportFilters): Promise<OperationalReport> {
    const params = this.buildQueryParams(filters)
    const response = await apiClient.get(`${this.baseURL}/operational${params}`)
    return response.data.data
  }

  // Get report dashboard
  async getReportDashboard(): Promise<ReportDashboard> {
    const response = await apiClient.get(`${this.baseURL}/dashboard`)
    return response.data.data
  }

  // Export report
  async exportReport(options: ExportOptions): Promise<ReportExport> {
    const response = await apiClient.post(`${this.baseURL}/export`, options)
    return response.data.data
  }

  // Download exported report
  async downloadReport(exportId: string): Promise<Blob> {
    const response = await apiClient.get(`${this.baseURL}/export/${exportId}/download`, {
      responseType: 'blob'
    })
    return response.data
  }

  // Get available report templates
  async getReportTemplates(): Promise<any[]> {
    const response = await apiClient.get(`${this.baseURL}/templates`)
    return response.data.data
  }

  // Schedule a report
  async scheduleReport(schedule: any): Promise<any> {
    const response = await apiClient.post(`${this.baseURL}/schedule`, schedule)
    return response.data.data
  }

  // Get scheduled reports
  async getScheduledReports(): Promise<any[]> {
    const response = await apiClient.get(`${this.baseURL}/scheduled`)
    return response.data.data
  }

  // Delete scheduled report
  async deleteScheduledReport(id: string): Promise<void> {
    await apiClient.delete(`${this.baseURL}/scheduled/${id}`)
  }

  // Helper method to build query parameters
  private buildQueryParams(filters: any): string {
    const params = new URLSearchParams()

    // Map frontend parameter names to backend parameter names
    if (filters.startDate) params.append('dateFrom', filters.startDate)
    if (filters.endDate) params.append('dateTo', filters.endDate)
    if (filters.period) params.append('period', filters.period)
    if (filters.outletId) params.append('outletId', String(filters.outletId))
    if (filters.transactionType) params.append('type', filters.transactionType)
    if (filters.status) params.append('status', filters.status)
    if (filters.minAmount) params.append('minAmount', String(filters.minAmount))
    if (filters.maxAmount) params.append('maxAmount', String(filters.maxAmount))
    if (filters.customerId) params.append('customerId', String(filters.customerId))
    if (filters.operatorId) params.append('operatorId', String(filters.operatorId))
    if (filters.page) params.append('page', String(filters.page))
    if (filters.limit) params.append('limit', String(filters.limit))

    const queryString = params.toString()
    return queryString ? `?${queryString}` : ''
  }

  // Get report by date range with fallback to analytics
  async getReportData(reportType: string, filters: ReportFilters): Promise<any> {
    try {
      // Try to get from reports endpoint first
      const params = this.buildQueryParams(filters)
      const response = await apiClient.get(`${this.baseURL}/${reportType}${params}`)
      return response.data.data
    } catch (error: any) {
      // If reports endpoint doesn't exist, fallback to analytics
      if (error.response?.status === 404) {
        const analyticsParams = this.buildQueryParams(filters)
        const analyticsResponse = await apiClient.get(`/analytics/${reportType}${analyticsParams}`)
        return this.transformAnalyticsToReport(analyticsResponse.data.data, reportType)
      }
      throw error
    }
  }

  // Transform analytics data to report format
  private transformAnalyticsToReport(data: any, reportType: string): any {
    switch (reportType) {
      case 'financial-summary':
        return this.transformToFinancialSummary(data)
      case 'revenue-analysis':
        return this.transformToRevenueAnalysis(data)
      case 'transactions':
        return this.transformToTransactionReport(data)
      case 'operational':
        return this.transformToOperationalReport(data)
      default:
        return data
    }
  }

  // Transform analytics dashboard to financial summary
  private transformToFinancialSummary(data: any): FinancialSummary {
    const revenue = data.revenue || {}
    const transactions = data.transactions || {}
    
    return {
      totalRevenue: revenue.total || 0,
      totalOutflows: 0, // Not available in analytics
      netIncome: revenue.total || 0,
      growthRate: revenue.growthRate || 0,
      periodComparison: {
        revenue: revenue.current || 0,
        revenueChange: revenue.change || 0,
        outflows: 0,
        outflowsChange: 0
      },
      revenueByCategory: [
        {
          category: 'lease',
          label: 'Lease Revenue',
          amount: revenue.lease || 0,
          percentage: revenue.leasePercentage || 0,
          count: transactions.leaseCount || 0
        },
        {
          category: 'refill',
          label: 'Refill Revenue',
          amount: revenue.refill || 0,
          percentage: revenue.refillPercentage || 0,
          count: transactions.refillCount || 0
        },
        {
          category: 'swap',
          label: 'Swap Revenue',
          amount: revenue.swap || 0,
          percentage: revenue.swapPercentage || 0,
          count: transactions.swapCount || 0
        }
      ],
      outflowsByCategory: [],
      dailyTrends: data.trends || []
    }
  }

  // Transform to revenue analysis
  private transformToRevenueAnalysis(data: any): RevenueAnalysis {
    return {
      summary: {
        totalRevenue: data.summary?.totalRevenue || 0,
        averageTransaction: data.summary?.averageRevenue || 0,
        transactionCount: data.summary?.transactionCount || 0,
        topRevenueSource: data.summary?.topSource || 'N/A'
      },
      byOutlet: data.byOutlet || [],
      byCategory: data.byCategory || [],
      byPeriod: data.byPeriod || [],
      topCustomers: data.topCustomers || [],
      projections: []
    }
  }

  // Transform to transaction report
  private transformToTransactionReport(data: any): TransactionReport {
    const transactions = Array.isArray(data) ? data : (data.transactions || [])
    
    return {
      transactions: transactions.map((t: any) => ({
        id: t.id,
        transactionId: t.transactionId || `TXN-${t.id}`,
        date: t.createdAt || t.date,
        type: t.type || 'lease',
        category: t.category || t.type,
        customer: {
          id: t.customerId || t.customer?.id,
          name: t.customerName || t.customer?.name || 'N/A',
          email: t.customerEmail || t.customer?.email || '',
          phone: t.customerPhone || t.customer?.phone || ''
        },
        outlet: {
          id: t.outletId || t.outlet?.id,
          name: t.outletName || t.outlet?.name || 'N/A',
          location: t.outletLocation || t.outlet?.location || ''
        },
        amount: t.amount || 0,
        status: t.status || 'completed',
        paymentMethod: t.paymentMethod || 'cash',
        reference: t.reference || '',
        operator: t.operator,
        description: t.description || '',
        metadata: t.metadata || {}
      })),
      summary: {
        totalAmount: transactions.reduce((sum: number, t: any) => sum + (t.amount || 0), 0),
        totalCount: transactions.length,
        averageAmount: transactions.length > 0 
          ? transactions.reduce((sum: number, t: any) => sum + (t.amount || 0), 0) / transactions.length 
          : 0,
        byStatus: {},
        byType: {},
        byPaymentMethod: {}
      },
      pagination: {
        total: data.total || transactions.length,
        page: data.page || 1,
        limit: data.limit || 20,
        totalPages: data.totalPages || 1
      }
    }
  }

  // Transform to operational report
  private transformToOperationalReport(data: any): OperationalReport {
    return {
      cylinderMetrics: data.cylinders || {
        totalCylinders: 0,
        availableCylinders: 0,
        leasedCylinders: 0,
        inMaintenanceCylinders: 0,
        utilizationRate: 0,
        averageLeaseDuration: 0,
        turnoverRate: 0,
        byType: []
      },
      operatorMetrics: data.operators || {
        totalOperators: 0,
        activeOperators: 0,
        averageTransactionsPerOperator: 0,
        topPerformers: [],
        performanceByHour: []
      },
      outletMetrics: data.outlets || {
        totalOutlets: 0,
        activeOutlets: 0,
        averageRevenuePerOutlet: 0,
        topPerformingOutlets: [],
        lowPerformingOutlets: []
      },
      customerMetrics: data.customers || {
        totalCustomers: 0,
        activeCustomers: 0,
        newCustomers: 0,
        churnRate: 0,
        averageLifetimeValue: 0,
        retentionRate: 0,
        segmentation: []
      },
      efficiency: {
        averageProcessingTime: 0,
        peakHours: [],
        bottlenecks: [],
        recommendations: []
      }
    }
  }
}

export const reportsService = new ReportsService()
export default reportsService