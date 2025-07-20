import { useState, useCallback } from 'react';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { useSession } from 'next-auth/react';
import { swapService } from '@/services/api/swap.service';
import toast from '@/components/ui/toast';
import Notification from '@/components/ui/Notification';
import React from 'react';
import type {
  SwapRecord,
  CreateSwapDto,
  SwapFilters,
  SwapStatistics,
  SwapReceiptData,
} from '@/types/swap';

// Helper function for building SWR keys
const buildSwapKey = (endpoint: string, params?: any) => {
  if (!params) return `swaps/${endpoint}`;
  return `swaps/${endpoint}/${JSON.stringify(params)}`;
};

// Hook for fetching swaps with filters
export function useSwaps(filters?: SwapFilters) {
  const { data: session, status } = useSession();
  
  const key = status === 'authenticated' && session 
    ? buildSwapKey('list', filters)
    : null;
  
  return useSWR(key, () => swapService.getSwaps(filters), {
    revalidateOnFocus: false,
    refreshInterval: 30000, // Refresh every 30 seconds
  });
}

// Hook for fetching a specific swap
export function useSwap(id: number) {
  const { data: session, status } = useSession();
  
  const key = status === 'authenticated' && session && id 
    ? buildSwapKey('detail', id)
    : null;
  
  return useSWR(key, () => swapService.getSwapById(id), {
    revalidateOnFocus: false,
  });
}

// Hook for fetching swap receipt
export function useSwapReceipt(id: number) {
  const { data: session, status } = useSession();
  
  const key = status === 'authenticated' && session && id 
    ? buildSwapKey('receipt', id)
    : null;
  
  return useSWR(key, () => swapService.getSwapReceipt(id), {
    revalidateOnFocus: false,
  });
}

// Hook for fetching swap statistics
export function useSwapStatistics(filters?: {
  dateFrom?: string;
  dateTo?: string;
  outletId?: number;
  staffId?: number;
}) {
  const { data: session, status } = useSession();
  
  const key = status === 'authenticated' && session 
    ? buildSwapKey('statistics', filters)
    : null;
  
  return useSWR(key, () => swapService.getSwapStatistics(filters), {
    revalidateOnFocus: false,
    refreshInterval: 60000, // Refresh every minute
  });
}

// Hook for fetching available cylinders
export function useAvailableCylinders(type?: string) {
  const { data: session, status } = useSession();
  
  const key = status === 'authenticated' && session 
    ? buildSwapKey('available-cylinders', type)
    : null;
  
  return useSWR(key, () => swapService.getAvailableCylinders(type), {
    revalidateOnFocus: false,
    refreshInterval: 30000, // Refresh every 30 seconds
  });
}

// Hook for creating swaps
export function useCreateSwap() {
  return useSWRMutation(
    'swaps/create',
    async (_key: string, { arg }: { arg: CreateSwapDto }) => {
      return await swapService.createSwap(arg);
    },
    {
      onSuccess: () => {
        toast.push(
          React.createElement(Notification, {
            title: 'Success',
            type: 'success'
          }, 'Cylinder swap completed successfully')
        );
      },
      onError: (error: any) => {
        toast.push(
          React.createElement(Notification, {
            title: 'Error', 
            type: 'danger'
          }, error.message || 'Failed to create swap')
        );
      },
    }
  );
}

// Hook for marking receipt as printed
export function useMarkReceiptPrinted() {
  return useSWRMutation(
    'swaps/mark-receipt-printed',
    async (_key: string, { arg }: { arg: number }) => {
      return await swapService.markReceiptPrinted(arg);
    },
    {
      onSuccess: () => {
        toast.push(
          React.createElement(Notification, {
            title: 'Success',
            type: 'success'
          }, 'Receipt marked as printed')
        );
      },
      onError: (error: any) => {
        toast.push(
          React.createElement(Notification, {
            title: 'Error',
            type: 'danger'
          }, error.message || 'Failed to mark receipt as printed')
        );
      },
    }
  );
}

// Hook for finding cylinder by identifier
export function useFindCylinder() {
  const [isSearching, setIsSearching] = useState(false);

  const findCylinder = useCallback(async (identifier: {
    leaseId?: number;
    cylinderCode?: string;
    qrCode?: string;
  }) => {
    try {
      setIsSearching(true);
      const result = await swapService.findCylinder(identifier);
      return result;
    } catch (error: any) {
      toast.push(
        React.createElement(Notification, {
          title: 'Error',
          type: 'danger'
        }, error.message || 'Cylinder not found')
      );
      throw error;
    } finally {
      setIsSearching(false);
    }
  }, []);

  return {
    findCylinder,
    isSearching,
  };
}

// Comprehensive swap management hook
export function useSwapManagement() {
  const createSwap = useCreateSwap();
  const markReceiptPrinted = useMarkReceiptPrinted();
  const { findCylinder, isSearching } = useFindCylinder();

  return {
    // Mutations
    createSwap: createSwap.trigger,
    markReceiptPrinted: markReceiptPrinted.trigger,
    findCylinder,

    // Loading states
    isCreatingSwap: createSwap.isMutating,
    isMarkingReceipt: markReceiptPrinted.isMutating,
    isSearchingCylinder: isSearching,

    // Error states
    createSwapError: createSwap.error,
    markReceiptError: markReceiptPrinted.error,
  };
}