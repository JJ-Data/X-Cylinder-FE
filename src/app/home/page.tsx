import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { getRoleBasedPath } from '@/configs/app.config'

/**
 * Home page that redirects users to their appropriate dashboard
 * This handles the common /home route that users might try to access
 */
export default async function HomePage() {
    const session = await auth()
    
    if (!session) {
        // If not authenticated, redirect to sign-in
        redirect('/sign-in')
    }
    
    // Redirect to role-based dashboard
    const role = session.user.role?.toLowerCase() || 'customer'
    const dashboard = getRoleBasedPath(role)
    redirect(dashboard)
}