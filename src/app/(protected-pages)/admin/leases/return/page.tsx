'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { HiArrowLeft } from 'react-icons/hi'
import Container from '@/components/shared/Container'
import Button from '@/components/ui/Button'
import { EnhancedReturnForm } from '@/components/leases/EnhancedReturnForm'

export default function ReturnLeasePage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const leaseId = searchParams.get('leaseId')

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

                <h3 className="mb-2 mt-4">Process Cylinder Return</h3>
                <p className="text-sm text-gray-500">
                    Complete the cylinder return process and calculate refunds
                </p>
            </div>

            <EnhancedReturnForm
                preselectedLeaseId={leaseId ? parseInt(leaseId) : undefined}
            />
        </Container>
    )
}
