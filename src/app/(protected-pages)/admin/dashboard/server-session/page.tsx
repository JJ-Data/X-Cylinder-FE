import { auth } from '@/auth'
import Container from '@/components/shared/Container'

export default async function ServerSessionTest() {
    const session = await auth()
    
    return (
        <Container>
            <div className="max-w-4xl mx-auto p-6">
                <h1 className="text-2xl font-bold mb-6">Server Session Test Page</h1>
                
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold mb-4">Server-Side Session</h2>
                    <div className="space-y-2">
                        <div>Has Session: <span className="font-mono">{session ? 'Yes' : 'No'}</span></div>
                        <div>Session Data:</div>
                        <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
                            {JSON.stringify(session, null, 2)}
                        </pre>
                    </div>
                </div>
                
                <div className="mt-6 bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold mb-4">Environment (Server)</h2>
                    <div className="space-y-2">
                        <div>AUTH_URL: {process.env.AUTH_URL}</div>
                        <div>AUTH_SECRET: {process.env.AUTH_SECRET ? 'Set' : 'Not Set'}</div>
                        <div>NEXTAUTH_URL: {process.env.NEXTAUTH_URL}</div>
                        <div>NODE_ENV: {process.env.NODE_ENV}</div>
                    </div>
                </div>
            </div>
        </Container>
    )
}