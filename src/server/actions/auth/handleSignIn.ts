'use server'

import { signIn } from '@/auth'
import { getRoleBasedPath } from '@/configs/app.config'
import { AuthError } from 'next-auth'
import validateCredential from '../user/validateCredential'
import type { SignInCredential } from '@/@types/auth'

export const onSignInWithCredentials = async (
    { email, password }: SignInCredential,
    callbackUrl?: string,
) => {
    try {
        // Note: We're now authenticating via client-side first to set cookies
        // The validateCredential call here is to get user info for NextAuth session
        const user = await validateCredential({ email, password })
        if (!user) {
            return { error: 'Invalid credentials!' }
        }
        
        // Determine redirect URL
        let redirectTo = callbackUrl
        
        // If callback URL is root, empty, or not provided, use role-based redirect
        if (!redirectTo || redirectTo === '/' || redirectTo === '') {
            const role = user.role?.toLowerCase() || 'customer'
            redirectTo = getRoleBasedPath(role)
            console.log('[SignIn] Role-based redirect:', { role, redirectTo })
        }
        
        await signIn('credentials', {
            email,
            password,
            redirect: false, // Don't let NextAuth handle the redirect
        })
        
        // Return success with the redirect URL
        return { success: true, redirectTo }
    } catch (error) {
        if (error instanceof AuthError) {
            /** Customize error message based on AuthError */
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            switch ((error.type as any).type) {
                case 'CredentialsSignin':
                    return { error: 'Invalid credentials!' }
                default:
                    return { error: 'Something went wrong!' }
            }
        }
        throw error
    }
}
