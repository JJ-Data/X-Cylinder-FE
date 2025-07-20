'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'

/**
 * Provider component that monitors NextAuth session for authenticated pages
 * Since we're using NextAuth sessions, we don't need manual token refresh
 */
export function TokenRefreshProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  
  useEffect(() => {
    // Only redirect if we're certain the user is unauthenticated
    // Don't redirect during loading or if we're already on the sign-in page
    if (status === 'unauthenticated' && pathname !== '/sign-in') {
      console.log('[TokenRefreshProvider] User is unauthenticated, redirecting to sign-in')
      router.push('/sign-in')
    }
  }, [status, router, pathname])
  
  return <>{children}</>
}