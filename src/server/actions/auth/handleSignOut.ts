'use server'

import { signOut } from '@/auth'
import appConfig from '@/configs/app.config'
import { cookies } from 'next/headers'

const handleSignOut = async () => {
    try {
        // Get the backend URL
        const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1'
        
        // Get cookies to forward to backend
        const cookieStore = await cookies()
        const cookieHeader = cookieStore.toString()
        
        // Call backend logout endpoint to clear HTTP-only cookies
        const response = await fetch(`${BACKEND_URL}/auth/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': cookieHeader
            },
            credentials: 'include'
        })
        
        if (!response.ok) {
            console.error('Backend logout failed:', response.status)
        }
    } catch (error) {
        // Even if the backend call fails, proceed with client-side cleanup
        console.error('Backend logout error:', error)
    }
    
    // Clear the NextAuth session and redirect
    await signOut({ redirectTo: appConfig.unAuthenticatedEntryPath })
}

export default handleSignOut
