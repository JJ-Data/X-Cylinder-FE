'use client'

import { useState } from 'react'
import Container from '@/components/shared/Container'
import Button from '@/components/ui/Button'

export default function SignInTest() {
    const [result, setResult] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    
    const testSignIn = async () => {
        setLoading(true)
        try {
            // Test direct sign-in API call
            const response = await fetch('/api/auth/callback/credentials', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: 'admin@cylinderx.com',
                    password: 'admin123',
                    csrfToken: await fetch('/api/auth/csrf').then(r => r.json()).then(d => d.csrfToken),
                }),
            })
            
            const data = await response.json()
            const cookies = response.headers.get('set-cookie')
            
            setResult({
                status: response.status,
                statusText: response.statusText,
                data,
                cookies,
                headers: Object.fromEntries(response.headers.entries()),
            })
        } catch (error) {
            setResult({
                error: error instanceof Error ? error.message : 'Unknown error',
            })
        } finally {
            setLoading(false)
        }
    }
    
    const checkCookies = async () => {
        try {
            const response = await fetch('/api/debug/cookies')
            const data = await response.json()
            setResult(data)
        } catch (error) {
            setResult({
                error: error instanceof Error ? error.message : 'Unknown error',
            })
        }
    }
    
    return (
        <Container>
            <div className="max-w-4xl mx-auto p-6">
                <h1 className="text-2xl font-bold mb-6">Sign-In Test Page</h1>
                
                <div className="space-y-4">
                    <Button onClick={testSignIn} loading={loading}>
                        Test Sign-In API
                    </Button>
                    
                    <Button onClick={checkCookies} variant="plain">
                        Check Cookies
                    </Button>
                    
                    {result && (
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-semibold mb-4">Result</h2>
                            <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
                                {JSON.stringify(result, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>
            </div>
        </Container>
    )
}