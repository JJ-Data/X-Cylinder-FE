'use client'

import { useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { tokenRefreshService } from '@/services/auth/token-refresh.service'

/**
 * Hook to handle proactive token refresh
 * Since we're using HTTP-only cookies, we can't check token expiration on client
 * Instead, we'll refresh the token periodically before it expires
 */
export function useTokenRefresh() {
  const { data: session, status } = useSession()
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null)
  
  useEffect(() => {
    // Only run if user is authenticated
    if (status !== 'authenticated' || !session) {
      // Clear any existing interval
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
        refreshIntervalRef.current = null
      }
      return
    }
    
    // Set up interval to refresh token
    // Refresh every 10 minutes (access token expires in 15 minutes)
    const REFRESH_INTERVAL = 10 * 60 * 1000 // 10 minutes
    
    // Function to refresh token
    const refreshToken = async () => {
      try {
        console.log('Proactively refreshing token...')
        const success = await tokenRefreshService.refreshToken()
        if (!success) {
          console.error('Proactive token refresh failed')
        } else {
          console.log('Token refreshed successfully')
        }
      } catch (error) {
        console.error('Error during proactive token refresh:', error)
      }
    }
    
    // Initial refresh after 10 minutes
    refreshIntervalRef.current = setInterval(refreshToken, REFRESH_INTERVAL)
    
    // Cleanup on unmount or when session changes
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
        refreshIntervalRef.current = null
      }
    }
  }, [session, status])
  
  // Also refresh token when window regains focus after being inactive
  useEffect(() => {
    if (status !== 'authenticated') return
    
    let lastRefreshTime = Date.now()
    const INACTIVITY_THRESHOLD = 5 * 60 * 1000 // 5 minutes
    
    const handleFocus = async () => {
      const now = Date.now()
      const timeSinceLastRefresh = now - lastRefreshTime
      
      // If window was inactive for more than 5 minutes, refresh token
      if (timeSinceLastRefresh > INACTIVITY_THRESHOLD) {
        console.log('Refreshing token after window focus...')
        try {
          await tokenRefreshService.refreshToken()
          lastRefreshTime = now
        } catch (error) {
          console.error('Error refreshing token on focus:', error)
        }
      }
    }
    
    window.addEventListener('focus', handleFocus)
    
    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [status])
}