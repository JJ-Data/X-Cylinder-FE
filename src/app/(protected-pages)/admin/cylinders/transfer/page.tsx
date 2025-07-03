'use client'

import { useSearchParams } from 'next/navigation'
import TransferWizard from '@/components/transfers/TransferWizard'

export default function CylinderTransferPage() {
    const searchParams = useSearchParams()
    const cylinderId = searchParams.get('cylinderId')

    return (
        <TransferWizard
            preselectedCylinderId={
                cylinderId ? parseInt(cylinderId) : undefined
            }
        />
    )
}
