import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { analyticsService } from '@/services/api/analytics.service'
import type {
  ReportFilters,
  FinancialSummary,
  RevenueAnalysis,
  TransactionReport,
  OperationalReport,
  ReportDashboard,
  ExportOptions
} from '@/types/reports'

// Query keys
const QUERY_KEYS = {
  FINANCIAL_SUMMARY: 'financial-summary',
  REVENUE_ANALYSIS: 'revenue-analysis',
  TRANSACTIONS: 'transactions',
  OPERATIONAL: 'operational',
  DASHBOARD: 'report-dashboard',
  EXPORT: 'report-export'
}

// Hook for financial summary
export function useFinancialSummary(filters: ReportFilters) {
  return useQuery({
    queryKey: [QUERY_KEYS.FINANCIAL_SUMMARY, filters],
    queryFn: async () => {
      // Use analytics service directly since reports endpoints don't exist
      const dashboardData = await analyticsService.getDashboardMetrics({
        startDate: filters.startDate,
        endDate: filters.endDate,
        period: filters.period
      })
      
      const revenueData = await analyticsService.getRevenueAnalytics({
        startDate: filters.startDate,
        endDate: filters.endDate,
        period: filters.period
      })

      // Transform analytics data to financial summary format
      return transformToFinancialSummary(dashboardData, revenueData)
    },
    enabled: !!filters.startDate && !!filters.endDate,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2
  })
}

// Hook for revenue analysis
export function useRevenueAnalysis(filters: ReportFilters) {
  return useQuery({
    queryKey: [QUERY_KEYS.REVENUE_ANALYSIS, filters],
    queryFn: async () => {
      // Use analytics service directly since reports endpoints don't exist
      const revenueData = await analyticsService.getRevenueAnalytics({
        startDate: filters.startDate,
        endDate: filters.endDate,
        period: filters.period
      })

      const outletData = await analyticsService.getOutletPerformance({
        startDate: filters.startDate,
        endDate: filters.endDate
      })

      return transformToRevenueAnalysis(revenueData, outletData)
    },
    enabled: !!filters.startDate && !!filters.endDate,
    staleTime: 5 * 60 * 1000,
    retry: 2
  })
}

// Hook for transaction report
export function useTransactionReport(
  filters: ReportFilters & { page?: number; limit?: number }
) {
  return useQuery({
    queryKey: [QUERY_KEYS.TRANSACTIONS, filters],
    queryFn: async () => {
      // Use aggregation directly since reports endpoints don't exist
      return await aggregateTransactionData(filters)
    },
    enabled: !!filters.startDate && !!filters.endDate,
    staleTime: 5 * 60 * 1000,
    retry: 2
  })
}

// Hook for operational report
export function useOperationalReport(filters: ReportFilters) {
  return useQuery({
    queryKey: [QUERY_KEYS.OPERATIONAL, filters],
    queryFn: async () => {
      // Use analytics service directly since reports endpoints don't exist
      const cylinderData = await analyticsService.getCylinderUtilization({
        startDate: filters.startDate,
        endDate: filters.endDate
      })

      const operatorData = await analyticsService.getOperatorPerformance(undefined, {
        startDate: filters.startDate,
        endDate: filters.endDate
      })

      const outletData = await analyticsService.getOutletPerformance({
        startDate: filters.startDate,
        endDate: filters.endDate
      })

      const customerData = await analyticsService.getCustomerAnalytics({
        startDate: filters.startDate,
        endDate: filters.endDate
      })

      return transformToOperationalReport(
        cylinderData,
        operatorData,
        outletData,
        customerData
      )
    },
    enabled: !!filters.startDate && !!filters.endDate,
    staleTime: 5 * 60 * 1000,
    retry: 2
  })
}

// Hook for report dashboard
export function useReportDashboard() {
  return useQuery({
    queryKey: [QUERY_KEYS.DASHBOARD],
    queryFn: async () => {
      // Use analytics service directly since reports endpoints don't exist
      const dashboardData = await analyticsService.getDashboardMetrics()
      return transformToReportDashboard(dashboardData)
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2
  })
}

// Hook for exporting reports (client-side implementation)
export function useExportReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (options: ExportOptions) => {
      // Since export endpoints don't exist, show a message
      // The actual export is handled by TableExportButton component
      toast('Please use the export buttons in each table for CSV/PDF export', {
        icon: 'ℹ️'
      })
      return { 
        success: true, 
        message: 'Use table export buttons for data export',
        url: null 
      }
    },
    onSuccess: () => {
      // Do nothing - export is handled by table components
    },
    onError: () => {
      toast.error('Export functionality is available via table export buttons')
    }
  })
}

