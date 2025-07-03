import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'
import { userService, customerService } from '@/services/api/user.service'
import type { 
  CreateUserDto, 
  UpdateUserDto, 
  UserFilters,
  CustomerRegistrationDto,
  CustomerActivationDto
} from '@/types/user'
import { mutate } from 'swr'
import { toast } from 'react-hot-toast'

// Fetch users with filters
export function useUsers(filters?: UserFilters) {
  const key = filters ? ['users', filters] : ['users']
  
  return useSWR(key, async () => {
    const response = await userService.getUsers(filters)
    // Transform the response to match the expected structure
    return {
      users: response.data.data,
      totalPages: response.data.pagination.totalPages,
      total: response.data.pagination.totalItems
    }
  }, {
    revalidateOnFocus: false,
  })
}

// Fetch single user
export function useUser(id?: number) {
  return useSWR(
    id ? ['user', id] : null,
    async () => {
      const result = await userService.getUser(id!)
      // result is { success: true, data: { user data } }
      return result.data // Extract the user object from the response
    },
    {
      revalidateOnFocus: false,
    }
  )
}

// User mutations
export function useUserMutations() {
  // Create user
  const createUser = useSWRMutation(
    'create-user',
    async (_, { arg }: { arg: CreateUserDto }) => {
      const response = await userService.createUser(arg)
      await mutate(['users'])
      toast.success('User created successfully')
      return response.data
    }
  )

  // Update user
  const updateUser = useSWRMutation(
    'update-user',
    async (_, { arg }: { arg: { id: number; data: UpdateUserDto } }) => {
      const response = await userService.updateUser(arg.id, arg.data)
      await mutate(['users'])
      await mutate(['user', arg.id])
      toast.success('User updated successfully')
      return response.data
    }
  )

  // Toggle user status
  const toggleUserStatus = useSWRMutation(
    'toggle-user-status',
    async (_, { arg }: { arg: number }) => {
      const response = await userService.toggleUserStatus(arg)
      await mutate(['users'])
      await mutate(['user', arg])
      toast.success('User status updated')
      return response.data
    }
  )

  // Delete user
  const deleteUser = useSWRMutation(
    'delete-user',
    async (_, { arg }: { arg: number }) => {
      const response = await userService.deleteUser(arg)
      await mutate(['users'])
      toast.success('User deleted successfully')
      return response.data
    }
  )

  // Change password
  const changePassword = useSWRMutation(
    'change-password',
    async (_, { arg }: { arg: { id: number; newPassword: string } }) => {
      const response = await userService.changeUserPassword(arg.id, arg.newPassword)
      toast.success('Password changed successfully')
      return response.data
    }
  )

  return {
    createUser,
    updateUser,
    toggleUserStatus,
    deleteUser,
    changePassword
  }
}

// Customer-specific hooks
export function useCustomerMutations() {
  // Register customer
  const registerCustomer = useSWRMutation(
    'register-customer',
    async (_, { arg }: { arg: CustomerRegistrationDto }) => {
      const response = await customerService.registerCustomer(arg)
      await mutate(['users'])
      toast.success('Customer registered successfully')
      return response.data
    }
  )

  // Activate customer
  const activateCustomer = useSWRMutation(
    'activate-customer',
    async (_, { arg }: { arg: CustomerActivationDto }) => {
      const response = await customerService.activateCustomer(arg)
      await mutate(['users'])
      await mutate(['user', arg.userId])
      toast.success('Customer activated successfully')
      return response.data
    }
  )

  // Simulate payment
  const simulatePayment = useSWRMutation(
    'simulate-payment',
    async (_, { arg }: { arg: { userId: number; amount: number } }) => {
      const response = await customerService.simulatePayment(arg.userId, arg.amount)
      await mutate(['users'])
      await mutate(['user', arg.userId])
      toast.success('Payment simulated successfully')
      return response.data
    }
  )

  return {
    registerCustomer,
    activateCustomer,
    simulatePayment
  }
}

// User activity hook
export function useUserActivity(userId?: number, page = 1, pageSize = 20) {
  return useSWR(
    userId ? ['user-activity', userId, page, pageSize] : null,
    async () => {
      try {
        const response = await userService.getUserActivity(userId!, page, pageSize)
        return response.data
      } catch (error: any) {
        // Handle 404 or other errors gracefully
        // Don't log API errors as they're already logged by axios interceptor
        if (error?.response?.status === 404) {
          // Activity endpoint doesn't exist, return empty data
          return { activities: [] }
        }
        // For other errors, return empty data
        return { activities: [] }
      }
    },
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false, // Don't retry if the endpoint doesn't exist
      onError: () => {
        // Suppress error handling as we handle it in the fetcher
      }
    }
  )
}