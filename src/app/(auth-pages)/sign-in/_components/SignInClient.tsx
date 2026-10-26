'use client'

import SignIn from '@/components/auth/SignIn'
import { onSignInWithCredentials } from '@/server/actions/auth/handleSignIn'
import handleOauthSignIn from '@/server/actions/auth/handleOauthSignIn'
import { REDIRECT_URL_KEY } from '@/constants/app.constant'
import { useSearchParams, useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useEffect, useRef, useState } from 'react'
import { getRoleBasedPath, CUSTOMER_PORTAL_ENABLED } from '@/configs/app.config'
import { sanitizeCallbackUrl } from '@/utils/route-validation'
import type {
    OnSignInPayload,
    OnOauthSignInPayload,
} from '@/components/auth/SignIn'

const CUSTOMER_PORTAL_CLOSED_MESSAGE =
    'Online customer accounts are not available yet. Please visit your outlet and our staff will help you.'

const SignInClient = () => {
    const searchParams = useSearchParams()
    const router = useRouter()
    const { data: session, status } = useSession()
    const [isRedirecting, setIsRedirecting] = useState(false)
    const fallbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
    const clearedBadSession = useRef(false)
    const formControls = useRef<{
        setMessage?: (message: string) => void
        setSubmitting?: (value: boolean) => void
    }>({})
    const callbackUrl = searchParams.get(REDIRECT_URL_KEY)

    useEffect(() => {
        return () => {
            if (fallbackTimer.current) clearTimeout(fallbackTimer.current)
        }
    }, [])

    // Handle client-side redirect after authentication
    useEffect(() => {
        console.log('[SignInClient] Session status changed:', {
            status,
            hasSession: !!session,
            isRedirecting,
            timestamp: new Date().toISOString(),
        })

        // A session whose token refresh failed counts as signed out on the server.
        // Clear it here, otherwise this page and the middleware redirect each other forever.
        if (status === 'authenticated' && (session as any)?.error) {
            if (fallbackTimer.current) clearTimeout(fallbackTimer.current)
            if (!clearedBadSession.current) {
                clearedBadSession.current = true
                console.warn(
                    '[SignInClient] Session has a failed token refresh, signing out:',
                    (session as any).error,
                )
                signOut({ redirect: false })
            }
            return
        }

        if (status === 'authenticated' && session?.user && !isRedirecting) {
            setIsRedirecting(true)
            if (fallbackTimer.current) clearTimeout(fallbackTimer.current)

            // Get backend role for routing (matches our role aliases)
            const userRole =
                (session.user as any)?.backendRole || session.user?.role

            // Customer portal is switched off: sign them out and explain.
            if (
                !CUSTOMER_PORTAL_ENABLED &&
                getRoleBasedPath(String(userRole)).startsWith('/customer')
            ) {
                signOut({ redirect: false })
                formControls.current.setSubmitting?.(false)
                formControls.current.setMessage?.(
                    CUSTOMER_PORTAL_CLOSED_MESSAGE,
                )
                return
            }

            console.log('[SignInClient] ===== CLIENT-SIDE REDIRECT LOGIC =====')
            console.log('[SignInClient] Session data:', {
                frontendRole: session.user.role,
                backendRole: (session.user as any)?.backendRole,
                userRoleForRouting: userRole,
                userId: session.user.id,
                callbackUrl,
                timestamp: new Date().toISOString(),
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
                reason: callbackUrl
                    ? 'callback URL provided'
                    : 'no callback URL - using role-based path',
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
        formControls.current = { setMessage, setSubmitting }
        setSubmitting(true)
        setIsRedirecting(false) // Reset redirect state

        try {
            const data = await onSignInWithCredentials(
                values,
                callbackUrl || '',
            )

            if (data?.error) {
                setMessage(data.error as string)
                setSubmitting(false)
            } else if (data?.success) {
                console.log(
                    '[SignInClient] Sign-in successful, refreshing session...',
                )

                // Refresh the router to trigger session update.
                // The effect above handles the redirect once the session arrives.
                router.refresh()

                console.log(
                    '[SignInClient] Router refreshed, waiting for session update...',
                )

                fallbackTimer.current = setTimeout(() => {
                    // Session never arrived: reload so the server session is picked up.
                    // The middleware then sends signed-in users to their own dashboard.
                    window.location.reload()
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
