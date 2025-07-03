// Outlet type definitions matching backend structure
export interface Outlet {
  id: number
  name: string
  location: string
  contactPhone: string
  contactEmail: string
  status: 'active' | 'inactive'
  managerId?: number
  manager?: {
    id: number
    email: string
    firstName: string
    lastName: string
  }
  createdAt: string
  updatedAt: string
}

export interface OutletCreationData {
  name: string
  location: string
  contactPhone: string
  contactEmail: string
  managerId?: number
}

export interface OutletUpdateData {
  name?: string
  location?: string
  contactPhone?: string
  contactEmail?: string
  status?: 'active' | 'inactive'
  managerId?: number | null
}

export interface OutletInventory {
  outletId: number
  totalCylinders: number
  availableCylinders: number
  leasedCylinders: number
  refillingCylinders: number
  damagedCylinders: number
  byType: Record<string, number>
}

export interface OutletListResponse {
  outlets: Outlet[]
  total: number
  page: number
  totalPages: number
}

export interface OutletFilters {
  status?: 'active' | 'inactive'
  page?: number
  limit?: number
}

// Form schema for validation
export interface OutletFormSchema {
  name: string
  location: string
  contactPhone: string
  contactEmail: string
  managerId?: number | null
  status?: 'active' | 'inactive'
}