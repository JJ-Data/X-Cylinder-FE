import { NextResponse } from 'next/server'
import { auth } from '@/auth'

export async function GET() {
    try {
        console.log('[Test Session] Checking session...')
        
        const session = await auth()
        
        console.log('[Test Session] Session result:', {
            hasSession: !!session,
            sessionUser: session?.user,
            sessionExpires: session?.expires,
        })
        
        return NextResponse.json({
            success: true,
            session: session || null,
            timestamp: new Date().toISOString(),
        })
    } catch (error) {
        console.error('[Test Session] Error:', error)
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        }, { status: 500 })
    }
}