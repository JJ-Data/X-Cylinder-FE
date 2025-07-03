import useSWR from 'swr'
import { transferService } from '@/services/api/transfer.service'
import type { TransferFilters, TransferListResponse } from '@/types/transfer'

export function useTransferHistory(filters: TransferFilters) {
  const queryKey = `/transfers?${new URLSearchParams(
    Object.entries(filters)
      .filter(([_, value]) => value !== undefined && value !== '')
      .map(([key, value]) => [key, String(value)])
  ).toString()}`

  const { data, error, mutate, isLoading } = useSWR<TransferListResponse>(
    queryKey,
    () => transferService.getTransferHistory(filters),
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
    }
  )

  return {
    data,
    error,
    isLoading,
    mutate,
  }
}