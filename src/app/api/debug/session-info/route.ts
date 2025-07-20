import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { cookies, headers } from 'next/headers'

export async function GET(request: NextRequest) {
    try {
        // Get session using auth()
        const session = await auth()
        
        // Get all cookies
        const cookieStore = await cookies()
        const allCookies = cookieStore.getAll()
        
        // Get headers
        const headersList = await headers()
        const cookieHeader = headersList.get('cookie')
        
        // Check for various cookie formats
        const cookieInfo = {
            total: allCookies.length,
            cookies: allCookies.map(c => ({
                name: c.name,
                valueLength: c.value?.length || 0,
                value: c.value ? c.value.substring(0, 20) + '...' : 'empty'
            })),
            authRelated: allCookies.filter(c => 
                c.name.includes('auth') || 
                c.name.includes('session') ||
                c.name.includes('csrf') ||
                c.name.includes('callback')
            ).map(c => c.name),
            headerCookie: cookieHeader ? 'present' : 'missing'
        }
        
        // Environment info
        const envInfo = {
            NODE_ENV: process.env.NODE_ENV,
            AUTH_URL: process.env.AUTH_URL,
            AUTH_SECRET: process.env.AUTH_SECRET ? 'set' : 'missing',
            AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST,
            NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        }
        
        // Session info
        const sessionInfo = {
            exists: !!session,
            user: session?.user || null,
            expires: session?.expires || null,
            accessToken: (session as any)?.accessToken ? 'present' : 'missing'
        }
        
        return NextResponse.json({
            timestamp: new Date().toISOString(),
            session: sessionInfo,
            cookies: cookieInfo,
            environment: envInfo,
            request: {
                url: request.url,
                method: request.method,
                headers: {
                    host: headersList.get('host'),
                    referer: headersList.get('referer'),
                    userAgent: headersList.get('user-agent'),
                }
            }
        })
    } catch (error) {
        return NextResponse.json({
            error: 'Failed to get session info',
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        }, { status: 500 })
    }
}