// Transform functions for fallback data
function transformToFinancialSummary(dashboardData: any, revenueData: any): FinancialSummary {
  // Debug logging
  console.log('Dashboard Data:', dashboardData)
  console.log('Revenue Data:', revenueData)
  
  // Access correct nested structure
  const dashboardSummary = dashboardData?.summary || {}
  const dashboardRevenue = dashboardSummary?.revenue || {}
  const revenueSummary = revenueData?.summary || {}
  
  // Calculate total revenue from revenue analytics
  const totalRevenue = revenueSummary.totalRevenue || 0
  const leaseRevenue = revenueSummary.leaseRevenue || 0
  const refillRevenue = revenueSummary.refillRevenue || 0
  
  // Count transactions from byPeriod or byOutlet data
  const transactionCount = revenueData?.byPeriod?.reduce((sum: number, p: any) => 
    sum + (p.transactionCount || 0), 0) || 0
  
  return {
    totalRevenue: totalRevenue,
    totalOutflows: 0, // Not available in current analytics
    netIncome: totalRevenue,
    growthRate: revenueSummary.growthRate || 0,
    periodComparison: {
      revenue: totalRevenue,
      revenueChange: revenueSummary.growthRate || 0,
      outflows: 0,
      outflowsChange: 0
    },
    revenueByCategory: [
      {
        category: 'lease',
        label: 'Lease Revenue',
        amount: leaseRevenue,
        percentage: calculatePercentage(leaseRevenue, totalRevenue),
        count: revenueData?.byOutlet?.reduce((sum: number, o: any) => 
          sum + Math.round((o.leaseRevenue / (revenueSummary.averageTransaction || 1))), 0) || 0
      },
      {
        category: 'refill',
        label: 'Refill Revenue',
        amount: refillRevenue,
        percentage: calculatePercentage(refillRevenue, totalRevenue),
        count: revenueData?.byOutlet?.reduce((sum: number, o: any) => 
          sum + Math.round((o.refillRevenue / (revenueSummary.averageTransaction || 1))), 0) || 0
      },
      {
        category: 'swap',
        label: 'Swap Revenue',
        amount: 0, // Not tracked separately in revenue analytics
        percentage: 0,
        count: 0
      },
      {
        category: 'deposit',
        label: 'Deposits',
        amount: 0, // Not tracked separately
        percentage: 0,
        count: 0
      },
      {
        category: 'penalty',
        label: 'Penalties',
        amount: 0, // Not tracked separately
        percentage: 0,
        count: 0
      },
      {
        category: 'late_fee',
        label: 'Late Fees',
        amount: 0, // Not tracked separately
        percentage: 0,
        count: 0
      },
      {
        category: 'other',
        label: 'Other Revenue',
        amount: 0, // Not tracked separately
        percentage: 0,
        count: 0
      }
    ],
    outflowsByCategory: [],
    dailyTrends: revenueData?.byPeriod?.map((p: any) => ({
      date: p.period,
      revenue: p.revenue || 0,
      outflows: 0,
      netIncome: p.revenue || 0,
      transactions: p.transactionCount || 0
    })) || []
  }
}

