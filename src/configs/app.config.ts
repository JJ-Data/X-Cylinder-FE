export type AppConfig = {
    apiPrefix: string
    authenticatedEntryPath: string
    unAuthenticatedEntryPath: string
    locale: string
    activeNavTranslation: boolean
}

const appConfig: AppConfig = {
    apiPrefix:
        process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1',
    authenticatedEntryPath: '/admin/dashboard', // Default authenticated path
    unAuthenticatedEntryPath: '/sign-in',
    locale: 'en',
    activeNavTranslation: false,
}

// Role-based entry paths
export const roleBasedPaths = {
    customer: '/customer/dashboard',
    staff: '/staff/dashboard',
    operator: '/operator/dashboard',
    admin: '/admin/dashboard',
} as const

export const getRoleBasedPath = (role: string): string => {
    const normalizedRole = role.toLowerCase() as keyof typeof roleBasedPaths
    return roleBasedPaths[normalizedRole] || appConfig.authenticatedEntryPath
}

export default appConfig
