'use server'
import type { SignInCredential } from '@/@types/auth'
import { apiSignIn } from '@/services/AuthService'

const validateCredential = async (values: SignInCredential) => {
    try {
        // Call CylinderX API to authenticate
        const response = await apiSignIn(values)
        
        console.log('[ValidateCredential] API Response:', response)
        
        if (response.success && response.data?.user) {
            // Get full user info from the response
            const user = response.data.user
            
            console.log('[ValidateCredential] User from API:', user)
            
            // Map role to uppercase and handle special cases
            let role = user.role?.toUpperCase()
            if (role === 'REFILL_OP') {
                role = 'OPERATOR'
            }
            
            // Ensure we have a valid ID
            const userId = user.userId || user.id?.toString()
            if (!userId) {
                console.error('[ValidateCredential] User ID is missing')
                return null
            }
            
            const userData = {
                id: userId,
                email: user.email,
                name: user.userName || `${user.firstName} ${user.lastName}`,
                userName: user.userName || `${user.firstName} ${user.lastName}`,
                role: role as 'CUSTOMER' | 'STAFF' | 'OPERATOR' | 'ADMIN',
                outletId: user.outletId?.toString(),
                status: (user.isActive ? 'ACTIVE' : 'INACTIVE') as 'PENDING' | 'ACTIVE' | 'INACTIVE',
                // Additional fields not in NextAuth User type but used elsewhere
                avatar: user.avatar || '',
                paymentStatus: user.paymentStatus,
            }
            
            console.log('[ValidateCredential] Returning user data')
            
            return userData
        }
        
        return null
    } catch (error) {
        console.error('Authentication error:', error)
        return null
    }
}

export default validateCredential