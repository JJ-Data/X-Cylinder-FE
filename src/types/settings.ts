// Settings type definitions for frontend
export interface SettingCategory {
  id: number
  name: string
  description?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  settingsCount?: number
}

export interface BusinessSetting {
  id: number
  categoryId: number
  settingKey: string
  settingValue: any
  dataType: DataType
  description?: string
  
  // Hierarchical scope
  outletId?: number
  cylinderType?: string
  customerTier?: CustomerTier
  operationType?: 'LEASE' | 'REFILL' | 'SWAP' | 'REGISTRATION' | 'PENALTY' | 'DEPOSIT'
  
  // Temporal settings
  effectiveDate: string
  expiryDate?: string
  priority: number
  version: number
  isActive: boolean
  
  // Audit fields
  createdBy: number
  updatedBy: number
  createdAt: string
  updatedAt: string
  
  // Relations
  category?: SettingCategory
  outlet?: {
    id: number
    name: string
  }
  creator?: {
    id: number
    firstName: string
    lastName: string
    email: string
  }
}

export interface PricingRule {
  id: number
  categoryId: number
  name: string
  description?: string
  conditions: PricingCondition[]
  actions: PricingAction[]
  appliesTo: PricingScope
  priority: number
  isActive: boolean
  effectiveDate: string
  expiryDate?: string
  createdBy: number
  updatedBy: number
  createdAt: string
  updatedAt: string
}

export interface PricingCondition {
  field: string
  operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'in' | 'not_in' | 'between'
  value: any
  logicalOperator?: 'AND' | 'OR'
}

export interface PricingAction {
  type: 'discount' | 'surcharge' | 'minimum' | 'maximum' | 'multiply' | 'set'
  value: number
  unit: 'currency' | 'percent'
  description?: string
}

export interface PricingScope {
  operationType?: string
  cylinderType?: string
  customerTier?: string
  outletId?: number
}

export interface SettingsAudit {
  id: number
  entityType: 'BusinessSetting' | 'PricingRule' | 'SettingCategory'
  entityId: number
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'BULK_UPDATE' | 'IMPORT'
  oldValue?: any
  newValue?: any
  reason?: string
  userId: number
  ipAddress?: string
  userAgent?: string
  createdAt: string
  
  // Relations
  user?: {
    id: number
    firstName: string
    lastName: string
    email: string
  }
}

// DTOs for API requests
export interface CreateSettingDto {
  categoryId: number
  settingKey: string
  settingValue: any
  dataType: DataType
  description?: string
  outletId?: number
  cylinderType?: string
  customerTier?: CustomerTier
  operationType?: OperationType
  effectiveDate?: string
  expiryDate?: string
  priority?: number
  isActive?: boolean
  reason?: string
}

export interface UpdateSettingDto extends Partial<CreateSettingDto> {
  id: number
  reason?: string
}

export interface SettingsFilters {
  page?: number
  limit?: number
  search?: string
  category?: string
  categoryId?: number
  outletId?: number
  cylinderType?: string
  customerTier?: CustomerTier
  operationType?: 'LEASE' | 'REFILL' | 'SWAP' | 'REGISTRATION' | 'PENALTY' | 'DEPOSIT'
  isActive?: boolean
  effectiveOnly?: boolean
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PricingContext {
  operationType: 'LEASE' | 'REFILL' | 'SWAP' | 'REGISTRATION' | 'PENALTY' | 'DEPOSIT'
  cylinderType: string
  quantity: number
  customerTier?: CustomerTier
  outletId?: number
  duration?: number // for leases
  gasAmount?: number // for refills
  condition?: string // for swaps
}

export interface PricingResult {
  basePrice: number
  discounts: PricingBreakdown[]
  surcharges: PricingBreakdown[]
  taxes: PricingBreakdown[]
  totalPrice: number
  breakdown: {
    subtotal: number
    totalDiscounts: number
    totalSurcharges: number
    totalTaxes: number
    final: number
  }
  appliedRules: string[]
  context: PricingContext
}

export interface PricingBreakdown {
  type: string
  description: string
  amount: number
  percentage?: number
  appliedRule?: string
}

export interface BulkPricingItem {
  cylinderType: string
  quantity: number
  gasAmount?: number
  condition?: string
  duration?: number
}

export interface BulkPricingRequest {
  operationType: 'LEASE' | 'REFILL' | 'SWAP'
  items: BulkPricingItem[]
  customerTier?: CustomerTier
  outletId?: number
}

export interface BulkPricingResult {
  items: (PricingResult & { itemIndex: number })[]
  summary: {
    totalItems: number
    totalQuantity: number
    totalPrice: number
    averagePrice: number
    totalDiscounts: number
    totalTaxes: number
  }
}

export interface SettingsStatistics {
  totalSettings: number
  activeSettings: number
  categoriesCount: number
  recentChanges: number
  settingsByCategory: Record<string, number>
  settingsByScope: {
    global: number
    outlet: number
    customerTier: number
    cylinderType: number
    complex: number
  }
  priceOverrides: number
  scheduledChanges: number
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  suggestions: string[]
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

// Constants
export const SETTING_CATEGORIES = {
  PRICING: 'PRICING',
  LEASE: 'LEASE', 
  REFILL: 'REFILL',
  SWAP: 'SWAP',
  REGISTRATION: 'REGISTRATION',
  PENALTIES: 'PENALTIES',
  DEPOSITS: 'DEPOSITS',
  BUSINESS_RULES: 'BUSINESS_RULES',
  DISCOUNTS: 'DISCOUNTS',
  TAXES: 'TAXES'
} as const

export const DATA_TYPES = {
  STRING: 'STRING',
  NUMBER: 'NUMBER',
  BOOLEAN: 'BOOLEAN',
  JSON: 'JSON',
  ARRAY: 'ARRAY'
} as const

export const CUSTOMER_TIERS = {
  REGULAR: 'REGULAR',
  BUSINESS: 'BUSINESS',
  PREMIUM: 'PREMIUM'
} as const

export const OPERATION_TYPES = {
  LEASE: 'LEASE',
  REFILL: 'REFILL',
  SWAP: 'SWAP',
  REGISTRATION: 'REGISTRATION',
  PENALTY: 'PENALTY',
  DEPOSIT: 'DEPOSIT'
} as const

export const AUDIT_ACTIONS = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  BULK_UPDATE: 'BULK_UPDATE',
  IMPORT: 'IMPORT'
} as const

export type SettingCategoryType = keyof typeof SETTING_CATEGORIES
export type DataType = keyof typeof DATA_TYPES
export type CustomerTier = keyof typeof CUSTOMER_TIERS
export type OperationType = keyof typeof OPERATION_TYPES
export type AuditAction = keyof typeof AUDIT_ACTIONS