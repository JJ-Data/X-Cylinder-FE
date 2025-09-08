'use client'

import { EnhancedLeaseForm } from '@/components/leases/EnhancedLeaseForm'
import Container from '@/components/shared/Container'
import { useRouter } from 'next/navigation'
import { PiArrowLeftDuotone } from 'react-icons/pi'
import Button from '@/components/ui/Button'

export default function NewLeasePage() {
    const router = useRouter()

    return (
        <Container>
            <div className="mb-6">
                <Button
                    size="sm"
                    variant="plain"
                    icon={<PiArrowLeftDuotone />}
                    onClick={() => router.push('/staff/leasing')}
                >
                    Back to Leases
                </Button>

                <h3 className="mb-2 mt-4">Create New Lease</h3>
                <p className="text-sm text-gray-500">
                    Register a new cylinder lease for a customer
                </p>
            </div>

            <EnhancedLeaseForm redirectPath="/staff/leasing" />
        </Container>
    )
}