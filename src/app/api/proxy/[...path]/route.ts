import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const awaitedParams = await params
    return handleRequest(request, awaitedParams, 'GET')
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const awaitedParams = await params
    return handleRequest(request, awaitedParams, 'POST')
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const awaitedParams = await params
    return handleRequest(request, awaitedParams, 'PUT')
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const awaitedParams = await params
    return handleRequest(request, awaitedParams, 'DELETE')
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const awaitedParams = await params
    return handleRequest(request, awaitedParams, 'PATCH')
}

async function handleRequest(
    request: NextRequest,
    params: { path: string[] },
    method: string
) {
    try {
        // Construct the path
        const path = params.path.join('/')
        
        // Define public paths that don't require authentication
        const publicPaths = [
            'auth/login',
            'auth/register',
            'auth/refresh',
            'auth/logout',
            'auth/forgot-password',
            'auth/reset-password',
            'auth/verify-email',
            'auth/resend-verification'
        ]
        
        // Check if the current path is public
        const isPublicPath = publicPaths.some(publicPath => 
            path.startsWith(publicPath)
        )
        
        // Only check session for protected paths
        if (!isPublicPath) {
            const session = await auth()
            
            if (!session) {
                return NextResponse.json(
                    { error: 'Unauthorized', message: 'No valid session' },
                    { status: 401 }
                )
            }
        }

        // Construct the backend URL
        const backendUrl = `${BACKEND_URL}/${path}`
        
        // Get query parameters
        const searchParams = request.nextUrl.searchParams.toString()
        const fullUrl = searchParams ? `${backendUrl}?${searchParams}` : backendUrl

        // Get cookies from the incoming request
        const cookieHeader = request.headers.get('cookie') || ''

        console.log('[API Proxy]', {
            method,
            path,
            fullUrl,
            isPublicPath,
            hasCookies: !!cookieHeader
        })

        // Prepare headers
        const headers: HeadersInit = {
            // Forward the cookies from the client request
            'Cookie': cookieHeader,
        }
        
        // Only set Content-Type for requests with body
        if (method !== 'GET' && method !== 'HEAD') {
            headers['Content-Type'] = 'application/json'
        }

        // Prepare request options
        const options: RequestInit = {
            method,
            headers,
            credentials: 'include', // Include cookies in the request
        }

        // Add body for non-GET requests
        if (method !== 'GET' && method !== 'HEAD') {
            try {
                const body = await request.json()
                options.body = JSON.stringify(body)
            } catch {
                // No body or invalid JSON
            }
        }

        // Make the request to the backend
        const response = await fetch(fullUrl, options)

        // Check content type to determine how to handle response
        const contentType = response.headers.get('content-type') || ''
        const isImage = contentType.includes('image/') || contentType.includes('application/octet-stream')
        const isPDF = contentType.includes('application/pdf')
        const isBinary = isImage || isPDF

        console.log('[API Proxy Response]', {
            status: response.status,
            contentType,
            isBinary,
            setCookieHeader: response.headers.get('set-cookie')?.substring(0, 100) + '...'
        })

        let proxyResponse: NextResponse

        if (isBinary) {
            // Handle binary response (images, PDFs, etc.)
            const blob = await response.blob()
            const buffer = await blob.arrayBuffer()
            
            proxyResponse = new NextResponse(buffer, {
                status: response.status,
                headers: {
                    'Content-Type': contentType,
                    'Content-Disposition': response.headers.get('content-disposition') || '',
                    'Cache-Control': response.headers.get('cache-control') || 'no-cache',
                }
            })
        } else {
            // Handle JSON response
            const data = await response.json().catch(() => null)
            
            proxyResponse = NextResponse.json(
                data || { error: 'No response data' },
                { status: response.status }
            )
        }

        // Forward Set-Cookie headers from backend to client
        // Note: fetch() in Node.js combines multiple Set-Cookie headers into one string
        const setCookieHeader = response.headers.get('set-cookie')
        if (setCookieHeader) {
            // Split cookies properly - cookies can contain commas in expires= dates
            // So we need to split by looking for cookie name patterns
            const cookies: string[] = []
            let currentCookie = ''
            
            setCookieHeader.split(',').forEach((part, _index) => {
                // Check if this part starts with a cookie name (word characters followed by =)
                // and we already have accumulated a cookie
                if (currentCookie && /^\s*\w+\s*=/.test(part)) {
                    cookies.push(currentCookie.trim())
                    currentCookie = part
                } else {
                    currentCookie += (currentCookie ? ',' : '') + part
                }
            })
            
            // Don't forget the last cookie
            if (currentCookie) {
                cookies.push(currentCookie.trim())
            }
            
            // Set each cookie separately
            cookies.forEach(cookie => {
                console.log('[API Proxy] Setting cookie:', cookie.split(';')[0]) // Log cookie name/value only
                
                // Parse the cookie to modify its attributes if needed
                const cookieParts = cookie.split(';').map(part => part.trim())
                const modifiedParts = cookieParts.map(part => {
                    // Remove domain attribute to let browser use current domain
                    if (part.toLowerCase().startsWith('domain=')) {
                        return null
                    }
                    // Ensure SameSite=lax for cross-port compatibility
                    if (part.toLowerCase().startsWith('samesite=')) {
                        return 'SameSite=Lax'
                    }
                    return part
                }).filter(Boolean)
                
                const modifiedCookie = modifiedParts.join('; ')
                proxyResponse.headers.append('Set-Cookie', modifiedCookie)
            })
        }

        return proxyResponse
    } catch (error) {
        console.error('[API Proxy Error]', error)
        return NextResponse.json(
            { error: 'Internal Server Error', message: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        )
    }
}