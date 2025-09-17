// Report types for comprehensive admin reports

export interface DateRange {
  startDate: string
  endDate: string
  period?: 'daily' | 'weekly' | 'monthly' | 'yearly'
}

export interface ReportFilters extends DateRange {
  outletId?: number
  transactionType?: string
  status?: string
  minAmount?: number
  maxAmount?: number
  customerId?: number
  operatorId?: number
}

// Financial Summary Types
export interface FinancialSummary {
  totalRevenue: number
  totalOutflows: number
  netIncome: number
  growthRate: number
  periodComparison: {
    revenue: number
    revenueChange: number
    outflows: number
    outflowsChange: number
  }
  revenueByCategory: RevenueCategory[]
  outflowsByCategory: OutflowCategory[]
  dailyTrends: DailyTrend[]
}

export interface RevenueCategory {
  category: 'lease' | 'refill' | 'deposit' | 'swap' | 'penalty' | 'late_fee' | 'other'
  label: string
  amount: number
  percentage: number
  count: number
}

export interface OutflowCategory {
  category: 'refund' | 'damage' | 'write_off' | 'operational' | 'other'
  label: string
  amount: number
  percentage: number
  count: number
}

export interface DailyTrend {
  date: string
  revenue: number
  outflows: number
  netIncome: number
  transactions: number
}

// Revenue Analysis Types
export interface RevenueAnalysis {
  summary: {
    totalRevenue: number
    averageTransaction: number
    transactionCount: number
    topRevenueSource: string
  }
  byOutlet: OutletRevenue[]
  byCategory: CategoryRevenue[]
  byPeriod: PeriodRevenue[]
  topCustomers: CustomerRevenue[]
  projections: RevenueProjection[]
}

export interface OutletRevenue {
  outletId: number
  outletName: string
  location: string
  revenue: number
  transactionCount: number
  averageTransaction: number
  growthRate: number
}

export interface CategoryRevenue {
  category: string
  revenue: number
  count: number
  averageValue: number
  trend: 'up' | 'down' | 'stable'
  changePercentage: number
}

export interface PeriodRevenue {
  period: string
  revenue: number
  leaseRevenue: number
  refillRevenue: number
  swapRevenue: number
  otherRevenue: number
  transactionCount: number
}

export interface CustomerRevenue {
  customerId: number
  customerName: string
  customerEmail: string
  totalRevenue: number
  transactionCount: number
  averageTransaction: number
  lastTransaction: string
}

export interface RevenueProjection {
  period: string
  projected: number
  actual?: number
  variance?: number
}

// Transaction Report Types
export interface TransactionReport {
  transactions: Transaction[]
  summary: TransactionSummary
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface Transaction {
  id: number
  transactionId: string
  date: string
  type: 'lease' | 'refill' | 'swap' | 'refund' | 'penalty' | 'deposit_return'
  category: string
  customer: {
    id: number
    name: string
    email: string
    phone: string
  }
  outlet: {
    id: number
    name: string
    location: string
  }
  amount: number
  status: 'completed' | 'pending' | 'failed' | 'refunded'
  paymentMethod: 'cash' | 'transfer' | 'card' | 'mobile_money'
  reference: string
  operator?: {
    id: number
    name: string
  }
  description: string
  metadata?: Record<string, any>
}

export interface TransactionSummary {
  totalAmount: number
  totalCount: number
  averageAmount: number
  byStatus: Record<string, number>
  byType: Record<string, number>
  byPaymentMethod: Record<string, number>
}

// Operational Report Types
export interface OperationalReport {
  cylinderMetrics: CylinderMetrics
  operatorMetrics: OperatorMetrics
  outletMetrics: OutletMetrics
  customerMetrics: CustomerMetrics
  efficiency: EfficiencyMetrics
}

export interface CylinderMetrics {
  totalCylinders: number
  availableCylinders: number
  leasedCylinders: number
  inMaintenanceCylinders: number
  utilizationRate: number
  averageLeaseDuration: number
  turnoverRate: number
  byType: Array<{
    type: string
    total: number
    available: number
    leased: number
    utilization: number
  }>
}

export interface OperatorMetrics {
  totalOperators: number
  activeOperators: number
  averageTransactionsPerOperator: number
  topPerformers: Array<{
    id: number
    name: string
    transactions: number
    revenue: number
    efficiency: number
  }>
  performanceByHour: Array<{
    hour: number
    transactions: number
    averageProcessingTime: number
  }>
}

export interface OutletMetrics {
  totalOutlets: number
  activeOutlets: number
  averageRevenuePerOutlet: number
  topPerformingOutlets: Array<{
    id: number
    name: string
    revenue: number
    transactions: number
    growthRate: number
  }>
  lowPerformingOutlets: Array<{
    id: number
    name: string
    revenue: number
    transactions: number
    issues: string[]
  }>
}

export interface CustomerMetrics {
  totalCustomers: number
  activeCustomers: number
  newCustomers: number
  churnRate: number
  averageLifetimeValue: number
  retentionRate: number
  segmentation: Array<{
    segment: string
    count: number
    revenue: number
    averageValue: number
  }>
}

export interface EfficiencyMetrics {
  averageProcessingTime: number
  peakHours: string[]
  bottlenecks: Array<{
    process: string
    averageTime: number
    volume: number
    impact: 'high' | 'medium' | 'low'
  }>
  recommendations: string[]
}

// Export Types
export interface ExportOptions {
  format: 'pdf' | 'csv' | 'excel'
  reportType: 'financial' | 'revenue' | 'transaction' | 'operational' | 'custom'
  filters: ReportFilters
  columns?: string[]
  includeCharts?: boolean
  includeSummary?: boolean
}

export interface ReportExport {
  url: string
  filename: string
  size: number
  generatedAt: string
  expiresAt: string
}

// Dashboard Report Summary
export interface ReportDashboard {
  lastUpdated: string
  keyMetrics: {
    todayRevenue: number
    weekRevenue: number
    monthRevenue: number
    yearRevenue: number
    pendingTransactions: number
    failedTransactions: number
  }
  alerts: ReportAlert[]
  quickStats: QuickStat[]
}

export interface ReportAlert {
  id: string
  type: 'warning' | 'error' | 'info' | 'success'
  title: string
  message: string
  timestamp: string
  actionRequired: boolean
}

export interface QuickStat {
  label: string
  value: number | string
  change: number
  trend: 'up' | 'down' | 'stable'
  icon: string
  color: string
}

// Chart Data Types
export interface ChartData {
  series: Array<{
    name: string
    data: number[]
    color?: string
  }>
  categories: string[]
  type: 'line' | 'bar' | 'area' | 'donut' | 'pie' | 'radar'
}

export interface ReportChartConfig {
  title: string
  subtitle?: string
  height?: number
  showLegend?: boolean
  showGrid?: boolean
  showDataLabels?: boolean
  colors?: string[]
}