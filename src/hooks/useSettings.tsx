import { useState, useCallback } from 'react';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { useSession } from 'next-auth/react';
import { settingsService } from '@/services/api/settings.service';
import toast from '@/components/ui/toast';
import Notification from '@/components/ui/Notification';
import React from 'react';
import type {
  SettingCategory,
  BusinessSetting,
  PricingRule,
  SettingsAudit,
  CreateSettingDto,
  UpdateSettingDto,
  SettingsFilters,
  PricingContext,
  PricingResult,
  BulkPricingRequest,
  SettingsStatistics
} from '@/types/settings';

// Helper function for building SWR keys
const buildSettingsKey = (endpoint: string, params?: any) => {
  if (!params) return `settings/${endpoint}`;
  return `settings/${endpoint}/${JSON.stringify(params)}`;
};

// Hook for fetching settings with filters
export function useSettings(filters?: SettingsFilters) {
  const { data: session, status } = useSession();
  
  const key = status === 'authenticated' && session 
    ? buildSettingsKey('list', filters)
    : null;

  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => settingsService.getSettings(filters),
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds
    }
  );

  // Extract data from nested response structure
  const settings = data?.data?.data || [];
  const pagination = data?.data?.pagination;
  const total = pagination?.total || 0;

  return {
    settings,
    pagination,
    total,
    isLoading,
    error,
    mutate,
  };
}

// Hook for fetching settings by category
export function useSettingsByCategory(category: string, filters?: Omit<SettingsFilters, 'category'>) {
  const { data: session, status } = useSession();
  
  const key = status === 'authenticated' && session 
    ? buildSettingsKey(`category/${category}`, filters)
    : null;

  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => settingsService.getSettingsByCategory(category, filters),
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    }
  );

  const settings = data?.data?.data || [];
  const pagination = data?.data?.pagination;

  return {
    settings,
    pagination,
    isLoading,
    error,
    mutate,
  };
}

// Hook for fetching setting categories
export function useSettingCategories() {
  const { data: session, status } = useSession();
  
  const key = status === 'authenticated' && session 
    ? 'settings/categories'
    : null;

  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => settingsService.getCategories(),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute
    }
  );

  const categories = data?.data || [];

  return {
    categories,
    isLoading,
    error,
    mutate,
  };
}

// Hook for fetching a single setting
export function useSetting(
  key: string,
  scope?: {
    outletId?: number
    cylinderType?: string
    customerTier?: string
    operationType?: string
  }
) {
  const { data: session, status } = useSession();
  
  const swrKey = status === 'authenticated' && session && key
    ? buildSettingsKey(`key/${key}`, scope)
    : null;

  const { data, error, isLoading, mutate } = useSWR(
    swrKey,
    () => settingsService.getSetting(key, scope),
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    }
  );

  const setting = data?.data;

  return {
    setting,
    isLoading,
    error,
    mutate,
  };
}

// Hook for settings statistics
export function useSettingsStatistics(filters?: { period?: string; categoryId?: number; outletId?: number }) {
  const { data: session, status } = useSession();
  
  const key = status === 'authenticated' && session 
    ? buildSettingsKey('statistics', filters)
    : null;

  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => settingsService.getStatistics(filters),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  const statistics = data?.data;

  return {
    statistics,
    isLoading,
    error,
    mutate,
  };
}

// Hook for pricing calculations
export function usePricingCalculator() {
  const [isCalculating, setIsCalculating] = useState(false);
  const [lastResult, setLastResult] = useState<PricingResult | null>(null);

  const calculatePrice = useCallback(async (context: PricingContext) => {
    try {
      setIsCalculating(true);
      const response = await settingsService.calculatePrice(context);
      
      if (response.success && response.data) {
        setLastResult(response.data);
        return response.data;
      } else {
        throw new Error(response.error || 'Pricing calculation failed');
      }
    } catch (error: any) {
      console.error('Pricing calculation error:', error);
      toast.push(
        <Notification title="Calculation Error" type="danger">
          {error.message || 'Failed to calculate price'}
        </Notification>,
        { placement: 'top-center' }
      );
      throw error;
    } finally {
      setIsCalculating(false);
    }
  }, []);

  const calculateBulkPrice = useCallback(async (request: BulkPricingRequest) => {
    try {
      setIsCalculating(true);
      const response = await settingsService.calculateBulkPrice(request);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.error || 'Bulk pricing calculation failed');
      }
    } catch (error: any) {
      console.error('Bulk pricing calculation error:', error);
      toast.push(
        <Notification title="Calculation Error" type="danger">
          {error.message || 'Failed to calculate bulk price'}
        </Notification>,
        { placement: 'top-center' }
      );
      throw error;
    } finally {
      setIsCalculating(false);
    }
  }, []);

  return {
    calculatePrice,
    calculateBulkPrice,
    isCalculating,
    lastResult,
  };
}

