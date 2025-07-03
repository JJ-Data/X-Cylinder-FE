import { apiClient } from '../api-client'
import type { 
  CreateUserDto, 
  UpdateUserDto, 
  UserFilters,
  CustomerRegistrationDto,
  CustomerActivationDto 
} from '@/types/user'

// User Management API
export const userService = {
  // Get all users with filters
  async getUsers(filters?: UserFilters) {
    const params = new URLSearchParams()
    if (filters?.role) params.append('role', filters.role)
    if (filters?.outletId) params.append('outletId', filters.outletId.toString())
    if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString())
    if (filters?.search) params.append('search', filters.search)
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.pageSize) params.append('pageSize', filters.pageSize.toString())

    const response = await apiClient.get(`/users?${params.toString()}`)
    return response.data
  },

  // Get single user
  async getUser(id: number) {
    const response = await apiClient.get(`/users/${id}`)
    return response.data
  },

  // Create new user
  async createUser(data: CreateUserDto) {
    const response = await apiClient.post('/users', data)
    return response.data
  },

  // Update user
  async updateUser(id: number, data: UpdateUserDto) {
    const response = await apiClient.put(`/users/${id}`, data)
    return response.data
  },

  // Toggle user status
  async toggleUserStatus(id: number) {
    const response = await apiClient.patch(`/users/${id}/toggle-status`)
    return response.data
  },

  // Delete user
  async deleteUser(id: number) {
    const response = await apiClient.delete(`/users/${id}`)
    return response.data
  },

  // Change user password
  async changeUserPassword(id: number, newPassword: string) {
    const response = await apiClient.patch(`/users/${id}/change-password`, { newPassword })
    return response.data
  },

  // Get user activity logs
  async getUserActivity(id: number, page = 1, pageSize = 20) {
    const response = await apiClient.get(`/users/${id}/activity?page=${page}&pageSize=${pageSize}`)
    return response.data
  }
}

// Customer Management API
export const customerService = {
  // Register new customer
  async registerCustomer(data: CustomerRegistrationDto) {
    const response = await apiClient.post('/customers/register', data)
    return response.data
  },

  // Activate customer account
  async activateCustomer(data: CustomerActivationDto) {
    const response = await apiClient.post('/customers/activate', data)
    return response.data
  },

  // Simulate payment for customer
  async simulatePayment(userId: number, amount: number) {
    const response = await apiClient.post('/customers/simulate-payment', {
      userId,
      amount,
      paymentMethod: 'cash',
      paymentReference: `SIM-${Date.now()}`
    })
    return response.data
  },

  // Get customer details
  async getCustomer(id: number) {
    const response = await apiClient.get(`/customers/${id}`)
    return response.data
  },

  // Get customer lease history
  async getCustomerLeases(id: number) {
    const response = await apiClient.get(`/customers/${id}/leases`)
    return response.data
  },

  // Verify customer email
  async verifyEmail(token: string) {
    const response = await apiClient.post('/customers/verify-email', { token })
    return response.data
  }
}