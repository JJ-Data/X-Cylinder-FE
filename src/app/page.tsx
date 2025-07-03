import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { getRoleBasedPath } from '@/configs/app.config'

export default async function HomePage() {
    const session = await auth()
    
    if (!session) {
        redirect('/sign-in')
    }
    
    // Redirect to role-based dashboard
    const role = session.user.role?.toLowerCase() || 'customer'
    const dashboard = getRoleBasedPath(role)
    redirect(dashboard)
}