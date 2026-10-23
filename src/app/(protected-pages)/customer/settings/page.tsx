'use client'

import { useState } from 'react'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import ChangePasswordDialog from '@/components/auth/ChangePasswordDialog'

export default function CustomerSettingsPage() {
    const [showPasswordDialog, setShowPasswordDialog] = useState(false)

    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Settings
                </h1>
                <p className="text-gray-600">Manage your account</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 mb-6 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                        Profile
                    </h3>
                    <p className="text-gray-600 text-sm">
                        View your account details
                    </p>
                </div>
                <Link
                    href="/customer/profile"
                    className="bg-blue-50 hover:bg-blue-100 text-blue-900 font-medium px-4 py-2 rounded-lg transition-colors"
                >
                    View profile
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                        Password
                    </h3>
                    <p className="text-gray-600 text-sm">
                        Change the password you use to sign in
                    </p>
                </div>
                <Button
                    variant="solid"
                    onClick={() => setShowPasswordDialog(true)}
                >
                    Change Password
                </Button>
            </div>

            <ChangePasswordDialog
                isOpen={showPasswordDialog}
                onClose={() => setShowPasswordDialog(false)}
            />
        </div>
    )
}
