import { auth } from '@/auth'
import {
    authRoutes as _authRoutes,
    publicRoutes as _publicRoutes,
} from '@/configs/routes.config'
import { REDIRECT_URL_KEY } from '@/constants/app.constant'
import appConfig, { getRoleBasedPath } from '@/configs/app.config'
import { isValidRoute } from '@/utils/route-validation'

const publicRoutes = Object.entries(_publicRoutes).map(([key]) => key)
const authRoutes = Object.entries(_authRoutes).map(([key]) => key)

const apiAuthPrefix = `${appConfig.apiPrefix}/auth`

export default auth((req) => {
    const { nextUrl } = req
    const isSignedIn = !!req.auth

    console.log('[Middleware] Request:', {
        path: nextUrl.pathname,
        isSignedIn,
        auth: req.auth,
        user: req.auth?.user,
        cookies: req.cookies?.getAll().map(c => ({ name: c.name, value: c.value ? 'present' : 'missing' })),
        headers: {
            cookie: req.headers.get('cookie') ? 'present' : 'missing',
            authorization: req.headers.get('authorization') ? 'present' : 'missing',
        }
    })

    const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix)
    const isPublicRoute = publicRoutes.includes(nextUrl.pathname)
    const isAuthRoute = authRoutes.includes(nextUrl.pathname)

    /** Skip auth middleware for api routes */
    if (isApiAuthRoute) return

    /** Skip middleware for static assets and Next.js internals */
    if (
        nextUrl.pathname.startsWith('/_next') ||
        nextUrl.pathname.includes('/api/') ||
        nextUrl.pathname.includes('.') ||
        nextUrl.pathname === '/favicon.ico'
    ) {
        return
    }

    if (isAuthRoute) {
        if (isSignedIn) {
            /** Redirect to role-based path if signed in & path is auth route */
            const userRole = req.auth?.user?.role || 'customer'
            const roleBasedPath = getRoleBasedPath(userRole)
            
            console.log('[Middleware] Redirecting authenticated user from auth route:', {
                userRole,
                roleBasedPath,
                timestamp: new Date().toISOString(),
            })
            
            return Response.redirect(
                new URL(roleBasedPath, nextUrl),
            )
        }
        return
    }

    /** Redirect to sign-in if not signed in & path is not public */
    if (!isSignedIn && !isPublicRoute) {
        let callbackUrl = nextUrl.pathname
        if (nextUrl.search) {
            callbackUrl += nextUrl.search
        }

        // Only include callback URL if it's a valid route
        // This prevents redirecting back to invalid/non-existent routes
        const shouldIncludeCallback = isValidRoute(nextUrl.pathname)
        const redirectUrl = shouldIncludeCallback 
            ? `${appConfig.unAuthenticatedEntryPath}?${REDIRECT_URL_KEY}=${encodeURIComponent(callbackUrl)}`
            : appConfig.unAuthenticatedEntryPath

        console.log('[Middleware] Redirecting to sign-in:', {
            originalPath: nextUrl.pathname,
            callbackUrl,
            shouldIncludeCallback,
            redirectUrl,
            timestamp: new Date().toISOString(),
        })

        return Response.redirect(
            new URL(redirectUrl, nextUrl),
        )
    }

    /** Allow the request to continue */
    return
})

export const config = {
    matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api)(.*)'],
}