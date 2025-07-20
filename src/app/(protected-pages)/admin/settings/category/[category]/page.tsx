'use client'

import { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  PiGearDuotone,
  PiFolderDuotone,
  PiPlusDuotone,
  PiDownloadDuotone,
  PiUploadDuotone,
  PiMagnifyingGlassDuotone,
  PiFunnelDuotone,
  PiEyeDuotone,
  PiPencilDuotone,
  PiTrashDuotone,
  PiCopyDuotone,
  PiClockCounterClockwiseDuotone,
  PiWarningDuotone,
  PiCheckCircleDuotone,
  PiCalendarDuotone,
  PiBuildingOfficeDuotone,
  PiUsersDuotone,
  PiCylinderDuotone,
  PiTagDuotone,
  PiSortAscendingDuotone,
  PiDotsThreeVerticalDuotone,
} from 'react-icons/pi'
import { useSettingsByCategory, useSettingsMutations, useSettingsImportExport } from '@/hooks/useSettings'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Badge from '@/components/ui/Badge'
import Dropdown from '@/components/ui/Dropdown'
import DataTable from '@/components/shared/DataTable'
import Container from '@/components/shared/Container'
import Skeleton from '@/components/ui/Skeleton'
import useWindowSize from '@/components/ui/hooks/useWindowSize'
import { formatDate, formatCurrency } from '@/utils/format'
import { ColumnDef } from '@tanstack/react-table'
import type { BusinessSetting, SettingsFilters } from '@/types/settings'

// Scope icon mapping
const scopeIcons = {
  global: PiGearDuotone,
  outlet: PiBuildingOfficeDuotone,
  customerTier: PiUsersDuotone,
  cylinderType: PiCylinderDuotone,
  operationType: PiTagDuotone,
}

// Safe formatting utilities
const formatSettingValue = (value: any, dataType: string): string => {
  if (value === null || value === undefined) return '-'
  
  switch (dataType) {
    case 'number':
      return typeof value === 'number' ? value.toLocaleString() : String(value)
    case 'boolean':
      return value ? 'Yes' : 'No'
    case 'json':
    case 'array':
      return typeof value === 'object' ? JSON.stringify(value) : String(value)
    default:
      return String(value)
  }
}

const getScopeDisplay = (setting: BusinessSetting): { scope: string; icon: React.ComponentType<any>; level: number } => {
  const scopes = []
  let level = 0
  
  if (setting.customerTier) {
    scopes.push(`Customer: ${setting.customerTier}`)
    level++
  }
  if (setting.cylinderType) {
    scopes.push(`Type: ${setting.cylinderType}`)
    level++
  }
  if (setting.outletId) {
    scopes.push(`Outlet: ${setting.outletId}`)
    level++
  }
  if (setting.operationType) {
    scopes.push(`Op: ${setting.operationType}`)
    level++
  }
  
  if (scopes.length === 0) {
    return { scope: 'Global', icon: scopeIcons.global, level: 0 }
  }
  
  const icon = level === 1 
    ? (setting.customerTier ? scopeIcons.customerTier : 
       setting.cylinderType ? scopeIcons.cylinderType :
       setting.outletId ? scopeIcons.outlet : scopeIcons.operationType)
    : scopeIcons.global
    
  return { scope: scopes.join(' + '), icon, level }
}

// Setting card component for mobile
function SettingCard({ 
  setting, 
  onEdit, 
  onDelete, 
  onDuplicate,
  onViewHistory 
}: { 
  setting: BusinessSetting
  onEdit: (setting: BusinessSetting) => void
  onDelete: (setting: BusinessSetting) => void
  onDuplicate: (setting: BusinessSetting) => void
  onViewHistory: (setting: BusinessSetting) => void
}) {
  const { scope, icon: ScopeIcon, level } = getScopeDisplay(setting)
  
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="font-semibold text-gray-900 text-sm">{setting.settingKey}</h3>
            <Badge
              content={setting.dataType}
              innerClass="bg-gray-100 text-gray-700 text-xs"
            />
          </div>
          <p className="text-lg font-bold text-blue-600 mb-2">
            {formatSettingValue(setting.settingValue, setting.dataType)}
          </p>
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <ScopeIcon className="h-3 w-3" />
            <span>{scope}</span>
          </div>
          {setting.description && (
            <p className="text-sm text-gray-600 mt-1">{setting.description}</p>
          )}
        </div>
        <Dropdown
          renderTitle={
            <Button variant="plain" size="sm">
              <PiDotsThreeVerticalDuotone className="h-4 w-4" />
            </Button>
          }
          placement="bottom-end"
        >
          <Dropdown.Item onClick={() => onEdit(setting)}>
            <PiPencilDuotone className="h-4 w-4 mr-2" />
            Edit
          </Dropdown.Item>
          <Dropdown.Item onClick={() => onDuplicate(setting)}>
            <PiCopyDuotone className="h-4 w-4 mr-2" />
            Duplicate
          </Dropdown.Item>
          <Dropdown.Item onClick={() => onViewHistory(setting)}>
            <PiClockCounterClockwiseDuotone className="h-4 w-4 mr-2" />
            History
          </Dropdown.Item>
          <Dropdown.Item onClick={() => onDelete(setting)} className="text-red-600">
            <PiTrashDuotone className="h-4 w-4 mr-2" />
            Delete
          </Dropdown.Item>
        </Dropdown>
      </div>
      
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-4">
          <Badge
            content={setting.isActive ? 'Active' : 'Inactive'}
            innerClass={setting.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}
          />
          <span>v{setting.version}</span>
        </div>
        <span>Updated {formatDate(setting.updatedAt)}</span>
      </div>
    </Card>
  )
}

