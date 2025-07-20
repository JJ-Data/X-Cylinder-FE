'use client'

import { useSession } from 'next-auth/react'
import { useState } from 'react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { PiInfoDuotone, PiXDuotone } from 'react-icons/pi'

export default function SessionStatus() {
    const { data: session, status } = useSession()
    const [showDetails, setShowDetails] = useState(false)
    
    // Always show in development for debugging
    const shouldShow = process.env.NODE_ENV === 'development'
    
    if (!shouldShow) return null
    
    const getStatusBadgeClass = () => {
        if (status === 'loading') return 'bg-yellow-500 text-white'
        if (status === 'authenticated' && (session as any)?.accessToken) return 'bg-green-500 text-white'
        if (status === 'authenticated' && !(session as any)?.accessToken) return 'bg-red-500 text-white'
        return 'bg-gray-500 text-white'
    }
    
    const getStatusText = () => {
        if (status === 'loading') return 'Loading Session...'
        if (status === 'authenticated' && (session as any)?.accessToken) return 'Authenticated'
        if (status === 'authenticated' && !(session as any)?.accessToken) return 'Missing Token'
        if (status === 'unauthenticated') return 'Not Authenticated'
        return 'Unknown'
    }
    
    return (
        <div className="fixed bottom-4 right-4 z-50">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 max-w-sm">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <PiInfoDuotone className="text-blue-500" />
                        <span className="text-sm font-medium">Session Status</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge 
                            content={getStatusText()}
                            className={getStatusBadgeClass()}
                        />
                        <Button
                            size="xs"
                            variant="plain"
                            icon={showDetails ? <PiXDuotone /> : <PiInfoDuotone />}
                            onClick={() => setShowDetails(!showDetails)}
                        />
                    </div>
                </div>
                
                {showDetails && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Status:</span>
                                <span className="font-mono">{status}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Has Session:</span>
                                <span className="font-mono">{session ? 'Yes' : 'No'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Has Token:</span>
                                <span className="font-mono">{(session as any)?.accessToken ? 'Yes' : 'No'}</span>
                            </div>
                            {session?.user && (
                                <>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">User:</span>
                                        <span className="font-mono truncate max-w-[150px]">{session.user.email}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Role:</span>
                                        <span className="font-mono">{session.user.role || 'N/A'}</span>
                                    </div>
                                </>
                            )}
                            <div className="flex justify-between">
                                <span className="text-gray-500">Backend URL:</span>
                                <span className="font-mono truncate max-w-[150px]">
                                    {process.env.NEXT_PUBLIC_API_BASE_URL || 'Not Set'}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}