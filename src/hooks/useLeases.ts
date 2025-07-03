import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'
import { leaseService, type LeaseFilters } from '@/services/api/lease.service'
import { mutate } from 'swr'
import { toast } from 'react-hot-toast'

// Get leases with filters
export const useLeases = (filters?: LeaseFilters) => {
  const key = ['leases', JSON.stringify(filters || {})]
  
  return useSWR(key, () => leaseService.getLeases(filters), {
    revalidateOnFocus: false,
  })
}

// Get single lease by ID
export const useLease = (id?: number) => {
  return useSWR(
    id ? ['lease', id] : null,
    () => leaseService.getLeaseById(id!),
    {
      revalidateOnFocus: false,
    }
  )
}

// Get customer's active leases
export const useCustomerActiveLeases = (customerId?: number) => {
  return useSWR(
    customerId ? ['customer-active-leases', customerId] : null,
    () => leaseService.getCustomerActiveLeases(customerId!),
    {
      revalidateOnFocus: false,
    }
  )
}

// Get customer's lease history
export const useCustomerLeaseHistory = (customerId?: number) => {
  return useSWR(
    customerId ? ['customer-lease-history', customerId] : null,
    () => leaseService.getCustomerLeaseHistory(customerId!),
    {
      revalidateOnFocus: false,
    }
  )
}

// Get cylinder's lease history
export const useCylinderLeaseHistory = (cylinderId?: number) => {
  return useSWR(
    cylinderId ? ['cylinder-lease-history', cylinderId] : null,
    () => leaseService.getLeases({ cylinderId }),
    {
      revalidateOnFocus: false,
    }
  )
}

// Get outlet statistics
export const useOutletLeaseStatistics = (outletId?: number, timeRange?: {
  startDate: string
  endDate: string
}) => {
  const key = outletId 
    ? ['outlet-lease-statistics', outletId, timeRange?.startDate, timeRange?.endDate]
    : null
    
  return useSWR(
    key,
    () => leaseService.getOutletStatistics(outletId!, timeRange),
    {
      revalidateOnFocus: false,
    }
  )
}

// Get overdue leases
export const useOverdueLeases = (outletId?: number) => {
  return useSWR(
    ['overdue-leases', outletId],
    () => leaseService.getOverdueLeases(outletId),
    {
      revalidateOnFocus: false,
      refreshInterval: 60000, // Refresh every minute
    }
  )
}

// Mutations
export const useLeaseMutations = () => {
  const createLease = useSWRMutation(
    'create-lease',
    async (_key, { arg }: { arg: any }) => {
      const result = await leaseService.createLease(arg)
      // Revalidate leases list
      await mutate((key: any) => Array.isArray(key) && key[0] === 'leases')
      await mutate(['customer-active-leases', arg.customerId])
      toast.success('Lease created successfully')
      return result
    }
  )

  const returnLease = useSWRMutation(
    'return-lease',
    async (_key, { arg }: { arg: { id: number; data: any } }) => {
      const result = await leaseService.returnLease(arg.id, arg.data)
      // Revalidate specific lease and lists
      await mutate(['lease', arg.id])
      await mutate((key: any) => Array.isArray(key) && key[0] === 'leases')
      await mutate((key: any) => Array.isArray(key) && key[0] === 'customer-active-leases')
      await mutate((key: any) => Array.isArray(key) && key[0] === 'overdue-leases')
      toast.success('Lease returned successfully')
      return result
    }
  )

  const checkEligibility = useSWRMutation(
    'check-eligibility',
    async (_key, { arg }: { arg: number }) => {
      return await leaseService.checkLeaseEligibility(arg)
    }
  )

  return {
    createLease,
    returnLease,
    checkEligibility,
  }
}