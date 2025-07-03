import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { transferSchema } from '../TransferWizard.schema'
import type { TransferFormData } from '../TransferWizard.types'

interface UseTransferFormProps {
    preselectedCylinderId?: number
}

export const useTransferForm = ({ preselectedCylinderId }: UseTransferFormProps) => {
    const form = useForm<TransferFormData>({
        defaultValues: {
            transferType: preselectedCylinderId ? 'single' : 'bulk',
            cylinderCode: '',
            cylinderIds: [],
            sourceOutletId: undefined,
            destinationOutletId: 0,
            reason: 'balancing',
            customReason: '',
            notes: '',
        },
        resolver: zodResolver(transferSchema),
    })

    return form
}