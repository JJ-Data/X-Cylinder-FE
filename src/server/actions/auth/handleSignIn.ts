'use server'

import { signIn } from '@/auth'
import { AuthError } from 'next-auth'
import type { SignInCredential } from '@/@types/auth'

export const onSignInWithCredentials = async (
    { email, password }: SignInCredential,
    callbackUrl?: string,
) => {
    console.log('[handleSignIn] Starting sign-in process', {
        email,
        hasPassword: !!password,
        callbackUrl,
        timestamp: new Date().toISOString(),
    })

    try {
        console.log('[handleSignIn] Calling NextAuth signIn')

        // Call NextAuth signIn with redirect: false to handle redirect on client
        const result = await signIn('credentials', {
            email,
            password,
            redirect: false,
        })

        console.log('[handleSignIn] Sign-in result:', result)
        console.log('[handleSignIn] Sign-in completed successfully')

        // Return success - client-side will handle role-based redirect
        return {
            success: true,
            callbackUrl, // Pass original callback URL for client-side handling
        }
    } catch (error) {
        console.error('[handleSignIn] Sign-in error:', {
            error,
            errorType: error instanceof AuthError ? 'AuthError' : 'Unknown',
            errorMessage:
                error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
        })

        if (error instanceof AuthError) {
            // Handle authentication errors
            switch ((error as any).type) {
                case 'CredentialsSignin':
                    return { error: 'Invalid credentials!' }
                default:
                    return { error: 'Something went wrong!' }
            }
        }

        return { error: 'Authentication error occurred' }
    }
}
