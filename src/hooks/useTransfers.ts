import useSWRMutation from 'swr/mutation'
import { transferService } from '@/services/api/transfer.service'
import React from 'react'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
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
        toast.push(
          React.createElement(Notification, {
            title: 'Success',
            type: 'success'
          }, 'Transfer created successfully')
        )
      },
      onError: (error: any) => {
        toast.push(
          React.createElement(Notification, {
            title: 'Error',
            type: 'danger'
          }, error.message || 'Failed to create transfer')
        )
      }
    }
  )

  return {
    createTransfer
  }
}