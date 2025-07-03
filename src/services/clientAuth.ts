import AxiosBase from './axios/AxiosBase'
import type { SignInCredential, SignInResponse } from '@/@types/auth'

// Client-side login that goes through the proxy
export async function clientSignIn(credentials: SignInCredential): Promise<SignInResponse> {
    try {
        console.log('[clientSignIn] Making login request through proxy...')
        const response = await AxiosBase.post<SignInResponse>('/auth/login', credentials)
        console.log('[clientSignIn] Response received:', {
            status: response.status,
            success: response.data?.success,
            hasUser: !!response.data?.data?.user,
            headers: response.headers
        })
        return response.data
    } catch (error: any) {
        console.error('[clientSignIn] Error:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        })
        throw error
    }
}