function transformToRevenueAnalysis(revenueData: any, outletData: any): RevenueAnalysis {
  // Debug logging
  console.log('Revenue Analysis Data:', revenueData)
  console.log('Outlet Performance Data:', outletData)
  
  // Use the actual byOutlet data from revenue analytics response
  const byOutlet = revenueData?.byOutlet || outletData || []
  
  // Calculate total transaction count from outlet data or period data
  const totalTransactions = byOutlet.reduce((sum: number, o: any) => 
    sum + (o.transactionCount || 0), 0) || 
    revenueData?.byPeriod?.reduce((sum: number, p: any) => 
      sum + (p.transactionCount || 0), 0) || 0
  
  return {
    summary: {
      totalRevenue: revenueData?.summary?.totalRevenue || 0,
      averageTransaction: revenueData?.summary?.averageTransaction || 0,
      transactionCount: totalTransactions,
      topRevenueSource: revenueData?.summary?.leaseRevenue > revenueData?.summary?.refillRevenue ? 'Leases' : 'Refills'
    },
    byOutlet: byOutlet.map((outlet: any) => ({
      outletId: outlet.outletId || outlet.id,
      outletName: outlet.outletName || outlet.name || 'Unknown',
      location: outlet.location || '',
      revenue: outlet.revenue || 0,
      transactionCount: outlet.transactionCount || 0,
      averageTransaction: outlet.averageTransaction || (outlet.transactionCount > 0 ? outlet.revenue / outlet.transactionCount : 0),
      growthRate: outlet.growthRate || 0
    })),
    byCategory: [
      {
        category: 'Leases',
        revenue: revenueData?.summary?.leaseRevenue || 0,
        count: revenueData?.summary?.leaseCount || 0,
        averageValue: calculateAverage(revenueData?.summary?.leaseRevenue, revenueData?.summary?.leaseCount),
        trend: 'up',
        changePercentage: 0
      },
      {
        category: 'Refills',
        revenue: revenueData?.summary?.refillRevenue || 0,
        count: revenueData?.summary?.refillCount || 0,
        averageValue: calculateAverage(revenueData?.summary?.refillRevenue, revenueData?.summary?.refillCount),
        trend: 'up',
        changePercentage: 0
      }
    ],
    byPeriod: revenueData?.byPeriod || [],
    topCustomers: (revenueData?.topCustomers || []).map((customer: any) => ({
      customerId: customer.customerId,
      customerName: customer.customerName,
      customerEmail: customer.customerEmail || '',
      totalRevenue: customer.totalRevenue || customer.totalSpent || 0,
      transactionCount: (customer.leaseCount || 0) + (customer.refillCount || 0),
      averageTransaction: customer.averageTransaction || 
        ((customer.totalRevenue || customer.totalSpent || 0) / ((customer.leaseCount || 0) + (customer.refillCount || 0)) || 0)
    })),
    projections: []
  }
}

