export type SignInCredential = {
    email: string
    password: string
}

export type SignInResponse = {
    success: boolean
    message?: string
    data: {
        user: User
    }
}

export type SignUpResponse = {
    success: boolean
    message?: string
    data: {
        user: User
    }
}

export type SignUpCredential = {
    firstName: string
    lastName: string
    email: string
    password: string
    phone?: string
}

export type ForgotPassword = {
    email: string
}

export type ResetPassword = {
    newPassword: string
    confirmPassword: string
    token: string
}

export type AuthRequestStatus = 'success' | 'failed' | ''

export type AuthResult = Promise<{
    status: AuthRequestStatus
    message: string
}>

export type User = {
    id?: number | null
    userId?: string | null
    avatar?: string | null
    userName?: string | null
    firstName?: string | null
    lastName?: string | null
    email?: string | null
    authority?: string[]
    role?: 'CUSTOMER' | 'STAFF' | 'OPERATOR' | 'ADMIN'
    outletId?: number | null
    paymentStatus?: string | null
    isActive?: boolean
    emailVerified?: boolean
}

export type Token = {
    accessToken: string
    refreshToken?: string
}

export type OauthSignInCallbackPayload = {
    onSignIn: (tokens: Token, user?: User) => void
    redirect: () => void
}
