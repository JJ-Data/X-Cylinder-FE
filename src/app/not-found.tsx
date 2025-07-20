'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Container from '@/components/shared/Container'
import NotFound404 from '@/assets/svg/NotFound404'
import { getRoleBasedPath } from '@/configs/app.config'

export default function NotFound() {
    const { data: session, status } = useSession()
    const router = useRouter()
    
    const handleBackToDashboard = () => {
        if (status === 'loading') return
        
        if (!session) {
            // No session, redirect to sign-in
            router.push('/sign-in')
            return
        }
        
        // Get role-based dashboard
        const role = session.user.role?.toLowerCase() || 'customer'
        const dashboardPath = getRoleBasedPath(role)
        router.push(dashboardPath)
    }
    return (
        <div className="flex flex-auto flex-col h-[100vh]">
            <div className="h-full bg-white dark:bg-gray-800">
                <Container className="flex flex-col flex-auto items-center justify-center min-w-0 h-full">
                    <div className="min-w-[320px] md:min-w-[500px] max-w-[500px]">
                        <div className="text-center">
                            <div className="mb-10 flex justify-center">
                                <NotFound404 height={350} width={350} />
                            </div>
                            <h2>Ops! Page not found</h2>
                            <p className="text-lg mt-6">
                                This page does not exist or has been removed. We
                                suggest you go back to your dashboard.
                            </p>
                            <div className="mt-8">
                                <button
                                    onClick={handleBackToDashboard}
                                    disabled={status === 'loading'}
                                    className="button inline-flex items-center justify-center bg-white border border-gray-300 dark:bg-gray-700 dark:border-gray-700 ring-primary dark:ring-white hover:border-primary dark:hover:border-white hover:ring-1 hover:text-primary dark:hover:text-white dark:hover:bg-transparent text-gray-600 dark:text-gray-100 h-14 rounded-xl px-8 py-2 text-base button-press-feedback disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {status === 'loading' ? 'Loading...' : 'Back to Dashboard'}
                                </button>
                            </div>
                        </div>
                    </div>
                </Container>
            </div>
        </div>
    )
}
