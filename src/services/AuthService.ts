import ApiService from './ApiService'
import AxiosServer from './axios/AxiosServer'

import type {
    SignInCredential,
    SignInResponse,
    SignUpCredential,
    ForgotPassword,
    ResetPassword,
    SignUpResponse,
    User,
} from '@/@types/auth'

// Helper to determine if we're running on the server
const isServer = typeof window === 'undefined'

// Sign in with email and password
export async function apiSignIn(data: SignInCredential) {
    // For server-side calls (like in validateCredential), use AxiosServer directly
    if (isServer) {
        try {
            const response = await AxiosServer.post<SignInResponse>('/auth/login', data)
            return response.data
        } catch (error: any) {
            console.error('[apiSignIn Server Error]', error.response?.data || error.message)
            throw error
        }
    }
    
    // For client-side calls, use the proxy
    const response = await ApiService.fetchDataWithAxios<SignInResponse>({
        url: '/auth/login',
        method: 'post',
        data,
    })
    
    return response
}

// Sign up new customer
export async function apiSignUp(data: SignUpCredential) {
    if (isServer) {
        const response = await AxiosServer.post<SignUpResponse>('/auth/register', {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            password: data.password,
        })
        return response.data
    }
    
    const response = await ApiService.fetchDataWithAxios<SignUpResponse>({
        url: '/auth/register',
        method: 'post',
        data: {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            password: data.password,
        },
    })
    
    return response
}

// Request password reset
export async function apiForgotPassword<T>(data: ForgotPassword) {
    if (isServer) {
        const response = await AxiosServer.post<T>('/auth/forgot-password', data)
        return response.data
    }
    
    return ApiService.fetchDataWithAxios<T>({
        url: '/auth/forgot-password',
        method: 'post',
        data,
    })
}

// Reset password with token
export async function apiResetPassword<T>(data: ResetPassword) {
    if (isServer) {
        const response = await AxiosServer.post<T>('/auth/reset-password', {
            password: data.newPassword,
            confirmPassword: data.confirmPassword,
            token: data.token,
        })
        return response.data
    }
    
    return ApiService.fetchDataWithAxios<T>({
        url: '/auth/reset-password',
        method: 'post',
        data: {
            password: data.newPassword,
            confirmPassword: data.confirmPassword,
            token: data.token,
        },
    })
}

// Refresh access token
export async function apiRefreshToken() {
    try {
        if (isServer) {
            // Server-side refresh is not supported
            return null
        }
        
        const response = await ApiService.fetchDataWithAxios<{
            success: boolean
            data: {
                user: User
            }
        }>({
            url: '/auth/refresh',
            method: 'post',
        })
        
        return response
    } catch (error) {
        // Tokens are invalid or expired
        return null
    }
}

// Sign out user
export async function apiSignOut() {
    try {
        if (isServer) {
            await AxiosServer.post('/auth/logout')
        } else {
            await ApiService.fetchDataWithAxios({
                url: '/auth/logout',
                method: 'post',
            })
        }
    } catch (error) {
        // Ignore logout errors
    }
}

// Get current user info
export async function apiGetUserInfo() {
    if (isServer) {
        const response = await AxiosServer.get<{
            success: boolean
            data: User
            message?: string
        }>('/auth/me')
        return response.data.data
    }
    
    const response = await ApiService.fetchDataWithAxios<{
        success: boolean
        data: User
        message?: string
    }>({
        url: '/auth/me',
        method: 'get',
    })
    
    return response.data
}

// Verify email with token
export async function apiVerifyEmail(token: string) {
    if (isServer) {
        const response = await AxiosServer.post<{ status: string; message: string }>('/auth/verify-email', { token })
        return response.data
    }
    
    return ApiService.fetchDataWithAxios<{ status: string; message: string }>({
        url: '/auth/verify-email',
        method: 'post',
        data: { token },
    })
}

// Resend verification email
export async function apiResendVerificationEmail(email: string) {
    if (isServer) {
        const response = await AxiosServer.post<{ status: string; message: string }>('/auth/resend-verification', { email })
        return response.data
    }
    
    return ApiService.fetchDataWithAxios<{ status: string; message: string }>({
        url: '/auth/resend-verification',
        method: 'post',
        data: { email },
    })
}