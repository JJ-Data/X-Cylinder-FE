'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Container from '@/components/shared/Container'
import Card from '@/components/ui/Card'
import Alert from '@/components/ui/Alert'
import Spinner from '@/components/ui/Spinner'
import OutletForm from '@/components/outlets/OutletForm'
import { useOutletStore } from '@/stores/useOutletStore'
import { useUserStore } from '@/stores/useUserStore'
import type { OutletFormSchema } from '@/types/outlet'

const EditOutletPage = () => {
    const params = useParams()
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const outletId = Number(params.id)

    const selectedOutlet = useOutletStore((state) => state.selectedOutlet)
    const fetchOutletById = useOutletStore((state) => state.fetchOutletById)
    const updateOutlet = useOutletStore((state) => state.updateOutlet)
    const isLoading = useOutletStore((state) => state.isLoading)

    const users = useUserStore((state) => state.users)
    const fetchUsers = useUserStore((state) => state.fetchUsers)

    useEffect(() => {
        // Fetch outlet details
        if (outletId) {
            fetchOutletById(outletId)
        }

        // Fetch users with staff role for manager selection
        fetchUsers({ role: 'staff' })
    }, [outletId, fetchOutletById, fetchUsers])

    const handleSubmit = async (values: OutletFormSchema) => {
        setIsSubmitting(true)
        setError(null)

        try {
            await updateOutlet(outletId, {
                name: values.name,
                location: values.location,
                contactPhone: values.contactPhone,
                contactEmail: values.contactEmail,
                managerId: values.managerId || undefined,
                status: values.status,
            })

            router.push('/admin/outlets')
        } catch (err) {
            setError(
                err instanceof Error ? err.message : 'Failed to update outlet',
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

    if (isLoading && !selectedOutlet) {
        return (
            <Container>
                <div className="flex items-center justify-center h-[400px]">
                    <Spinner size={40} />
                </div>
            </Container>
        )
    }

    if (!selectedOutlet) {
        return (
            <Container>
                <Alert type="danger">Outlet not found</Alert>
            </Container>
        )
    }

    // Memoize defaultValues to prevent infinite loop
    const defaultValues = useMemo(
        () => ({
            name: selectedOutlet.name,
            location: selectedOutlet.location,
            contactPhone: selectedOutlet.contactPhone,
            contactEmail: selectedOutlet.contactEmail,
            managerId: selectedOutlet.managerId,
            status: selectedOutlet.status,
        }),
        [selectedOutlet]
    )

    return (
        <Container>
            <div className="max-w-4xl mx-auto">
                <Card className="mb-4">
                    <h3>Edit Outlet</h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Update outlet information and management details.
                    </p>
                </Card>

                {error && (
                    <Alert showIcon className="mb-4" type="danger">
                        {error}
                    </Alert>
                )}

                <OutletForm
                    onFormSubmit={handleSubmit}
                    defaultValues={defaultValues}
                    managers={managers}
                    isSubmitting={isSubmitting}
                />
            </div>
        </Container>
    )
}

export default EditOutletPage
