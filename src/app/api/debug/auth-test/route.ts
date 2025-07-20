import { NextResponse } from 'next/server'
import { signIn } from '@/auth'
import validateCredential from '@/server/actions/user/validateCredential'

export async function POST() {
    try {
        // First test the credential validation
        const credentials = {
            email: 'admin@cylinderx.com',
            password: 'admin123'
        }
        
        console.log('[Auth Test] Testing credential validation...')
        const user = await validateCredential(credentials)
        
        if (!user) {
            return NextResponse.json({
                error: 'Credential validation failed',
                phase: 'validateCredential'
            }, { status: 401 })
        }
        
        console.log('[Auth Test] User validated:', {
            id: user.id,
            email: user.email,
            role: user.role,
            hasAccessToken: !!user.accessToken
        })
        
        // Test the auth config authorize function
        const authConfig = await import('@/configs/auth.config')
        const authorizeResult = await authConfig.default.providers[0].authorize!(
            credentials,
            {} as any
        )
        
        console.log('[Auth Test] Authorize result:', {
            hasResult: !!authorizeResult,
            resultId: authorizeResult?.id,
            resultEmail: authorizeResult?.email,
        })
        
        return NextResponse.json({
            validateCredential: {
                success: true,
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    hasAccessToken: !!user.accessToken,
                    accessTokenLength: user.accessToken?.length || 0,
                }
            },
            authorize: {
                success: !!authorizeResult,
                result: authorizeResult ? {
                    id: authorizeResult.id,
                    email: authorizeResult.email,
                    hasName: !!authorizeResult.name,
                } : null
            },
            environment: {
                AUTH_SECRET_LENGTH: process.env.AUTH_SECRET?.length || 0,
                AUTH_URL: process.env.AUTH_URL,
                NODE_ENV: process.env.NODE_ENV,
            }
        })
    } catch (error) {
        console.error('[Auth Test] Error:', error)
        return NextResponse.json({
            error: error instanceof Error ? error.message : 'Unknown error',
            phase: 'unknown'
        }, { status: 500 })
    }
}