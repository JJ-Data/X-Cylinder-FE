import useSWRMutation from 'swr/mutation'
import { transferService } from '@/services/api/transfer.service'
import { toast } from 'react-hot-toast'
import type { TransferFormData } from '@/types/transfer'

// Transfer mutations hook
export const useTransferMutations = () => {
  // Create bulk transfer
  const createTransfer = useSWRMutation(
    'transfers/create',
    async (_key: string, { arg }: { arg: TransferFormData }) => {
      return await transferService.createTransfer(arg)
    },
    {
      onSuccess: () => {
        toast.success('Transfer created successfully')
      },
      onError: (error: any) => {
        toast.error(error.message || 'Failed to create transfer')
      }
    }
  )

  return {
    createTransfer
  }
}