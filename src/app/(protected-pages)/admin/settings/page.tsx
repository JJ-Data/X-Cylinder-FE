'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SettingsRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the simplified settings page
    router.replace('/admin/settings/simplified')
  }, [router])

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">Redirecting to settings...</p>
      </div>
    </div>
  )
}