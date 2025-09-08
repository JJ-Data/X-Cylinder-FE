'use client'

import SignIn from '@/components/auth/SignIn'
import { onSignInWithCredentials } from '@/server/actions/auth/handleSignIn'
import handleOauthSignIn from '@/server/actions/auth/handleOauthSignIn'
import { REDIRECT_URL_KEY } from '@/constants/app.constant'
import { useSearchParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { getRoleBasedPath } from '@/configs/app.config'
import { sanitizeCallbackUrl } from '@/utils/route-validation'
import type {
    OnSignInPayload,
    OnOauthSignInPayload,
} from '@/components/auth/SignIn'

const SignInClient = () => {
    const searchParams = useSearchParams()
    const router = useRouter()
    const { data: session, status } = useSession()
    const [isRedirecting, setIsRedirecting] = useState(false)
    const callbackUrl = searchParams.get(REDIRECT_URL_KEY)

    // Handle client-side redirect after authentication
    useEffect(() => {
        console.log('[SignInClient] Session status changed:', {
            status,
            hasSession: !!session,
            isRedirecting,
            timestamp: new Date().toISOString()
        })

        if (status === 'authenticated' && session?.user && !isRedirecting) {
            setIsRedirecting(true)
            
            // Get backend role for routing (matches our role aliases)
            const userRole = (session.user as any)?.backendRole || session.user?.role
            
            console.log('[SignInClient] ===== CLIENT-SIDE REDIRECT LOGIC =====')
            console.log('[SignInClient] Session data:', {
                frontendRole: session.user.role,
                backendRole: (session.user as any)?.backendRole,
                userRoleForRouting: userRole,
                userId: session.user.id,
                callbackUrl,
                timestamp: new Date().toISOString()
            })

            // Determine redirect URL using role-based logic
            let redirectUrl: string
            
            if (callbackUrl) {
                // Validate callback URL with user role
                redirectUrl = sanitizeCallbackUrl(callbackUrl, userRole)
            } else {
                // No callback URL - use role-based dashboard
                redirectUrl = getRoleBasedPath(userRole)
            }

            console.log('[SignInClient] Redirect decision:', {
                originalCallbackUrl: callbackUrl,
                finalRedirectUrl: redirectUrl,
                userRole,
                reason: callbackUrl ? 'callback URL provided' : 'no callback URL - using role-based path'
            })

            // Perform redirect
            console.log('[SignInClient] ✅ Redirecting to:', redirectUrl)
            router.push(redirectUrl)
        }
    }, [status, session, callbackUrl, router, isRedirecting])

    const handleSignIn = async ({
        values,
        setSubmitting,
        setMessage,
    }: OnSignInPayload) => {
        setSubmitting(true)
        setIsRedirecting(false) // Reset redirect state

        try {
            const data = await onSignInWithCredentials(values, callbackUrl || '')
            
            if (data?.error) {
                setMessage(data.error as string)
                setSubmitting(false)
            } else if (data?.success) {
                console.log('[SignInClient] Sign-in successful, refreshing session...')
                
                // Refresh the router to trigger session update
                // This will cause NextAuth to fetch the new session from the server
                router.refresh()
                
                // Keep submitting state true - the useEffect will handle redirect
                // once the session is updated from the refresh
                console.log('[SignInClient] Router refreshed, waiting for session update...')
                
                // Add a timeout safety mechanism (5 seconds)
                // If session doesn't update within 5 seconds, try manual redirect
                setTimeout(() => {
                    if (status !== 'authenticated') {
                        console.log('[SignInClient] Session update timeout, attempting manual redirect...')
                        // Force a page reload as last resort
                        // This will fetch the session from server on reload
                        // Use the default authenticated entry path or callback URL
                        window.location.href = callbackUrl || getRoleBasedPath('admin')
                    }
                }, 5000)
            }
        } catch (error) {
            console.error('[SignInClient] Error during sign-in:', error)
            setMessage('An error occurred during sign-in')
            setSubmitting(false)
            setIsRedirecting(false)
        }
    }

    const handleOAuthSignIn = async ({ type }: OnOauthSignInPayload) => {
        if (type === 'google') {
            await handleOauthSignIn('google')
        }
        if (type === 'github') {
            await handleOauthSignIn('github')
        }
    }

    return <SignIn onSignIn={handleSignIn} onOauthSignIn={handleOAuthSignIn} />
}

export default SignInClient
