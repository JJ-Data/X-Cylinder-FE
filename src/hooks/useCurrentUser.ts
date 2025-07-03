import useSWR from 'swr'
import { apiGetUserInfo } from '@/services/AuthService'
import type { User } from '@/@types/auth'

interface UseCurrentUserReturn {
  user: User | null
  isLoading: boolean
  isError: boolean
  mutate: () => void
}

/**
 * Hook to get current authenticated user info
 * Uses SWR for caching and automatic revalidation
 * 
 * @returns {UseCurrentUserReturn} Current user data and loading states
 */
export function useCurrentUser(): UseCurrentUserReturn {
  const { data, error, isLoading, mutate } = useSWR<User>(
    '/auth/me',
    apiGetUserInfo,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      shouldRetryOnError: false,
      dedupingInterval: 10000, // 10 seconds
    }
  )

  return {
    user: data || null,
    isLoading,
    isError: !!error,
    mutate,
  }
}

/**
 * Hook to check if user is authenticated
 * 
 * @returns {boolean} True if user is authenticated
 */
export function useIsAuthenticated(): boolean {
  const { user, isLoading } = useCurrentUser()
  return !isLoading && !!user
}

/**
 * Hook to check if user has a specific role
 * 
 * @param {string} role - Role to check
 * @returns {boolean} True if user has the role
 */
export function useHasRole(role: string): boolean {
  const { user } = useCurrentUser()
  return user?.role === role
}

/**
 * Hook to check if user has any of the specified roles
 * 
 * @param {string[]} roles - Array of roles to check
 * @returns {boolean} True if user has any of the roles
 */
export function useHasAnyRole(roles: string[]): boolean {
  const { user } = useCurrentUser()
  return !!user && roles.includes(user.role || '')
}