'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import Container from '@/components/shared/Container'
import Button from '@/components/ui/Button'

export default function DebugDashboard() {
    const { data: session, status, update } = useSession()
    const [apiTest, setApiTest] = useState<any>(null)
    const [isTestingApi, setIsTestingApi] = useState(false)
    
    const testApiConnection = async () => {
        setIsTestingApi(true)
        try {
            // Test proxy endpoint
            const proxyResponse = await fetch('/api/proxy/analytics/dashboard', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            
            const proxyData = await proxyResponse.json()
            
            // Test direct backend connection
            const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1'
            let directData = null
            
            try {
                const directResponse = await fetch(`${backendUrl}/analytics/dashboard`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${(session as any)?.accessToken || 'NO_TOKEN'}`,
                    },
                })
                directData = await directResponse.json()
            } catch (directError: any) {
                directData = { error: directError.message || 'Failed to connect directly' }
            }
            
            setApiTest({
                timestamp: new Date().toISOString(),
                proxy: {
                    status: proxyResponse.status,
                    statusText: proxyResponse.statusText,
                    data: proxyData,
                    headers: Object.fromEntries(proxyResponse.headers.entries()),
                },
                direct: directData,
                session: {
                    exists: !!session,
                    hasToken: !!(session as any)?.accessToken,
                    tokenPreview: (session as any)?.accessToken ? 
                        `${((session as any).accessToken as string).substring(0, 20)}...` : 
                        'NO_TOKEN',
                },
                environment: {
                    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'NOT_SET',
                    NODE_ENV: process.env.NODE_ENV,
                },
            })
        } catch (error: any) {
            setApiTest({
                error: error.message || 'Unknown error occurred',
                timestamp: new Date().toISOString(),
            })
        } finally {
            setIsTestingApi(false)
        }
    }
    
    useEffect(() => {
        console.log('[Debug Dashboard] Mounted with:', {
            sessionStatus: status,
            sessionData: session,
            accessToken: (session as any)?.accessToken ? 'Present' : 'Missing',
        })
    }, [session, status])
    
    return (
        <Container>
            <div className="space-y-6">
                <h1 className="text-2xl font-bold">Dashboard Debug Information</h1>
                
                {/* Session Information */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold mb-4">Session Status</h2>
                    <div className="space-y-2">
                        <div>Status: <span className="font-mono">{status}</span></div>
                        <div>Has Session: <span className="font-mono">{session ? 'Yes' : 'No'}</span></div>
                        <div>Has Access Token: <span className="font-mono">{(session as any)?.accessToken ? 'Yes' : 'No'}</span></div>
                        <div>User Role: <span className="font-mono">{session?.user?.role || 'None'}</span></div>
                        <div>User Email: <span className="font-mono">{session?.user?.email || 'None'}</span></div>
                    </div>
                    <Button
                        className="mt-4"
                        size="sm"
                        onClick={() => update()}
                    >
                        Refresh Session
                    </Button>
                </div>
                
                {/* API Connection Test */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold mb-4">API Connection Test</h2>
                    <Button
                        onClick={testApiConnection}
                        loading={isTestingApi}
                        disabled={!session || !(session as any)?.accessToken}
                    >
                        Test API Connection
                    </Button>
                    
                    {apiTest && (
                        <div className="mt-4">
                            <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
                                {JSON.stringify(apiTest, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>
                
                {/* Raw Session Data */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold mb-4">Raw Session Data</h2>
                    <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
                        {JSON.stringify(session, null, 2)}
                    </pre>
                </div>
                
                {/* Environment Variables */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold mb-4">Environment Variables</h2>
                    <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
                        {JSON.stringify({
                            NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'NOT_SET',
                            NODE_ENV: process.env.NODE_ENV,
                        }, null, 2)}
                    </pre>
                </div>
            </div>
        </Container>
    )
}