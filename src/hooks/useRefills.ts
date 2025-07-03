import useSWR from 'swr'
import { refillService, type RefillFilters } from '@/services/api/refill.service'
import { useCallback } from 'react'
import { mutate } from 'swr'

// Get refills with filters
export const useRefills = (filters?: RefillFilters) => {
  const key = ['refills', JSON.stringify(filters || {})]
  
  return useSWR(key, () => refillService.getRefills(filters), {
    revalidateOnFocus: false,
  })
}

// Get single refill by ID
export const useRefill = (id?: number) => {
  return useSWR(
    id ? ['refill', id] : null,
    () => refillService.getRefillById(id!),
    {
      revalidateOnFocus: false,
    }
  )
}

// Get cylinder refill history
export const useCylinderRefillHistory = (cylinderId?: number) => {
  return useSWR(
    cylinderId ? ['cylinder-refill-history', cylinderId] : null,
    () => refillService.getCylinderRefillHistory(cylinderId!),
    {
      revalidateOnFocus: false,
    }
  )
}

// Get operator statistics
export const useOperatorRefillStatistics = (
  operatorId?: number,
  timeRange?: { startDate: string; endDate: string }
) => {
  const key = operatorId
    ? ['operator-refill-statistics', operatorId, timeRange?.startDate, timeRange?.endDate]
    : null
    
  return useSWR(
    key,
    () => refillService.getOperatorStatistics(operatorId!, timeRange),
    {
      revalidateOnFocus: false,
    }
  )
}

// Get outlet statistics
export const useOutletRefillStatistics = (
  outletId?: number,
  timeRange?: { startDate: string; endDate: string }
) => {
  const key = outletId
    ? ['outlet-refill-statistics', outletId, timeRange?.startDate, timeRange?.endDate]
    : null
    
  return useSWR(
    key,
    () => refillService.getOutletStatistics(outletId!, timeRange),
    {
      revalidateOnFocus: false,
    }
  )
}

// Mutations
export const useRefillMutations = () => {
  const createRefill = useCallback(async (data: any) => {
    const result = await refillService.createRefill(data)
    // Revalidate refills list and statistics
    mutate((key: any) => Array.isArray(key) && key[0] === 'refills')
    mutate((key: any) => Array.isArray(key) && key[0] === 'operator-refill-statistics')
    mutate((key: any) => Array.isArray(key) && key[0] === 'outlet-refill-statistics')
    mutate(['cylinder-refill-history', data.cylinderId])
    return result
  }, [])

  const createBulkRefills = useCallback(async (data: any) => {
    const result = await refillService.createBulkRefills(data)
    // Revalidate all refill-related data
    mutate((key: any) => Array.isArray(key) && key[0] === 'refills')
    mutate((key: any) => Array.isArray(key) && key[0].includes('statistics'))
    return result
  }, [])

  const validateCylinder = useCallback(async (cylinderCode: string) => {
    return await refillService.validateCylinderForRefill(cylinderCode)
  }, [])

  return {
    createRefill,
    createBulkRefills,
    validateCylinder,
  }
}