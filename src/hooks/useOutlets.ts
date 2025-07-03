import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'
import { outletService } from '@/services/api/outlet.service'
import type { OutletFilters } from '@/types/outlet'
import { toast } from 'react-hot-toast'

// Get outlets with filters
export function useOutlets(filters?: OutletFilters) {
  return useSWR(
    ['outlets', filters],
    async () => {
      const result = await outletService.getAllOutlets(filters)
      return result
    },
    {
      revalidateOnFocus: false,
    }
  )
}

// Get single outlet by ID
export function useOutlet(id?: number) {
  return useSWR(
    id ? ['outlet', id] : null,
    async () => {
      const result = await outletService.getOutletById(id!)
      return result
    },
    {
      revalidateOnFocus: false,
    }
  )
}

// Get outlet inventory
export function useOutletInventory(id?: number) {
  return useSWR(
    id ? ['outlet-inventory', id] : null,
    async () => {
      const result = await outletService.getOutletInventory(id!)
      return result
    },
    {
      revalidateOnFocus: false,
    }
  )
}

// Outlet mutations
export function useOutletMutations() {
  const createOutlet = useSWRMutation(
    'outlets',
    async (_key, { arg }: { arg: any }) => {
      const result = await outletService.createOutlet(arg)
      toast.success('Outlet created successfully')
      return result
    }
  )

  const updateOutlet = useSWRMutation(
    'outlets',
    async (_key, { arg }: { arg: { id: number; data: any } }) => {
      const result = await outletService.updateOutlet(arg.id, arg.data)
      toast.success('Outlet updated successfully')
      return result
    }
  )

  const deactivateOutlet = useSWRMutation(
    'outlets',
    async (_key, { arg }: { arg: number }) => {
      await outletService.deactivateOutlet(arg)
      toast.success('Outlet deactivated successfully')
    }
  )

  return {
    createOutlet,
    updateOutlet,
    deactivateOutlet,
  }
}