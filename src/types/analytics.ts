// Dashboard Metrics
export interface DashboardMetrics {
  summary: {
    totalOutlets: number
    totalCylinders: number
    activeCylinders: number
    totalCustomers: number
    activeLeases: number
    todayRefills: number
    revenue: {
      today: number
      thisMonth: number
      growth: number
    }
  }
  recentActivity: {
    leases: RecentLease[]
    refills: RecentRefill[]
  }
  alerts: Alert[]
}

export interface RecentLease {
  id: number
  customerId: number
  customerName: string
  cylinderId: number
  cylinderCode: string
  outletId: number
  outletName: string
  leaseDate: string
  amount: number
}

export interface RecentRefill {
  id: number
  cylinderId: number
  cylinderCode: string
  operatorId: number
  operatorName: string
  refillDate: string
  volume: number
  cost: number
}

export interface Alert {
  type: 'warning' | 'danger' | 'info'
  title: string
  message: string
  timestamp: string
}

// Outlet Performance
export interface OutletPerformance {
  outletId: number
  outletName: string
  metrics: {
    totalCylinders: number
    activeCylinders: number
    utilizationRate: number
    monthlyLeases: number
    monthlyRefills: number
    monthlyRevenue: number
    growthRate: number
  }
  trends: {
    date: string
    leases: number
    refills: number
    revenue: number
  }[]
}

// Cylinder Utilization
export interface CylinderUtilization {
  summary: {
    total: number
    available: number
    leased: number
    inRefill: number
    maintenance: number
    damaged: number
  }
  byType: {
    type: string
    total: number
    available: number
    leased: number
    utilizationRate: number
  }[]
  byOutlet: {
    outletId: number
    outletName: string
    total: number
    available: number
    leased: number
    utilizationRate: number
  }[]
  trends: {
    date: string
    available: number
    leased: number
    inRefill: number
  }[]
}

// Revenue Analytics
export interface RevenueAnalytics {
  summary: {
    totalRevenue: number
    leaseRevenue: number
    refillRevenue: number
    growthRate: number
    averageTransaction: number
  }
  byOutlet: {
    outletId: number
    outletName: string
    revenue: number
    leaseRevenue: number
    refillRevenue: number
    transactionCount: number
  }[]
  byPeriod: {
    period: string
    revenue: number
    leaseRevenue: number
    refillRevenue: number
    transactionCount: number
  }[]
  topCustomers: {
    customerId: number
    customerName: string
    totalSpent: number
    leaseCount: number
    refillCount: number
  }[]
}

// Customer Analytics
export interface CustomerAnalytics {
  summary: {
    totalCustomers: number
    activeCustomers: number
    newCustomers: number
    churnRate: number
    retentionRate: number
    averageLifetimeValue: number
  }
  segments: {
    segment: 'active' | 'inactive' | 'new' | 'churned'
    count: number
    percentage: number
    averageValue: number
  }[]
  growth: {
    date: string
    totalCustomers: number
    newCustomers: number
    activeCustomers: number
  }[]
  topCustomers: {
    customerId: number
    customerName: string
    joinDate: string
    totalLeases: number
    totalRefills: number
    totalSpent: number
    lastActivity: string
  }[]
}

// Operator Performance
export interface OperatorPerformance {
  operatorId: number
  operatorName: string
  outletId: number
  outletName: string
  metrics: {
    totalRefills: number
    dailyAverage: number
    efficiency: number
    accuracy: number
    rating: number
  }
  daily: {
    date: string
    refillCount: number
    volumeProcessed: number
    revenueGenerated: number
  }[]
  comparison: {
    metric: string
    value: number
    average: number
    percentile: number
  }[]
}