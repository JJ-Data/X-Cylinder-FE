'use client'

import SignIn from '@/components/auth/SignIn'
import { onSignInWithCredentials } from '@/server/actions/auth/handleSignIn'
import handleOauthSignIn from '@/server/actions/auth/handleOauthSignIn'
import { REDIRECT_URL_KEY } from '@/constants/app.constant'
import { useSearchParams, useRouter } from 'next/navigation'
import type {
    OnSignInPayload,
    OnOauthSignInPayload,
} from '@/components/auth/SignIn'

const SignInClient = () => {
    const searchParams = useSearchParams()
    const router = useRouter()
    const callbackUrl = searchParams.get(REDIRECT_URL_KEY)

    const handleSignIn = async ({
        values,
        setSubmitting,
        setMessage,
    }: OnSignInPayload) => {
        setSubmitting(true)

        try {
            const data = await onSignInWithCredentials(values, callbackUrl || '')
            
            if (data?.error) {
                setMessage(data.error as string)
                setSubmitting(false)
            } else if (data?.success && data?.redirectTo) {
                // Use window.location.href for full page navigation
                // This ensures the session is properly loaded
                console.log('[SignInClient] Sign-in successful, redirecting to:', data.redirectTo)
                window.location.href = data.redirectTo
            }
        } catch (error) {
            console.error('[SignInClient] Error during sign-in:', error)
            setMessage('An error occurred during sign-in')
            setSubmitting(false)
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
