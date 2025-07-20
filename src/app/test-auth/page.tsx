'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'

export default function TestAuth() {
    const [results, setResults] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    const addResult = (name: string, data: any) => {
        setResults(prev => [...prev, { name, data, timestamp: new Date().toISOString() }])
    }

    const runTests = async () => {
        setLoading(true)
        setResults([])

        try {
            // Test 1: Check current auth state
            addResult('1. Check Current Auth State', 'Starting...')
            const authStateRes = await fetch('/api/test-auth')
            const authState = await authStateRes.json()
            addResult('1. Current Auth State', authState)

            // Test 2: Get CSRF Token
            addResult('2. Get CSRF Token', 'Starting...')
            const csrfRes = await fetch('/api/auth/csrf')
            const csrfData = await csrfRes.json()
            addResult('2. CSRF Token', csrfData)

            // Test 3: Test NextAuth signIn
            addResult('3. NextAuth signIn', 'Starting...')
            const signInResult = await signIn('credentials', {
                email: 'admin@cylinderx.com',
                password: 'admin123',
                redirect: false,
            })
            addResult('3. SignIn Result', signInResult)

            // Test 4: Check auth state after sign in
            addResult('4. Check Auth After SignIn', 'Starting...')
            await new Promise(resolve => setTimeout(resolve, 1000)) // Wait a bit
            const authStateAfterRes = await fetch('/api/test-auth')
            const authStateAfter = await authStateAfterRes.json()
            addResult('4. Auth State After SignIn', authStateAfter)

            // Test 5: Check session endpoint
            addResult('5. Check Session Endpoint', 'Starting...')
            const sessionRes = await fetch('/api/auth/session')
            const sessionData = await sessionRes.json()
            addResult('5. Session Data', sessionData)

        } catch (error) {
            addResult('Error', {
                message: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6">Authentication Test Page</h1>
            
            <button
                onClick={runTests}
                disabled={loading}
                className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300 mb-6"
            >
                {loading ? 'Running Tests...' : 'Run Authentication Tests'}
            </button>

            <div className="space-y-4">
                {results.map((result, index) => (
                    <div key={index} className="border p-4 rounded">
                        <h2 className="font-semibold mb-2">{result.name}</h2>
                        <pre className="bg-gray-100 p-2 rounded overflow-auto text-xs">
                            {JSON.stringify(result.data, null, 2)}
                        </pre>
                        <p className="text-xs text-gray-500 mt-1">{result.timestamp}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}