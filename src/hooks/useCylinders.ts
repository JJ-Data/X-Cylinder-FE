import useSWR from 'swr'
import { cylinderService, type CylinderFilters } from '@/services/api/cylinder.service'
import { useCallback } from 'react'
import { mutate } from 'swr'

// Get cylinders with filters
export const useCylinders = (filters?: CylinderFilters) => {
  const key = ['cylinders', JSON.stringify(filters || {})]
  
  return useSWR(key, () => cylinderService.getCylinders(filters), {
    revalidateOnFocus: false,
  })
}

// Get single cylinder by ID
export const useCylinder = (id?: number) => {
  return useSWR(
    id ? ['cylinder', id] : null,
    () => cylinderService.getCylinderById(id!),
    {
      revalidateOnFocus: false,
    }
  )
}

// Get cylinder by QR code
export const useCylinderByCode = (code?: string) => {
  return useSWR(
    code ? ['cylinder-code', code] : null,
    () => cylinderService.getCylinderByCode(code!),
    {
      revalidateOnFocus: false,
    }
  )
}

// Get cylinder history
export const useCylinderHistory = (id?: number) => {
  return useSWR(
    id ? ['cylinder-history', id] : null,
    () => cylinderService.getCylinderHistory(id!),
    {
      revalidateOnFocus: false,
    }
  )
}

// Mutations
export const useCylinderMutations = () => {
  const createCylinder = useCallback(async (data: any) => {
    const result = await cylinderService.createCylinder(data)
    // Revalidate cylinders list
    mutate((key: any) => Array.isArray(key) && key[0] === 'cylinders')
    return result
  }, [])

  const updateCylinder = useCallback(async (id: number, data: any) => {
    const result = await cylinderService.updateCylinder(id, data)
    // Revalidate specific cylinder and list
    mutate(['cylinder', id])
    mutate((key: any) => Array.isArray(key) && key[0] === 'cylinders')
    return result
  }, [])

  const deleteCylinder = useCallback(async (id: number) => {
    await cylinderService.deleteCylinder(id)
    // Revalidate list
    mutate((key: any) => Array.isArray(key) && key[0] === 'cylinders')
  }, [])

  const transferCylinder = useCallback(async (data: { cylinderId: number; toOutletId: number; reason?: string; notes?: string }) => {
    const response = await fetch(`/api/proxy/cylinders/${data.cylinderId}/transfer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        toOutletId: data.toOutletId,
        reason: data.reason,
        notes: data.notes
      })
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to transfer cylinder')
    }
    
    const result = await response.json()
    
    // Revalidate specific cylinder and list
    mutate(['cylinder', data.cylinderId])
    mutate((key: any) => Array.isArray(key) && key[0] === 'cylinders')
    return result.data
  }, [])

  return {
    createCylinder,
    updateCylinder,
    deleteCylinder,
    transferCylinder,
  }
}