export enum CylinderStatus {
  AVAILABLE = 'AVAILABLE',
  LEASED = 'LEASED',
  IN_REFILL = 'IN_REFILL',
  MAINTENANCE = 'MAINTENANCE',
  DAMAGED = 'DAMAGED'
}

export enum CylinderType {
  SMALL = 'SMALL',
  MEDIUM = 'MEDIUM',
  LARGE = 'LARGE',
  INDUSTRIAL = 'INDUSTRIAL'
}

export interface Cylinder {
  id: number
  cylinderCode: string
  type: string  // API returns '5kg', '10kg', etc.
  status: string  // API returns 'available', 'leased', etc.
  currentOutletId: number
  qrCode: string
  manufactureDate: string
  lastInspectionDate: string
  currentGasVolume: string
  maxGasVolume: string
  notes?: string | null
  createdAt: string
  updatedAt: string
  currentOutlet?: {
    id: number
    name: string
    location: string
  }
  // Legacy properties for compatibility
  code?: string
  capacity?: number
  outletId?: number
  outlet?: Outlet
  currentLeaseId?: number
  currentLease?: LeaseRecord
  isActive?: boolean
}

export interface Outlet {
  id: number
  name: string
  address: string
  phone?: string
  email?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface LeaseRecord {
  id: number
  customerId: number
  customer?: {
    id: number
    email: string
    firstName: string
    lastName: string
  }
  cylinderId: number
  cylinder?: {
    id: number
    cylinderCode: string
    type: string
    qrCode: string
  }
  outletId: number
  outlet?: {
    id: number
    name: string
    location: string
  }
  staffId: number
  staff?: {
    id: number
    email: string
    firstName: string
    lastName: string
  }
  leaseDate: string
  expectedReturnDate: string
  actualReturnDate?: string | null
  returnStaffId?: number | null
  leaseStatus: 'active' | 'returned' | 'overdue'
  depositAmount: string
  leaseAmount: string
  refundAmount?: string | null
  notes?: string | null
  createdAt: string
  updatedAt: string
}

export interface Customer {
  id: number
  userId: number
  user?: User
  phoneNumber: string
  alternatePhone?: string
  address: string
  city: string
  state: string
  postalCode?: string
  isActive: boolean
  isVerified: boolean
  verificationDate?: string
  createdAt: string
  updatedAt: string
}

export interface User {
  id: number
  email: string
  firstName: string
  lastName: string
  role: UserRole
  outletId?: number
  outlet?: Outlet
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export enum UserRole {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  REFILL_OP = 'REFILL_OP',
  CUSTOMER = 'CUSTOMER'
}

export enum LeaseStatus {
  ACTIVE = 'active',
  RETURNED = 'returned',
  OVERDUE = 'overdue'
}

// Type configuration for UI
export const cylinderTypeConfig: Record<CylinderType, {
  label: string
  capacity: number
  color: string
  icon: string
}> = {
  [CylinderType.SMALL]: {
    label: 'Small',
    capacity: 5,
    color: 'blue',
    icon: 'cylinder-small'
  },
  [CylinderType.MEDIUM]: {
    label: 'Medium',
    capacity: 12,
    color: 'green',
    icon: 'cylinder-medium'
  },
  [CylinderType.LARGE]: {
    label: 'Large',
    capacity: 25,
    color: 'orange',
    icon: 'cylinder-large'
  },
  [CylinderType.INDUSTRIAL]: {
    label: 'Industrial',
    capacity: 50,
    color: 'red',
    icon: 'cylinder-industrial'
  }
}

export const cylinderStatusConfig: Record<CylinderStatus, {
  label: string
  color: string
  bgColor: string
}> = {
  [CylinderStatus.AVAILABLE]: {
    label: 'Available',
    color: 'text-green-700',
    bgColor: 'bg-green-100'
  },
  [CylinderStatus.LEASED]: {
    label: 'Leased',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100'
  },
  [CylinderStatus.IN_REFILL]: {
    label: 'In Refill',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100'
  },
  [CylinderStatus.MAINTENANCE]: {
    label: 'Maintenance',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100'
  },
  [CylinderStatus.DAMAGED]: {
    label: 'Damaged',
    color: 'text-red-700',
    bgColor: 'bg-red-100'
  }
}