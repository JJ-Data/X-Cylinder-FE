import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
    try {
        // Test 1: Check raw cookies
        const cookieStore = await cookies()
        const allCookies = cookieStore.getAll()
        
        // Test 2: Check auth session
        const session = await auth()
        
        // Test 3: Check request headers
        const cookieHeader = request.headers.get('cookie')
        
        // Test 4: Check for specific auth cookies
        const authCookies = allCookies.filter(c => 
            c.name.includes('auth') || 
            c.name.includes('session') ||
            c.name.includes('csrf') ||
            c.name.includes('callback')
        )
        
        return NextResponse.json({
            timestamp: new Date().toISOString(),
            tests: {
                rawCookies: {
                    count: allCookies.length,
                    names: allCookies.map(c => c.name),
                },
                authCookies: {
                    count: authCookies.length,
                    cookies: authCookies.map(c => ({
                        name: c.name,
                        hasValue: !!c.value,
                        valueLength: c.value?.length || 0
                    }))
                },
                session: {
                    exists: !!session,
                    user: session?.user || null,
                    expires: session?.expires || null,
                },
                headers: {
                    hasCookieHeader: !!cookieHeader,
                    cookieHeaderLength: cookieHeader?.length || 0,
                },
                environment: {
                    NODE_ENV: process.env.NODE_ENV,
                    AUTH_URL: process.env.AUTH_URL,
                    AUTH_SECRET_EXISTS: !!process.env.AUTH_SECRET,
                    AUTH_SECRET_LENGTH: process.env.AUTH_SECRET?.length || 0,
                }
            }
        })
    } catch (error) {
        return NextResponse.json({
            error: 'Test failed',
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        }, { status: 500 })
    }
}