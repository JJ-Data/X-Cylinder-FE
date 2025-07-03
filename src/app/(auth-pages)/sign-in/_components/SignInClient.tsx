'use client'

import SignIn from '@/components/auth/SignIn'
import { onSignInWithCredentials } from '@/server/actions/auth/handleSignIn'
import handleOauthSignIn from '@/server/actions/auth/handleOauthSignIn'
import { REDIRECT_URL_KEY } from '@/constants/app.constant'
import { useSearchParams } from 'next/navigation'
import { clientSignIn } from '@/services/clientAuth'
import type {
    OnSignInPayload,
    OnOauthSignInPayload,
} from '@/components/auth/SignIn'

const SignInClient = () => {
    const searchParams = useSearchParams()
    const callbackUrl = searchParams.get(REDIRECT_URL_KEY)

    const handleSignIn = async ({
        values,
        setSubmitting,
        setMessage,
    }: OnSignInPayload) => {
        setSubmitting(true)

        try {
            // Make a client-side login request first to set backend cookies
            const loginResponse = await clientSignIn(values)
            
            if (loginResponse.success) {
                // Backend cookies should now be set
                // Establish NextAuth session
                const data = await onSignInWithCredentials(values, callbackUrl || undefined)
                
                if (data?.error) {
                    setMessage(data.error as string)
                    setSubmitting(false)
                } else if (data?.success && data?.redirectTo) {
                    // Use window.location for a hard refresh to ensure proper page load
                    window.location.href = data.redirectTo
                }
            } else {
                setMessage(loginResponse.message || 'Invalid credentials')
                setSubmitting(false)
            }
        } catch (error: any) {
            console.error('[Sign In Error]', error)
            const errorMessage = error.response?.data?.message || 
                               error.response?.data?.error || 
                               error.message || 
                               'Invalid credentials'
            setMessage(errorMessage)
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
