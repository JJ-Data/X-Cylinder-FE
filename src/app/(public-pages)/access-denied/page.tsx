'use client'

import Link from 'next/link'
import Button from '@/components/ui/Button'
import { HiOutlineExclamationTriangle } from 'react-icons/hi2'
import { useSession } from 'next-auth/react'
import { getRoleBasedPath } from '@/configs/app.config'

export default function AccessDeniedPage() {
    const { data: session } = useSession()
    
    // Get the appropriate dashboard URL based on user role
    const dashboardUrl = session?.user?.role 
        ? getRoleBasedPath(session.user.role.toLowerCase())
        : '/'
    
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="max-w-md w-full px-6">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/20 mb-6">
                        <HiOutlineExclamationTriangle className="w-10 h-10 text-red-600 dark:text-red-500" />
                    </div>
                    
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        Access Denied
                    </h1>
                    
                    <p className="text-gray-600 dark:text-gray-400 mb-8">
                        You don&apos;t have permission to access this page. Please contact your administrator if you believe this is an error.
                    </p>
                    
                    <div className="space-y-3">
                        <Link href={dashboardUrl} className="block">
                            <Button variant="solid" className="w-full">
                                Go to Dashboard
                            </Button>
                        </Link>
                        
                        <Link href="/sign-in" className="block">
                            <Button variant="plain" className="w-full">
                                Sign in with different account
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}