export default function CategorySettingsPage() {
  const router = useRouter()
  const params = useParams()
  const windowSize = useWindowSize()
  const isMobile = (windowSize.width || 0) < 768
  
  const category = (params?.category as string)?.toUpperCase() || ''
  
  // State
  const [filters, setFilters] = useState<Omit<SettingsFilters, 'category'>>({
    page: 1,
    limit: 20,
    search: '',
    isActive: undefined,
    sortBy: 'settingKey',
    sortOrder: 'asc'
  })
  const [selectedSettings, setSelectedSettings] = useState<number[]>([])
  
  // Data hooks
  const { settings, pagination, isLoading, error, mutate } = useSettingsByCategory(category, filters)
  const { deleteSetting, isDeleting } = useSettingsMutations()
  const { exportSettings, isExporting } = useSettingsImportExport()
  
  // Handlers
  const handleCreate = useCallback(() => {
    router.push(`/admin/settings/new?category=${category}`)
  }, [router, category])
  
  const handleEdit = useCallback((setting: BusinessSetting) => {
    router.push(`/admin/settings/setting/${setting.id}/edit`)
  }, [router])
  
  const handleDuplicate = useCallback((setting: BusinessSetting) => {
    router.push(`/admin/settings/setting/${setting.id}/duplicate`)
  }, [router])
  
  const handleViewHistory = useCallback((setting: BusinessSetting) => {
    router.push(`/admin/settings/setting/${setting.id}/history`)
  }, [router])
  
  const handleDelete = useCallback(async (setting: BusinessSetting) => {
    if (!confirm(`Are you sure you want to delete "${setting.settingKey}"?`)) return
    
    try {
      await deleteSetting({ id: setting.id, reason: 'Deleted from category view' })
      mutate()
    } catch (error) {
      console.error('Delete error:', error)
    }
  }, [deleteSetting, mutate])
  
  const handleFilterChange = useCallback((key: keyof typeof filters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : value
    }))
  }, [])
  
  const handleBulkExport = useCallback(() => {
    exportSettings({ 
      categoryId: settings[0]?.categoryId,
      format: 'csv' 
    })
  }, [exportSettings, settings])
  
  // Table columns
  const columns: ColumnDef<BusinessSetting>[] = useMemo(() => [
    {
      accessorKey: 'settingKey',
      header: 'Setting Key',
      cell: ({ row }) => {
        const setting = row.original
        const { scope, icon: ScopeIcon, level } = getScopeDisplay(setting)
        
        return (
          <div className="min-w-0">
            <div className="font-medium text-gray-900 truncate">
              {setting.settingKey}
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <ScopeIcon className="h-3 w-3 text-gray-400 flex-shrink-0" />
              <span className="text-xs text-gray-500 truncate">{scope}</span>
            </div>
          </div>
        )
      }
    },
    {
      accessorKey: 'settingValue',
      header: 'Value',
      cell: ({ row }) => {
        const setting = row.original
        return (
          <div className="min-w-0">
            <div className="font-medium text-blue-600 truncate">
              {formatSettingValue(setting.settingValue, setting.dataType)}
            </div>
            <Badge
              content={setting.dataType}
              innerClass="bg-gray-100 text-gray-700 text-xs mt-1"
            />
          </div>
        )
      }
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => (
        <div className="max-w-xs truncate text-gray-600">
          {row.original.description || '-'}
        </div>
      )
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => {
        const setting = row.original
        return (
          <div className="space-y-1">
            <Badge
              content={setting.isActive ? 'Active' : 'Inactive'}
              innerClass={setting.isActive 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-700'
              }
            />
            <div className="text-xs text-gray-500">v{setting.version}</div>
          </div>
        )
      }
    },
    {
      accessorKey: 'updatedAt',
      header: 'Last Updated',
      cell: ({ row }) => (
        <div className="text-sm text-gray-600">
          {formatDate(row.original.updatedAt)}
        </div>
      )
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const setting = row.original
        return (
          <Dropdown
            renderTitle={
              <Button variant="plain" size="sm">
                <PiDotsThreeVerticalDuotone className="h-4 w-4" />
              </Button>
            }
            placement="bottom-end"
          >
            <Dropdown.Item onClick={() => handleEdit(setting)}>
              <PiPencilDuotone className="h-4 w-4 mr-2" />
              Edit
            </Dropdown.Item>
            <Dropdown.Item onClick={() => handleDuplicate(setting)}>
              <PiCopyDuotone className="h-4 w-4 mr-2" />
              Duplicate
            </Dropdown.Item>
            <Dropdown.Item onClick={() => handleViewHistory(setting)}>
              <PiClockCounterClockwiseDuotone className="h-4 w-4 mr-2" />
              History
            </Dropdown.Item>
            <Dropdown.Item onClick={() => handleDelete(setting)} className="text-red-600">
              <PiTrashDuotone className="h-4 w-4 mr-2" />
              Delete
            </Dropdown.Item>
          </Dropdown>
        )
      }
    }
  ], [handleEdit, handleDuplicate, handleViewHistory, handleDelete])
  
  if (error) {
    return (
      <Container>
        <Card className="p-8 text-center">
          <PiWarningDuotone className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Settings</h3>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <Button onClick={() => mutate()}>Try Again</Button>
        </Card>
      </Container>
    )
  }
  
  return (
    <Container>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
          <Link href="/admin/settings" className="hover:text-blue-600">Settings</Link>
          <span>/</span>
          <span className="text-gray-900">{category}</span>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <PiFolderDuotone className="h-6 w-6 mr-2 text-blue-600" />
              {category} Settings
            </h1>
            <p className="text-gray-600 mt-1">
              Manage {category.toLowerCase()} configuration and business rules
            </p>
          </div>
          
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <Button
              variant="plain"
              onClick={handleBulkExport}
              loading={isExporting}
              className="flex items-center"
            >
              <PiDownloadDuotone className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button
              onClick={handleCreate}
              className="flex items-center"
            >
              <PiPlusDuotone className="h-4 w-4 mr-2" />
              New Setting
            </Button>
          </div>
        </div>
      </div>
      
      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Search settings..."
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            prefix={<PiMagnifyingGlassDuotone className="h-4 w-4" />}
          />
          
          <Select
            placeholder="Status"
            value={filters.isActive?.toString() || ''}
            onChange={(selectedOption: any) => handleFilterChange('isActive', 
              selectedOption?.value === '' ? undefined : selectedOption?.value === 'true'
            )}
            options={[
              { value: '', label: 'All Status' },
              { value: 'true', label: 'Active' },
              { value: 'false', label: 'Inactive' }
            ]}
          />
          
          <Select
            placeholder="Sort by"
            value={filters.sortBy || 'settingKey'}
            onChange={(selectedOption: any) => handleFilterChange('sortBy', selectedOption?.value)}
            options={[
              { value: 'settingKey', label: 'Setting Key' },
              { value: 'settingValue', label: 'Value' },
              { value: 'updatedAt', label: 'Last Updated' },
              { value: 'priority', label: 'Priority' }
            ]}
          />
          
          <Select
            placeholder="Order"
            value={filters.sortOrder || 'asc'}
            onChange={(selectedOption: any) => handleFilterChange('sortOrder', selectedOption?.value)}
            options={[
              { value: 'asc', label: 'Ascending' },
              { value: 'desc', label: 'Descending' }
            ]}
          />
        </div>
      </Card>
      
      {/* Content */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="p-4">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-16" />
                <div className="flex-1" />
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {isMobile ? (
            // Mobile card view
            <div className="space-y-4">
              {settings.map((setting) => (
                <SettingCard
                  key={setting.id}
                  setting={setting}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onDuplicate={handleDuplicate}
                  onViewHistory={handleViewHistory}
                />
              ))}
            </div>
          ) : (
            // Desktop table view
            <DataTable
              columns={columns}
              data={settings}
              pagingData={{
                total: pagination?.total || 0,
                pageIndex: (pagination?.page || 1) - 1,
                pageSize: pagination?.limit || 20,
              }}
              onPaginationChange={(page) => handleFilterChange('page', page + 1)}
            />
          )}
          
          {/* Empty State */}
          {settings.length === 0 && (
            <Card className="p-12 text-center">
              <PiGearDuotone className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Settings Found
              </h3>
              <p className="text-gray-600 mb-6">
                {filters.search || filters.isActive !== undefined
                  ? 'Try adjusting your filters or search terms'
                  : `Get started by creating your first ${category.toLowerCase()} setting`
                }
              </p>
              {(!filters.search && filters.isActive === undefined) && (
                <Button onClick={handleCreate}>
                  <PiPlusDuotone className="h-4 w-4 mr-2" />
                  Create Setting
                </Button>
              )}
            </Card>
          )}
        </>
      )}
    </Container>
  )
}