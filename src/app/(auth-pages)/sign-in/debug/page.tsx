'use client'

import { useState, useEffect } from 'react'
import { useSession, signIn as nextAuthSignIn } from 'next-auth/react'
import Container from '@/components/shared/Container'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

export default function AuthDebugPage() {
    const { data: session, status, update } = useSession()
    const [testResults, setTestResults] = useState<any>({})
    const [loading, setLoading] = useState<string | null>(null)

    useEffect(() => {
        // Check cookies on mount
        checkCookies()
    }, [])

    const checkCookies = async () => {
        setLoading('cookies')
        try {
            const response = await fetch('/api/debug/cookies')
            const data = await response.json()
            setTestResults((prev: any) => ({ ...prev, cookies: data }))
        } catch (error) {
            setTestResults((prev: any) => ({ 
                ...prev, 
                cookies: { error: error instanceof Error ? error.message : 'Unknown error' }
            }))
        } finally {
            setLoading(null)
        }
    }

    const checkSession = async () => {
        setLoading('session')
        try {
            const response = await fetch('/api/debug/session')
            const data = await response.json()
            setTestResults((prev: any) => ({ ...prev, serverSession: data }))
        } catch (error) {
            setTestResults((prev: any) => ({ 
                ...prev, 
                serverSession: { error: error instanceof Error ? error.message : 'Unknown error' }
            }))
        } finally {
            setLoading(null)
        }
    }

    const testDirectSignIn = async () => {
        setLoading('directSignIn')
        try {
            const result = await nextAuthSignIn('credentials', {
                email: 'admin@cylinderx.com',
                password: 'admin123',
                redirect: false,
            })
            
            setTestResults((prev: any) => ({ ...prev, directSignIn: result }))
            
            // After sign in, check cookies and session
            setTimeout(() => {
                checkCookies()
                checkSession()
                update() // Force session update
            }, 1000)
        } catch (error) {
            setTestResults((prev: any) => ({ 
                ...prev, 
                directSignIn: { error: error instanceof Error ? error.message : 'Unknown error' }
            }))
        } finally {
            setLoading(null)
        }
    }

    const testManualAuth = async () => {
        setLoading('manualAuth')
        try {
            // Get CSRF token
            const csrfResponse = await fetch('/api/auth/csrf')
            const csrfData = await csrfResponse.json()
            
            // Manual sign in
            const authResponse = await fetch('/api/auth/callback/credentials', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: 'admin@cylinderx.com',
                    password: 'admin123',
                    csrfToken: csrfData.csrfToken,
                }),
            })
            
            const authData = await authResponse.text()
            const cookies = authResponse.headers.get('set-cookie')
            
            setTestResults((prev: any) => ({ 
                ...prev, 
                manualAuth: {
                    status: authResponse.status,
                    statusText: authResponse.statusText,
                    cookies,
                    data: authData,
                    csrfToken: csrfData.csrfToken,
                }
            }))
            
            // Check session after manual auth
            setTimeout(() => {
                checkCookies()
                checkSession()
            }, 1000)
        } catch (error) {
            setTestResults((prev: any) => ({ 
                ...prev, 
                manualAuth: { error: error instanceof Error ? error.message : 'Unknown error' }
            }))
        } finally {
            setLoading(null)
        }
    }

    return (
        <Container>
            <div className="max-w-6xl mx-auto p-6">
                <h1 className="text-3xl font-bold mb-8">Authentication Debug Page</h1>
                
                {/* Current Session Status */}
                <Card className="mb-6">
                    <h2 className="text-xl font-semibold mb-4">Current Session Status</h2>
                    <div className="space-y-2">
                        <p><strong>Status:</strong> {status}</p>
                        <p><strong>Session:</strong> {session ? 'Present' : 'None'}</p>
                        {session && (
                            <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
                                {JSON.stringify(session, null, 2)}
                            </pre>
                        )}
                    </div>
                </Card>

                {/* Test Actions */}
                <Card className="mb-6">
                    <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
                    <div className="space-x-4">
                        <Button 
                            onClick={checkCookies} 
                            loading={loading === 'cookies'}
                            variant="plain"
                        >
                            Check Cookies
                        </Button>
                        <Button 
                            onClick={checkSession} 
                            loading={loading === 'session'}
                            variant="plain"
                        >
                            Check Server Session
                        </Button>
                        <Button 
                            onClick={testDirectSignIn} 
                            loading={loading === 'directSignIn'}
                        >
                            Test NextAuth SignIn
                        </Button>
                        <Button 
                            onClick={testManualAuth} 
                            loading={loading === 'manualAuth'}
                            variant="solid"
                        >
                            Test Manual Auth
                        </Button>
                    </div>
                </Card>

                {/* Test Results */}
                {Object.keys(testResults).length > 0 && (
                    <Card>
                        <h2 className="text-xl font-semibold mb-4">Test Results</h2>
                        <div className="space-y-4">
                            {Object.entries(testResults).map(([key, value]) => (
                                <div key={key}>
                                    <h3 className="font-semibold text-lg capitalize mb-2">{key}</h3>
                                    <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
                                        {JSON.stringify(value, null, 2)}
                                    </pre>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}
            </div>
        </Container>
    )
}