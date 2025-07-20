import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()
    
    // Also get cookies from request headers
    const cookieHeader = request.headers.get('cookie')
    
    return NextResponse.json({
        serverCookies: allCookies.map(c => ({
            name: c.name,
            value: c.value ? 'present' : 'missing',
            valueLength: c.value?.length || 0
        })),
        cookieHeader: cookieHeader || 'No cookie header',
        parsedCookies: cookieHeader ? 
            cookieHeader.split(';').map(c => {
                const [name, ...valueParts] = c.trim().split('=')
                return {
                    name,
                    hasValue: valueParts.length > 0
                }
            }) : [],
        environment: {
            NODE_ENV: process.env.NODE_ENV,
            AUTH_URL: process.env.AUTH_URL,
            NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        }
    })
}