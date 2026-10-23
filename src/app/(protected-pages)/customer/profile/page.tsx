'use client'

import { useState } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import AxiosBase from '@/services/axios/AxiosBase'
import Button from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { Alert } from '@/components/ui/Alert'
import ChangePasswordDialog from '@/components/auth/ChangePasswordDialog'

// Reads the logged-in user from /auth/me (same endpoint the app already uses).
// Read-only: no update-profile endpoint is used here.
const useMyProfile = () => {
    const { status } = useSession()

    return useSWR(
        status === 'authenticated' ? 'customer-me-profile' : null,
        async () => {
            const response = await AxiosBase.get('/auth/me')
            return response.data?.data
        },
        { revalidateOnFocus: false },
    )
}

function Field({ label, value }: { label: string; value?: string | null }) {
    return (
        <div>
            <dt className="text-sm text-gray-500">{label}</dt>
            <dd className="font-medium text-gray-900">{value || '—'}</dd>
        </div>
    )
}

export default function CustomerProfilePage() {
    const { data: session } = useSession()
    const { data: profile, error, isLoading } = useMyProfile()
    const [showPasswordDialog, setShowPasswordDialog] = useState(false)

    const p: any = profile || {}
    const fullName =
        [p.firstName, p.lastName].filter(Boolean).join(' ') ||
        p.name ||
        session?.user?.name ||
        ''
    const email = p.email || session?.user?.email || ''
    const phone = p.phone || p.phoneNumber || p.customer?.phone
    const address = p.address || p.customer?.address

    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    My Profile
                </h1>
                <p className="text-gray-600">
                    Your account details and security
                </p>
            </div>

            {error && (
                <Alert type="danger" className="mb-6">
                    Failed to load your profile. Please try again later.
                </Alert>
            )}

            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Account Details
                </h3>
                {isLoading ? (
                    <div className="space-y-3">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                ) : (
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Full name" value={fullName} />
                        <Field label="Email" value={email} />
                        <Field label="Phone" value={phone} />
                        <Field label="Address" value={address} />
                    </dl>
                )}
                <p className="text-sm text-gray-500 mt-4">
                    To change these details, contact support.
                </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Security
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                    Change the password you use to sign in.
                </p>
                <Button
                    variant="solid"
                    onClick={() => setShowPasswordDialog(true)}
                >
                    Change Password
                </Button>
            </div>

            <Link
                href="/customer/dashboard"
                className="text-blue-700 hover:underline text-sm"
            >
                Back to dashboard
            </Link>

            <ChangePasswordDialog
                isOpen={showPasswordDialog}
                onClose={() => setShowPasswordDialog(false)}
            />
        </div>
    )
}