// Hook for settings mutations
export function useSettingsMutations() {
  // Create setting mutation
  const { trigger: createSetting, isMutating: isCreating } = useSWRMutation(
    'settings/create',
    async (key: string, { arg }: { arg: CreateSettingDto }) => {
      const response = await settingsService.createSetting(arg);
      
      if (response.success) {
        toast.push(
          <Notification title="Success" type="success">
            Setting created successfully
          </Notification>,
          { placement: 'top-center' }
        );
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to create setting');
      }
    },
    {
      onError: (error: Error) => {
        toast.push(
          <Notification title="Error" type="danger">
            {error.message}
          </Notification>,
          { placement: 'top-center' }
        );
      },
    }
  );

  // Update setting mutation
  const { trigger: updateSetting, isMutating: isUpdating } = useSWRMutation(
    'settings/update',
    async (key: string, { arg }: { arg: UpdateSettingDto }) => {
      const response = await settingsService.updateSetting(arg);
      
      if (response.success) {
        toast.push(
          <Notification title="Success" type="success">
            Setting updated successfully
          </Notification>,
          { placement: 'top-center' }
        );
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to update setting');
      }
    },
    {
      onError: (error: Error) => {
        toast.push(
          <Notification title="Error" type="danger">
            {error.message}
          </Notification>,
          { placement: 'top-center' }
        );
      },
    }
  );

  // Delete setting mutation
  const { trigger: deleteSetting, isMutating: isDeleting } = useSWRMutation(
    'settings/delete',
    async (key: string, { arg }: { arg: { id: number; reason?: string } }) => {
      const response = await settingsService.deleteSetting(arg.id, arg.reason);
      
      if (response.success) {
        toast.push(
          <Notification title="Success" type="success">
            Setting deleted successfully
          </Notification>,
          { placement: 'top-center' }
        );
        return true;
      } else {
        throw new Error(response.error || 'Failed to delete setting');
      }
    },
    {
      onError: (error: Error) => {
        toast.push(
          <Notification title="Error" type="danger">
            {error.message}
          </Notification>,
          { placement: 'top-center' }
        );
      },
    }
  );

  // Bulk update mutation
  const { trigger: bulkUpdateSettings, isMutating: isBulkUpdating } = useSWRMutation(
    'settings/bulk-update',
    async (key: string, { arg }: { arg: { updates: UpdateSettingDto[]; reason?: string } }) => {
      const response = await settingsService.bulkUpdateSettings(arg.updates, arg.reason);
      
      if (response.success) {
        toast.push(
          <Notification title="Success" type="success">
            {arg.updates.length} settings updated successfully
          </Notification>,
          { placement: 'top-center' }
        );
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to update settings');
      }
    },
    {
      onError: (error: Error) => {
        toast.push(
          <Notification title="Error" type="danger">
            {error.message}
          </Notification>,
          { placement: 'top-center' }
        );
      },
    }
  );

  return {
    createSetting,
    updateSetting,
    deleteSetting,
    bulkUpdateSettings,
    isCreating,
    isUpdating,
    isDeleting,
    isBulkUpdating,
    isMutating: isCreating || isUpdating || isDeleting || isBulkUpdating,
  };
}

// Hook for audit logs
export function useSettingsAudit(filters?: {
  entityType?: 'BusinessSetting' | 'PricingRule' | 'SettingCategory'
  entityId?: number
  userId?: number
  action?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  limit?: number
}) {
  const { data: session, status } = useSession();
  
  const key = status === 'authenticated' && session 
    ? buildSettingsKey('audit', filters)
    : null;

  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => settingsService.getAuditLogs(filters),
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    }
  );

  const auditLogs = data?.data?.data || [];
  const pagination = data?.data?.pagination;

  return {
    auditLogs,
    pagination,
    isLoading,
    error,
    mutate,
  };
}

// Hook for importing/exporting settings
export function useSettingsImportExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const exportSettings = useCallback(async (filters?: {
    categoryId?: number
    format?: 'json' | 'csv'
    includeInactive?: boolean
  }) => {
    try {
      setIsExporting(true);
      const blob = await settingsService.exportSettings(filters);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `settings-export-${new Date().toISOString().split('T')[0]}.${filters?.format || 'csv'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.push(
        <Notification title="Success" type="success">
          Settings exported successfully
        </Notification>,
        { placement: 'top-center' }
      );
    } catch (error: any) {
      toast.push(
        <Notification title="Export Error" type="danger">
          {error.message || 'Failed to export settings'}
        </Notification>,
        { placement: 'top-center' }
      );
    } finally {
      setIsExporting(false);
    }
  }, []);

  const importSettings = useCallback(async (file: File, options?: {
    overwrite?: boolean
    validateOnly?: boolean
    reason?: string
  }) => {
    try {
      setIsImporting(true);
      const response = await settingsService.importSettings(file, options);
      
      if (response.success && response.data) {
        const { imported, updated, errors, warnings } = response.data;
        
        if (errors.length > 0) {
          toast.push(
            <Notification title="Import Completed with Errors" type="warning">
              {imported + updated} settings processed, {errors.length} errors
            </Notification>,
            { placement: 'top-center' }
          );
        } else {
          toast.push(
            <Notification title="Import Successful" type="success">
              {imported} imported, {updated} updated
            </Notification>,
            { placement: 'top-center' }
          );
        }
        
        return response.data;
      } else {
        throw new Error(response.error || 'Import failed');
      }
    } catch (error: any) {
      toast.push(
        <Notification title="Import Error" type="danger">
          {error.message || 'Failed to import settings'}
        </Notification>,
        { placement: 'top-center' }
      );
      throw error;
    } finally {
      setIsImporting(false);
    }
  }, []);

  const downloadTemplate = useCallback(async (format: 'json' | 'csv' = 'csv') => {
    try {
      const blob = await settingsService.getImportTemplate(format);
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `settings-template.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      toast.push(
        <Notification title="Download Error" type="danger">
          {error.message || 'Failed to download template'}
        </Notification>,
        { placement: 'top-center' }
      );
    }
  }, []);

  return {
    exportSettings,
    importSettings,
    downloadTemplate,
    isExporting,
    isImporting,
  };
}