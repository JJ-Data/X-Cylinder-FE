import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { cookies } from 'next/headers'

export async function GET() {
    try {
        const session = await auth()
        const cookieStore = await cookies()
        const allCookies = cookieStore.getAll()
        
        // Check for all possible session token names
        const possibleSessionTokenNames = [
            'next-auth.session-token',
            'authjs.session-token',
            '__Secure-authjs.session-token',
            '__Host-authjs.session-token',
            'next-auth.session-token.0',
            'authjs.session-token.0',
        ]
        
        const sessionTokens = possibleSessionTokenNames.map(name => ({
            name,
            cookie: cookieStore.get(name),
        })).filter(item => item.cookie)
        
        // List all cookies with authjs or next-auth prefix
        const authCookies = allCookies.filter(
            c => c.name.includes('authjs') || c.name.includes('next-auth')
        )
        
        return NextResponse.json({
            session,
            sessionTokens: sessionTokens.map(st => ({
                name: st.name,
                present: true,
                valueLength: st.cookie?.value?.length || 0,
            })),
            authCookies: authCookies.map(c => ({
                name: c.name,
                valueLength: c.value?.length || 0,
            })),
            allCookieNames: allCookies.map(c => c.name),
            environment: {
                AUTH_URL: process.env.AUTH_URL,
                NEXTAUTH_URL: process.env.NEXTAUTH_URL,
                NODE_ENV: process.env.NODE_ENV,
                AUTH_SECRET_LENGTH: process.env.AUTH_SECRET?.length || 0,
            }
        })
    } catch (error) {
        return NextResponse.json({
            error: 'Failed to get session',
            message: error instanceof Error ? error.message : 'Unknown error',
        }, { status: 500 })
    }
}