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
import React from 'react'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'

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
      toast.push(
        React.createElement(Notification, {
          title: 'Success',
          type: 'success'
        }, 'User created successfully')
      )
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
      toast.push(
        React.createElement(Notification, {
          title: 'Success',
          type: 'success'
        }, 'User updated successfully')
      )
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
      toast.push(
        React.createElement(Notification, {
          title: 'Success',
          type: 'success'
        }, 'User status updated')
      )
      return response.data
    }
  )

  // Delete user
  const deleteUser = useSWRMutation(
    'delete-user',
    async (_, { arg }: { arg: number }) => {
      const response = await userService.deleteUser(arg)
      await mutate(['users'])
      toast.push(
        React.createElement(Notification, {
          title: 'Success',
          type: 'success'
        }, 'User deleted successfully')
      )
      return response.data
    }
  )

  // Change password
  const changePassword = useSWRMutation(
    'change-password',
    async (_, { arg }: { arg: { id: number; newPassword: string } }) => {
      const response = await userService.changeUserPassword(arg.id, arg.newPassword)
      toast.push(
        React.createElement(Notification, {
          title: 'Success',
          type: 'success'
        }, 'Password changed successfully')
      )
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
  // Register customer (now auto-activates)
  const registerCustomer = useSWRMutation(
    'register-customer',
    async (_, { arg }: { arg: CustomerRegistrationDto }) => {
      try {
        const response = await customerService.registerCustomer(arg)
        await mutate(['users'])
        toast.push(
          React.createElement(Notification, {
            title: 'Success',
            type: 'success'
          }, 'Customer registered and activated successfully')
        )
        return response.data
      } catch (error: any) {
        // Re-throw error with axios structure preserved for proper error handling
        throw error
      }
    }
  )

  /**
   * @deprecated Payment is no longer required. Customers are auto-activated.
   * Kept for backward compatibility only.
   */
  const activateCustomer = useSWRMutation(
    'activate-customer',
    async (_, { arg }: { arg: CustomerActivationDto }) => {
      const response = await customerService.activateCustomer(arg)
      await mutate(['users'])
      await mutate(['user', arg.userId])
      toast.push(
        React.createElement(Notification, {
          title: 'Success',
          type: 'success'
        }, 'Customer activated successfully')
      )
      return response.data
    }
  )

  /**
   * @deprecated Payment simulation no longer needed.
   * Kept for backward compatibility only.
   */
  const simulatePayment = useSWRMutation(
    'simulate-payment',
    async (_, { arg }: { arg: { userId: number; amount: number } }) => {
      const response = await customerService.simulatePayment(arg.userId, arg.amount)
      await mutate(['users'])
      await mutate(['user', arg.userId])
      toast.push(
        React.createElement(Notification, {
          title: 'Success',
          type: 'success'
        }, 'Payment simulated successfully')
      )
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