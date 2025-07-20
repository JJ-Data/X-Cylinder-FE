'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import Container from '@/components/shared/Container'
import Button from '@/components/ui/Button'

export default function SessionTest() {
    const { data: session, status } = useSession()
    const [cookies, setCookies] = useState<string>('')
    const [apiSession, setApiSession] = useState<any>(null)
    
    useEffect(() => {
        setCookies(document.cookie)
        
        // Fetch session from API endpoint
        fetch('/api/debug/session')
            .then(res => res.json())
            .then(data => {
                console.log('[SessionTest] API session response:', data)
                setApiSession(data)
            })
            .catch(err => {
                console.error('[SessionTest] Failed to fetch API session:', err)
            })
    }, [])
    
    return (
        <Container>
            <div className="max-w-4xl mx-auto p-6">
                <h1 className="text-2xl font-bold mb-6">Session Test Page</h1>
                
                <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold mb-4">Client-Side Session</h2>
                        <div className="space-y-2">
                            <div>Status: <span className="font-mono">{status}</span></div>
                            <div>Has Session: <span className="font-mono">{session ? 'Yes' : 'No'}</span></div>
                            <div>Session Data:</div>
                            <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
                                {JSON.stringify(session, null, 2)}
                            </pre>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold mb-4">Cookies</h2>
                        <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
                            {cookies.split(';').map(c => c.trim()).join('\n')}
                        </pre>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold mb-4">Environment</h2>
                        <div className="space-y-2">
                            <div>AUTH_URL: {process.env.NEXT_PUBLIC_AUTH_URL || 'Not exposed'}</div>
                            <div>API Base: {process.env.NEXT_PUBLIC_API_BASE_URL}</div>
                            <div>Window Location: {typeof window !== 'undefined' ? window.location.href : 'SSR'}</div>
                        </div>
                    </div>
                    
                    {apiSession && (
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-semibold mb-4">API Debug Endpoint</h2>
                            <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
                                {JSON.stringify(apiSession, null, 2)}
                            </pre>
                        </div>
                    )}
                    
                    <Button onClick={() => window.location.reload()}>
                        Reload Page
                    </Button>
                </div>
            </div>
        </Container>
    )
}