'use client'

import { useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'

/**
 * Provider component that monitors the NextAuth session for authenticated pages.
 * The access token itself is refreshed inside the NextAuth `jwt` callback
 * (see src/configs/auth.config.ts) - this just reacts to the outcome:
 * redirects unauthenticated users, and signs out if a background refresh failed.
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

  useEffect(() => {
    if ((session as any)?.error === 'RefreshAccessTokenError') {
      console.log('[TokenRefreshProvider] Refresh token expired, signing out')
      signOut({ callbackUrl: '/sign-in' })
    }
  }, [session])

  return <>{children}</>
}