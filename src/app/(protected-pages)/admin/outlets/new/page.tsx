'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Container from '@/components/shared/Container'
import Card from '@/components/ui/Card'
import Alert from '@/components/ui/Alert'
import OutletForm from '@/components/outlets/OutletForm'
import { useOutletStore } from '@/stores/useOutletStore'
import { useUserStore } from '@/stores/useUserStore'
import type { OutletFormSchema } from '@/types/outlet'

const NewOutletPage = () => {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const createOutlet = useOutletStore((state) => state.createOutlet)
    const users = useUserStore((state) => state.users)
    const fetchUsers = useUserStore((state) => state.fetchUsers)

    useEffect(() => {
        // Fetch users with staff role for manager selection
        fetchUsers({ role: 'staff' })
    }, [fetchUsers])

    const handleSubmit = async (values: OutletFormSchema) => {
        setIsSubmitting(true)
        setError(null)

        try {
            await createOutlet({
                name: values.name,
                location: values.location,
                contactPhone: values.contactPhone,
                contactEmail: values.contactEmail,
                managerId: values.managerId || undefined,
            })

            router.push('/admin/outlets')
        } catch (err) {
            setError(
                err instanceof Error ? err.message : 'Failed to create outlet',
            )
            setIsSubmitting(false)
        }
    }

    const managers = (users || [])
        .filter((user) => user.role === 'staff')
        .map((user) => ({
            value: user.id,
            label: `${user.firstName} ${user.lastName} (${user.email})`,
        }))

    return (
        <Container>
            <div className="max-w-4xl mx-auto">
                <Card className="mb-4">
                    <h3>Create New Outlet</h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Add a new outlet to manage gas cylinder inventory and
                        operations.
                    </p>
                </Card>

                {error && (
                    <Alert showIcon className="mb-4" type="danger">
                        {error}
                    </Alert>
                )}

                <OutletForm
                    onFormSubmit={handleSubmit}
                    managers={managers}
                    isSubmitting={isSubmitting}
                />
            </div>
        </Container>
    )
}

export default NewOutletPage
