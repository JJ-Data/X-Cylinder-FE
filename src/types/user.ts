export enum UserRole {
  ADMIN = 'admin',
  STAFF = 'staff',
  REFILL_OPERATOR = 'refill_operator',
  CUSTOMER = 'customer'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed'
}

export interface User {
  id: number
  email: string
  firstName: string
  lastName: string
  name?: string // Computed field for display
  role: UserRole
  outletId?: number
  outlet?: {
    id: number
    name: string
    address: string
  }
  phoneNumber?: string
  alternatePhone?: string
  address?: string
  city?: string
  state?: string
  postalCode?: string
  isActive: boolean
  emailVerified: boolean
  emailVerifiedAt?: string
  lastLogin?: string
  paymentStatus?: PaymentStatus | string
  activatedAt?: string
  createdAt: string
  updatedAt: string
}

export interface CreateUserDto {
  email: string
  name: string
  password: string
  role: UserRole
  outletId?: number
  phoneNumber?: string
  alternatePhone?: string
  address?: string
  city?: string
  state?: string
  postalCode?: string
}

export interface UpdateUserDto {
  name?: string
  role?: UserRole
  outletId?: number
  phoneNumber?: string
  alternatePhone?: string
  address?: string
  city?: string
  state?: string
  postalCode?: string
  isActive?: boolean
}

export interface UserFilters {
  role?: UserRole
  outletId?: number
  isActive?: boolean
  search?: string
  page?: number
  pageSize?: number
}

export interface CustomerRegistrationDto {
  email: string
  firstName: string
  lastName: string
  phoneNumber: string
  alternatePhone?: string
  address: string
  city: string
  state: string
  postalCode?: string
}

export interface CustomerActivationDto {
  userId: number
  paymentAmount: number
  paymentMethod: 'cash' | 'bank_transfer' | 'card'
  paymentReference?: string
}

// User permission definitions
export const userPermissions = {
  admin: {
    users: ['create', 'read', 'update', 'delete'],
    customers: ['create', 'read', 'update', 'delete', 'activate'],
    staff: ['create', 'read', 'update', 'delete'],
    refillOperators: ['create', 'read', 'update', 'delete'],
    outlets: ['create', 'read', 'update', 'delete'],
    cylinders: ['create', 'read', 'update', 'delete', 'transfer'],
    leases: ['create', 'read', 'update', 'delete'],
    reports: ['view', 'export']
  },
  staff: {
    users: [],
    customers: ['create', 'read', 'update', 'activate'],
    staff: ['read'],
    refillOperators: ['read'],
    outlets: ['read'],
    cylinders: ['read', 'update', 'transfer'],
    leases: ['create', 'read', 'update'],
    reports: ['view']
  },
  refill_operator: {
    users: [],
    customers: ['read', 'update'],
    staff: [],
    refillOperators: [],
    outlets: ['read'],
    cylinders: ['read', 'update'],
    leases: ['read'],
    reports: []
  },
  customer: {
    users: [],
    customers: [],
    staff: [],
    refillOperators: [],
    outlets: ['read'],
    cylinders: ['read'],
    leases: ['read'],
    reports: []
  }
}

export const hasPermission = (
  userRole: UserRole | string,
  resource: keyof typeof userPermissions.admin,
  action: string
): boolean => {
  // Normalize the role to lowercase to handle case mismatches
  const normalizedRole = userRole?.toLowerCase() as keyof typeof userPermissions
  const rolePermissions = userPermissions[normalizedRole]
  if (!rolePermissions || !rolePermissions[resource]) return false
  const resourcePermissions = rolePermissions[resource] as string[]
  return resourcePermissions.includes(action)
}