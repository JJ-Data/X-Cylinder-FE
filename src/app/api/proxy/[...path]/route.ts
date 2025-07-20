import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'

const BACKEND_URL = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1'

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
        
        // Get session for both public and protected paths
        // Public paths may have optional authentication
        const session = await auth()
        
        // Only enforce authentication for protected paths
        if (!isPublicPath && !session) {
            return NextResponse.json(
                { error: 'Unauthorized', message: 'No valid session' },
                { status: 401 }
            )
        }

        // Construct the backend URL
        const backendUrl = `${BACKEND_URL}/${path}`
        
        // Get query parameters
        const searchParams = request.nextUrl.searchParams.toString()
        const fullUrl = searchParams ? `${backendUrl}?${searchParams}` : backendUrl

        const timestamp = new Date().toISOString()
        console.log(`[API Proxy ${timestamp}]`, {
            method,
            path,
            fullUrl,
            isPublicPath,
            hasSession: !!session,
            hasAccessToken: !!(session as any)?.accessToken,
            sessionUser: session?.user?.email,
            userRole: session?.user?.role
        })

        // Prepare headers
        const headers: HeadersInit = {}
        
        // Add Authorization header if we have an access token
        if (session && (session as any).accessToken) {
            headers['Authorization'] = `Bearer ${(session as any).accessToken}`
            console.log('[API Proxy] Adding Authorization header')
        }
        
        // Only set Content-Type for requests with body
        if (method !== 'GET' && method !== 'HEAD') {
            headers['Content-Type'] = 'application/json'
        }

        // Prepare request options
        const options: RequestInit = {
            method,
            headers,
            // Remove credentials since we're using Bearer tokens
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
        const startTime = Date.now()
        const response = await fetch(fullUrl, options)
        const responseTime = Date.now() - startTime

        // Check content type to determine how to handle response
        const contentType = response.headers.get('content-type') || ''
        const isImage = contentType.includes('image/') || contentType.includes('application/octet-stream')
        const isPDF = contentType.includes('application/pdf')
        const isBinary = isImage || isPDF

        console.log(`[API Proxy Response ${new Date().toISOString()}]`, {
            path,
            status: response.status,
            statusText: response.statusText,
            contentType,
            isBinary,
            responseTime: `${responseTime}ms`,
            hasAuthHeader: !!headers['Authorization']
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

        // No longer forwarding cookies since we're using Bearer tokens

        return proxyResponse
    } catch (error) {
        const errorDetails = {
            timestamp: new Date().toISOString(),
            path: params.path.join('/'),
            method,
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            backendUrl: BACKEND_URL
        }
        
        console.error('[API Proxy Error]', errorDetails)
        
        // Provide more helpful error messages
        let errorMessage = 'Internal Server Error'
        if (error instanceof Error) {
            if (error.message.includes('fetch failed')) {
                errorMessage = 'Failed to connect to backend API. Please check if the API server is running.'
            } else if (error.message.includes('ECONNREFUSED')) {
                errorMessage = 'Backend API connection refused. The API server may be down.'
            } else {
                errorMessage = error.message
            }
        }
        
        return NextResponse.json(
            { 
                error: 'API Proxy Error', 
                message: errorMessage,
                details: process.env.NODE_ENV === 'development' ? errorDetails : undefined
            },
            { status: 500 }
        )
    }
}