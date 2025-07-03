'use client'

import { useTokenRefresh } from '@/hooks/useTokenRefresh'

/**
 * Provider component that handles token refresh for authenticated users
 * This should be placed at the root of authenticated pages
 */
export function TokenRefreshProvider({ children }: { children: React.ReactNode }) {
  // Initialize token refresh logic
  useTokenRefresh()
  
  // Just render children - the hook handles everything
  return <>{children}</>
}