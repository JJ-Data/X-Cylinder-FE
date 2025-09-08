'use server'
import AxiosServer from '@/services/axios/AxiosServer'
import type { SignInCredential } from '@/@types/auth'

// Define the actual backend response structure
interface BackendLoginResponse {
    success: boolean
    message?: string
    data?: {
        user: any
        tokens: {
            accessToken: string
            refreshToken: string
        }
    }
}

const validateCredential = async (values: SignInCredential) => {
    const { email, password } = values

    try {
        // Direct API call to backend (like ECME calls mock data)
        const response = await AxiosServer.post<BackendLoginResponse>(
            '/auth/login',
            {
                email,
                password,
            },
        )

        console.log('[ValidateCredential] Backend response:', {
            success: response.data.success,
            user: response.data.data?.user,
            userRole: response.data.data?.user?.role,
            hasTokens: !!response.data.data?.tokens,
        })

        if (
            response.data.success &&
            response.data.data?.user &&
            response.data.data?.tokens
        ) {
            const user = response.data.data.user
            const tokens = response.data.data.tokens

            // Debug: Log the original role from backend
            console.log(
                '[ValidateCredential] Original role from backend:',
                user.role,
            )

            // Keep the original backend role format to maintain API compatibility
            // No role mapping needed - use backend role names directly
            const role = user.role

            console.log(
                '[ValidateCredential] Using backend role (no mapping):',
                role,
            )

            // Ensure we have a valid ID
            const userId = user.userId || user.id?.toString()
            if (!userId) {
                return null
            }

            // Return user data with all fields needed by dashboard AND the accessToken
            return {
                id: userId,
                name: user.userName || `${user.firstName} ${user.lastName}`,
                email: user.email,
                image: user.avatar || '',
                // Additional fields for our dashboard - use backend role format
                role,
                outletId: user.outletId?.toString(),
                status: user.isActive ? 'ACTIVE' : 'INACTIVE',
                // Store the backend JWT token
                accessToken: tokens.accessToken,
            }
        }

        return null
    } catch (error) {
        // Simple error handling like ECME
        console.error('[ValidateCredential] Authentication failed:', error)
        return null
    }
}

export default validateCredential