function transformToOperationalReport(
  cylinderData: any,
  operatorData: any,
  outletData: any,
  customerData: any
): OperationalReport {
  // Debug logging
  console.log('Cylinder Data:', cylinderData)
  console.log('Operator Data:', operatorData)
  console.log('Outlet Data:', outletData)
  console.log('Customer Data:', customerData)
  
  // OperatorPerformance returns a single object, wrap in array if needed
  const operators = operatorData ? [operatorData] : []
  
  // OutletData is already an array from getOutletPerformance
  const outlets = Array.isArray(outletData) ? outletData : []
    
  return {
    cylinderMetrics: {
      totalCylinders: cylinderData?.summary?.total || cylinderData?.total || 0,
      availableCylinders: cylinderData?.summary?.available || cylinderData?.available || 0,
      leasedCylinders: cylinderData?.summary?.leased || cylinderData?.leased || 0,
      inMaintenanceCylinders: cylinderData?.summary?.maintenance || cylinderData?.maintenance || 0,
      utilizationRate: cylinderData?.summary?.utilizationRate || cylinderData?.utilizationRate || 0,
      averageLeaseDuration: cylinderData?.summary?.averageLeaseDuration || cylinderData?.averageLeaseDuration || 0,
      turnoverRate: cylinderData?.summary?.turnoverRate || cylinderData?.turnoverRate || 0,
      byType: cylinderData?.byType || []
    },
    operatorMetrics: {
      totalOperators: operators.length || 0,
      activeOperators: operators.length || 0, // All returned operators are active
      averageTransactionsPerOperator: operators.reduce((sum: number, op: any) => 
        sum + (op.metrics?.totalRefills || 0), 0) / (operators.length || 1),
      topPerformers: operators.map((op: any) => ({
        id: op.operatorId || 0,
        name: op.operatorName || 'Unknown',
        transactions: op.metrics?.totalRefills || 0,
        revenue: 0, // Not available in operator performance
        efficiency: op.metrics?.efficiency || 0
      })),
      performanceByHour: []
    },
    outletMetrics: {
      totalOutlets: outlets.length || 0,
      activeOutlets: outlets.filter((o: any) => o.isActive !== false).length || 0,
      averageRevenuePerOutlet: calculateAverage(
        outlets.reduce((sum: number, o: any) => sum + (o.revenue || 0), 0),
        outlets.length
      ),
      topPerformingOutlets: outlets
        .filter((o: any) => o.revenue > 0) // Only show outlets with revenue
        .sort((a: any, b: any) => (b.revenue || 0) - (a.revenue || 0))
        .slice(0, 5)
        .map((outlet: any) => ({
          id: outlet.outletId || outlet.id,
          name: outlet.outletName || outlet.name || 'Unknown',
          revenue: outlet.revenue || 0,
          transactions: outlet.transactionCount || 0,
          growthRate: outlet.growthRate || 0
        })),
      lowPerformingOutlets: outlets
        .filter((o: any) => o.revenue === 0 || !o.revenue) // Show outlets with no revenue
        .slice(0, 5)
        .map((outlet: any) => ({
          id: outlet.outletId || outlet.id,
          name: outlet.outletName || outlet.name || 'Unknown',
          revenue: outlet.revenue || 0,
          transactions: outlet.transactionCount || 0,
          issues: outlet.revenue === 0 ? ['No revenue generated'] : []
        }))
    },
    customerMetrics: {
      totalCustomers: customerData?.summary?.totalCustomers || 0,
      activeCustomers: customerData?.summary?.activeCustomers || 0,
      newCustomers: customerData?.summary?.newCustomers || 0,
      churnRate: customerData?.summary?.churnRate || 0,
      averageLifetimeValue: customerData?.summary?.averageLifetimeValue || 0,
      retentionRate: customerData?.summary?.retentionRate || 0,
      segmentation: customerData?.segments || []
    },
    efficiency: {
      averageProcessingTime: 0,
      peakHours: [],
      bottlenecks: [],
      recommendations: []
    }
  }
}

function transformToReportDashboard(dashboardData: any): ReportDashboard {
  // Debug logging
  console.log('Dashboard Data for Report:', dashboardData)
  
  const summary = dashboardData?.summary || {}
  const revenue = summary?.revenue || {}
  
  return {
    lastUpdated: new Date().toISOString(),
    keyMetrics: {
      todayRevenue: revenue.today || 0,
      weekRevenue: 0, // Not available in dashboard metrics
      monthRevenue: revenue.thisMonth || 0,
      yearRevenue: 0, // Not available in dashboard metrics
      pendingTransactions: 0, // Not available in dashboard metrics
      failedTransactions: 0 // Not available in dashboard metrics
    },
    alerts: [],
    quickStats: [
      {
        label: 'Active Leases',
        value: summary.activeLeases || 0,
        change: 0,
        trend: 'stable',
        icon: 'lease',
        color: 'blue'
      },
      {
        label: 'Total Refills',
        value: summary.todayRefills || 0,
        change: 0,
        trend: 'up',
        icon: 'refill',
        color: 'green'
      },
      {
        label: 'Active Customers',
        value: summary.totalCustomers || 0,
        change: 0,
        trend: 'up',
        icon: 'customer',
        color: 'purple'
      }
    ]
  }
}

