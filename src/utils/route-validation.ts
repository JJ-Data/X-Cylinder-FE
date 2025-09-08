import { getRoleBasedPath } from '@/configs/app.config'
import type { UserRole } from '@/stores/useAuthStore'

/**
 * List of valid application routes that can be used as callback URLs
 */
const VALID_ROUTES = [
    // Root
    '/',
    
    // Admin routes
    '/admin/dashboard',
    '/admin/cylinders',
    '/admin/cylinders/new',
    '/admin/cylinders/scan',
    '/admin/cylinders/transfer',
    '/admin/outlets',
    '/admin/outlets/new',
    '/admin/leases',
    '/admin/leases/new',
    '/admin/leases/return',
    '/admin/refills',
    '/admin/refills/new',
    '/admin/refills/bulk',
    '/admin/transfers',
    '/admin/transfers/new',
    '/admin/users',
    '/admin/users/create',
    '/admin/customers',
    '/admin/customers/new',
    '/admin/customers/register',
    '/admin/analytics',
    '/admin/analytics/customers',
    '/admin/analytics/cylinders',
    '/admin/analytics/operators',
    '/admin/analytics/outlets',
    '/admin/analytics/revenue',
    
    // Staff routes
    '/staff/dashboard',
    '/staff/customers',
    '/staff/customers/register',
    '/staff/cylinders',
    '/staff/cylinders/scan',
    '/staff/leasing',
    '/staff/leasing/new',
    '/staff/leasing/returns',
    
    // Operator routes
    '/operator/dashboard',
    '/operator/qr-scanner',
    '/operator/refill-queue',
    
    // Customer routes
    '/customer/dashboard',
    
    // Common routes that should redirect to appropriate dashboard
    '/home',
    '/dashboard',
]

/**
 * Routes that are commonly mistyped or legacy routes that should redirect to dashboard
 */
const REDIRECT_TO_DASHBOARD_ROUTES = [
    '/home',
    '/dashboard',
    '/main',
    '/index',
    '/app',
]

/**
 * Validates if a callback URL is safe and valid for redirection
 * @param callbackUrl - The URL to validate
 * @param userRole - The user's role for fallback dashboard selection
 * @returns Object with validation result and safe redirect URL
 */
export function validateCallbackUrl(
    callbackUrl: string | null | undefined,
    userRole?: UserRole | string
): { isValid: boolean; redirectUrl: string; reason?: string } {
    
    // If no callback URL provided, use role-based dashboard
    if (!callbackUrl) {
        const roleBasedPath = userRole ? getRoleBasedPath(userRole) : '/admin/dashboard'
        console.log('[validateCallbackUrl] No callback URL, using role-based path:', {
            userRole,
            roleBasedPath,
            timestamp: new Date().toISOString()
        })
        return {
            isValid: false,
            redirectUrl: roleBasedPath,
            reason: 'No callback URL provided'
        }
    }
    
    // Remove query parameters and hash for validation
    const cleanUrl = callbackUrl.split('?')[0].split('#')[0]
    
    // Check if it's an external URL (security measure)
    try {
        // Use a default origin for server-side validation
        const baseOrigin = typeof window !== 'undefined' 
            ? window.location.origin 
            : 'http://localhost:3000'
        const url = new URL(callbackUrl, baseOrigin)
        if (url.origin !== baseOrigin && callbackUrl.startsWith('http')) {
            const roleBasedPath = userRole ? getRoleBasedPath(userRole) : '/admin/dashboard'
            console.log('[validateCallbackUrl] External URL blocked, using role-based path:', {
                userRole,
                roleBasedPath,
                blockedUrl: callbackUrl,
                timestamp: new Date().toISOString()
            })
            return {
                isValid: false,
                redirectUrl: roleBasedPath,
                reason: 'External URL not allowed'
            }
        }
    } catch {
        // If URL parsing fails, treat as relative path
    }
    
    // Check if it's a route that should redirect to dashboard
    if (REDIRECT_TO_DASHBOARD_ROUTES.includes(cleanUrl)) {
        const roleBasedPath = userRole ? getRoleBasedPath(userRole) : '/admin/dashboard'
        console.log('[validateCallbackUrl] Legacy route redirected to role-based path:', {
            userRole,
            roleBasedPath,
            legacyRoute: cleanUrl,
            timestamp: new Date().toISOString()
        })
        return {
            isValid: false,
            redirectUrl: roleBasedPath,
            reason: 'Legacy route redirected to dashboard'
        }
    }
    
    // Check if it's a valid application route
    const isExactMatch = VALID_ROUTES.includes(cleanUrl)
    const isDynamicRoute = VALID_ROUTES.some(route => {
        // Handle dynamic routes like /admin/outlets/[id]
        if (route.includes('[id]')) {
            const pattern = route.replace('[id]', '[^/]+')
            const regex = new RegExp(`^${pattern}(/.*)?$`)
            return regex.test(cleanUrl)
        }
        return false
    })
    
    if (isExactMatch || isDynamicRoute) {
        return {
            isValid: true,
            redirectUrl: callbackUrl
        }
    }
    
    // Invalid route - redirect to role-based dashboard
    const roleBasedPath = userRole ? getRoleBasedPath(userRole) : '/admin/dashboard'
    console.log('[validateCallbackUrl] Invalid route, using role-based path:', {
        userRole,
        roleBasedPath,
        invalidRoute: cleanUrl,
        timestamp: new Date().toISOString()
    })
    return {
        isValid: false,
        redirectUrl: roleBasedPath,
        reason: 'Invalid route'
    }
}

/**
 * Sanitizes a callback URL to ensure it's safe for use
 * @param callbackUrl - The URL to sanitize
 * @param userRole - The user's role for fallback dashboard selection
 * @returns A safe URL to redirect to
 */
export function sanitizeCallbackUrl(
    callbackUrl: string | null | undefined,
    userRole?: UserRole | string
): string {
    console.log('[sanitizeCallbackUrl] ===== URL SANITIZATION START =====')
    console.log('[sanitizeCallbackUrl] Input data:', {
        callbackUrl,
        userRole,
        userRoleType: typeof userRole,
        timestamp: new Date().toISOString()
    })
    
    const validation = validateCallbackUrl(callbackUrl, userRole)
    
    console.log('[sanitizeCallbackUrl] Validation result:', {
        originalUrl: callbackUrl,
        sanitizedUrl: validation.redirectUrl,
        isValid: validation.isValid,
        reason: validation.reason,
        userRole,
        timestamp: new Date().toISOString()
    })
    
    if (validation.redirectUrl === '/admin/dashboard' && userRole !== 'admin') {
        console.error('[sanitizeCallbackUrl] ❌ POTENTIAL ISSUE: Non-admin user redirected to admin dashboard!')
        console.log('[sanitizeCallbackUrl] This may indicate role routing failure')
    }
    
    console.log('[sanitizeCallbackUrl] ===== URL SANITIZATION END =====')
    console.log('[sanitizeCallbackUrl] Final redirect URL:', validation.redirectUrl)
    
    return validation.redirectUrl
}

/**
 * Checks if a route exists in the application
 * @param route - The route to check
 * @returns True if the route exists, false otherwise
 */
export function isValidRoute(route: string): boolean {
    const cleanRoute = route.split('?')[0].split('#')[0]
    return VALID_ROUTES.includes(cleanRoute) || 
           VALID_ROUTES.some(validRoute => {
               if (validRoute.includes('[id]')) {
                   const pattern = validRoute.replace('[id]', '[^/]+')
                   const regex = new RegExp(`^${pattern}(/.*)?$`)
                   return regex.test(cleanRoute)
               }
               return false
           })
}