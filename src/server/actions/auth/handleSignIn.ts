'use server'

import { signIn } from '@/auth'
import appConfig from '@/configs/app.config'
import { AuthError } from 'next-auth'
import type { SignInCredential } from '@/@types/auth'
import { sanitizeCallbackUrl } from '@/utils/route-validation'

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
        console.log('[handleSignIn] Calling NextAuth signIn with:', {
            authURL: process.env.AUTH_URL,
            authSecret: process.env.AUTH_SECRET ? 'set' : 'missing',
        })
        
        // Call NextAuth signIn without redirect
        const result = await signIn('credentials', {
            email,
            password,
            redirect: false,
        })
        
        console.log('[handleSignIn] Sign-in result:', result)
        
        // Sanitize and validate the callback URL
        const sanitizedRedirectUrl = sanitizeCallbackUrl(callbackUrl)
        
        console.log('[handleSignIn] URL validation result:', {
            originalCallbackUrl: callbackUrl,
            sanitizedRedirectUrl,
            isCallbackValid: callbackUrl === sanitizedRedirectUrl
        })
        
        return { 
            success: true, 
            redirectTo: sanitizedRedirectUrl
        }
        
    } catch (error) {
        console.error('[handleSignIn] Sign-in error:', {
            error,
            errorType: error instanceof AuthError ? 'AuthError' : 'Unknown',
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
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
