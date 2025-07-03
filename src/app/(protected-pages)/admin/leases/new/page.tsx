'use client'

import { useRouter } from 'next/navigation'
import { HiArrowLeft } from 'react-icons/hi'
import Container from '@/components/shared/Container'
import Button from '@/components/ui/Button'
import { EnhancedLeaseForm } from '@/components/leases/EnhancedLeaseForm'

export default function NewLeasePage() {
    const router = useRouter()

    return (
        <Container>
            <div className="mb-6">
                <Button
                    size="sm"
                    variant="plain"
                    icon={<HiArrowLeft />}
                    onClick={() => router.push('/admin/leases')}
                >
                    Back to Leases
                </Button>

                <h3 className="mb-2 mt-4">Create New Lease</h3>
                <p className="text-sm text-gray-500">
                    Process a new cylinder lease for a customer
                </p>
            </div>

            <EnhancedLeaseForm />
        </Container>
    )
}
