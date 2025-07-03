// Paginated API response structure from backend
export interface ApiPaginatedData<T> {
  [key: string]: T[] | any  // This allows for dynamic keys like 'cylinders', 'leases', 'refills', etc.
  page: number
  limit: number
  total: number
  totalPages: number
}

// Standard paginated response after transformation
export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface QueryParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  search?: string
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface ApiError {
  success: false
  message: string
  errors?: Record<string, string[]>
  statusCode: number
}