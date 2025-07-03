import { auth } from '@/auth'
import { getNavigationByRole } from '@/configs/navigation.config'
import { NavigationTree } from '@/@types/navigation'

export async function getNavigation(): Promise<NavigationTree[]> {
    const session = await auth()
    
    if (!session?.user?.role) {
        // Return empty navigation if no user or role
        return []
    }
    
    // Get navigation based on user role
    const navigation = getNavigationByRole(session.user.role)
    
    return navigation
}