async function aggregateTransactionData(filters: any): Promise<TransactionReport> {
  try {
    // Import services dynamically to avoid circular dependencies
    const { default: leaseService } = await import('@/services/api/lease.service')
    const { default: refillService } = await import('@/services/api/refill.service')
    const { swapService } = await import('@/services/api/swap.service')
    
    // Fetch data from multiple sources in parallel
    const [leases, refills, swaps] = await Promise.all([
      leaseService.getLeases({
        fromDate: filters.startDate,
        toDate: filters.endDate,
        page: 1,
        limit: 100
      }).catch(() => ({ data: [], meta: { total: 0 } })),
      refillService.getRefills({
        fromDate: filters.startDate,
        toDate: filters.endDate,
        page: 1,
        limit: 100
      }).catch(() => ({ data: [], meta: { total: 0 } })),
      swapService.getSwaps({
        dateFrom: filters.startDate,
        dateTo: filters.endDate,
        page: 1,
        limit: 100
      }).catch(() => ({ data: [] }))
    ])
    
    // Transform and combine all transactions
    const transactions = [
      ...(leases.data || []).map((lease: any) => ({
        transactionId: `LEASE-${lease.id}`,
        date: lease.createdAt || lease.startDate,
        type: 'lease' as const,
        customer: {
          id: lease.customerId,
          name: lease.customer?.name || 'Unknown',
          phone: lease.customer?.phone || '',
          email: lease.customer?.email || ''
        },
        outlet: {
          id: lease.outletId,
          name: lease.outlet?.name || 'Unknown'
        },
        amount: lease.totalAmount || lease.amount || 0,
        status: lease.status || 'completed',
        paymentMethod: lease.paymentMethod || 'cash',
        description: `Lease for ${lease.cylinderCount || 1} cylinder(s)`,
        reference: lease.referenceNo || ''
      })),
      ...(refills.data || []).map((refill: any) => ({
        transactionId: `REFILL-${refill.id}`,
        date: refill.createdAt || refill.refillDate,
        type: 'refill' as const,
        customer: {
          id: refill.customerId,
          name: refill.customer?.name || 'Unknown',
          phone: refill.customer?.phone || '',
          email: refill.customer?.email || ''
        },
        outlet: {
          id: refill.outletId,
          name: refill.outlet?.name || 'Unknown'
        },
        amount: refill.amount || refill.totalAmount || 0,
        status: refill.status || 'completed',
        paymentMethod: refill.paymentMethod || 'cash',
        description: `Refill for cylinder ${refill.cylinderBarcode || ''}`,
        reference: refill.referenceNo || ''
      })),
      ...(swaps.data || []).map((swap: any) => ({
        transactionId: `SWAP-${swap.id}`,
        date: swap.createdAt || swap.swapDate,
        type: 'swap' as const,
        customer: {
          id: swap.customerId,
          name: swap.customer?.name || 'Unknown',
          phone: swap.customer?.phone || '',
          email: swap.customer?.email || ''
        },
        outlet: {
          id: swap.outletId,
          name: swap.outlet?.name || 'Unknown'
        },
        amount: swap.amount || 0,
        status: swap.status || 'completed',
        paymentMethod: swap.paymentMethod || 'cash',
        description: `Swap cylinder ${swap.oldCylinderBarcode} for ${swap.newCylinderBarcode}`,
        reference: swap.referenceNo || ''
      }))
    ]
    
    // Sort by date descending
    transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    
    // Apply pagination
    const page = filters.page || 1
    const limit = filters.limit || 20
    const startIndex = (page - 1) * limit
    const paginatedTransactions = transactions.slice(startIndex, startIndex + limit)
    
    // Calculate summary
    const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0)
    const totalCount = transactions.length
    
    const byType = transactions.reduce((acc, t) => {
      acc[t.type] = (acc[t.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const byStatus = transactions.reduce((acc, t) => {
      acc[t.status] = (acc[t.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const byPaymentMethod = transactions.reduce((acc, t) => {
      acc[t.paymentMethod] = (acc[t.paymentMethod] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    return {
      transactions: paginatedTransactions,
      summary: {
        totalAmount,
        totalCount,
        averageAmount: totalCount > 0 ? totalAmount / totalCount : 0,
        byStatus,
        byType,
        byPaymentMethod
      },
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit)
      }
    }
  } catch (error) {
    console.error('Error aggregating transaction data:', error)
    // Return empty structure on error
    return {
      transactions: [],
      summary: {
        totalAmount: 0,
        totalCount: 0,
        averageAmount: 0,
        byStatus: {},
        byType: {},
        byPaymentMethod: {}
      },
      pagination: {
        total: 0,
        page: filters.page || 1,
        limit: filters.limit || 20,
        totalPages: 0
      }
    }
  }
}

// Helper functions
function calculatePercentage(value: number, total: number): number {
  if (!total || total === 0) return 0
  return Math.round((value / total) * 100)
}

function calculateAverage(total: number, count: number): number {
  if (!count || count === 0) return 0
  return Math.round(total / count)
}