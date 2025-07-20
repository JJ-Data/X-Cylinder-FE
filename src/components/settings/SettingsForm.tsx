'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  PiGearDuotone,
  PiFloppyDiskDuotone,
  PiXDuotone,
  PiInfoDuotone,
  PiWarningDuotone,
  PiCheckCircleDuotone,
  PiCurrencyDollarDuotone,
  PiCalendarDuotone,
  PiBuildingOfficeDuotone,
  PiUsersDuotone,
  PiCylinderDuotone,
  PiTagDuotone,
  PiCodeDuotone,
  PiTextAaDuotone,
  PiToggleLeftDuotone,
  PiListNumbersDuotone,
  PiSpinnerDuotone,
  PiClockDuotone,
} from 'react-icons/pi'
import { useSettingsMutations, useSettingCategories } from '@/hooks/useSettings'
import { useOutlets } from '@/hooks/useOutlets'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Switcher from '@/components/ui/Switcher'
import Badge from '@/components/ui/Badge'
import useWindowSize from '@/components/ui/hooks/useWindowSize'
import { formatCurrency } from '@/utils/formatCurrency'
import type { 
  BusinessSetting, 
  CreateSettingDto, 
  UpdateSettingDto, 
  OperationType, 
  CustomerTier, 
  DataType 
} from '@/types/settings'

interface SettingsFormProps {
  setting?: BusinessSetting | null
  mode: 'create' | 'edit' | 'duplicate'
  categoryId?: number
  onSuccess?: (setting: BusinessSetting) => void
  onCancel?: () => void
  className?: string
}

const dataTypes: { value: DataType; label: string; icon: React.ComponentType<any>; description: string }[] = [
  { value: 'STRING', label: 'Text', icon: PiTextAaDuotone, description: 'String values' },
  { value: 'NUMBER', label: 'Number', icon: PiCurrencyDollarDuotone, description: 'Numeric values' },
  { value: 'BOOLEAN', label: 'Boolean', icon: PiToggleLeftDuotone, description: 'True/false values' },
  { value: 'JSON', label: 'JSON', icon: PiCodeDuotone, description: 'Complex objects' },
  { value: 'ARRAY', label: 'Array', icon: PiListNumbersDuotone, description: 'List of values' },
]

const operationTypes: { value: OperationType; label: string; icon: React.ComponentType<any> }[] = [
  { value: 'LEASE', label: 'Cylinder Lease', icon: PiCalendarDuotone },
  { value: 'REFILL', label: 'Gas Refill', icon: PiCylinderDuotone },
  { value: 'SWAP', label: 'Cylinder Swap', icon: PiTagDuotone },
  { value: 'REGISTRATION', label: 'Customer Registration', icon: PiUsersDuotone },
  { value: 'PENALTY', label: 'Late Penalty', icon: PiWarningDuotone },
  { value: 'DEPOSIT', label: 'Security Deposit', icon: PiCheckCircleDuotone },
]

const customerTiers: { value: CustomerTier; label: string; description: string }[] = [
  { value: 'REGULAR', label: 'Regular', description: 'Standard customers' },
  { value: 'BUSINESS', label: 'Business', description: 'Business customers' },
  { value: 'PREMIUM', label: 'Premium', description: 'Premium customers' },
]

const cylinderTypes = [
  { value: '5kg', label: '5kg Cylinder' },
  { value: '10kg', label: '10kg Cylinder' },
  { value: '15kg', label: '15kg Cylinder' },
  { value: '20kg', label: '20kg Cylinder' },
  { value: '50kg', label: '50kg Cylinder' },
]

const priorityLevels = [
  { value: 1, label: 'Very Low' },
  { value: 2, label: 'Low' },
  { value: 3, label: 'Medium' },
  { value: 4, label: 'High' },
  { value: 5, label: 'Very High' },
]

export default function SettingsForm({ 
  setting, 
  mode, 
  categoryId,
  onSuccess, 
  onCancel,
  className 
}: SettingsFormProps) {
  const router = useRouter()
  const windowSize = useWindowSize()
  const isMobile = (windowSize.width || 0) < 768
  
  // Data hooks
  const { categories } = useSettingCategories()
  const { data: outletsResponse } = useOutlets()
  const outlets = outletsResponse?.outlets || []
  const { createSetting, updateSetting, isCreating, isUpdating } = useSettingsMutations()
  
  // Form state
  const [formData, setFormData] = useState<Partial<CreateSettingDto | UpdateSettingDto>>({
    categoryId: categoryId || setting?.categoryId || 0,
    settingKey: mode === 'duplicate' ? `${setting?.settingKey}_copy` : setting?.settingKey || '',
    settingValue: setting?.settingValue || '',
    dataType: (setting?.dataType?.toUpperCase() as DataType) || 'STRING',
    description: setting?.description || '',
    isActive: setting?.isActive !== undefined ? setting.isActive : true,
    priority: setting?.priority || 3,
    outletId: setting?.outletId || undefined,
    cylinderType: setting?.cylinderType || undefined,
    customerTier: (setting?.customerTier?.toUpperCase() as CustomerTier) || undefined,
    operationType: setting?.operationType || undefined,
    effectiveDate: setting?.effectiveDate ? new Date(setting.effectiveDate).toISOString().split('T')[0] : '',
    expiryDate: setting?.expiryDate ? new Date(setting.expiryDate).toISOString().split('T')[0] : '',
    reason: '',
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [jsonError, setJsonError] = useState<string>('')
  
  const isLoading = isCreating || isUpdating
  const selectedDataType = dataTypes.find(dt => dt.value === formData.dataType)
  const selectedCategory = categories.find(cat => cat.id === formData.categoryId)
  
  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.categoryId) {
      newErrors.categoryId = 'Category is required'
    }
    
    if (!formData.settingKey?.trim()) {
      newErrors.settingKey = 'Setting key is required'
    } else if (!/^[A-Z][A-Z0-9_]*$/.test(formData.settingKey)) {
      newErrors.settingKey = 'Setting key must be uppercase with underscores only'
    }
    
    if (formData.settingValue === '' || formData.settingValue === null || formData.settingValue === undefined) {
      newErrors.settingValue = 'Setting value is required'
    } else {
      // Validate based on data type
      if (formData.dataType === 'NUMBER') {
        if (isNaN(Number(formData.settingValue))) {
          newErrors.settingValue = 'Must be a valid number'
        }
      } else if (formData.dataType === 'JSON') {
        try {
          JSON.parse(String(formData.settingValue))
          setJsonError('')
        } catch (e) {
          newErrors.settingValue = 'Must be valid JSON'
          setJsonError('Invalid JSON format')
        }
      } else if (formData.dataType === 'ARRAY') {
        try {
          const parsed = JSON.parse(String(formData.settingValue))
          if (!Array.isArray(parsed)) {
            newErrors.settingValue = 'Must be a valid array'
          }
          setJsonError('')
        } catch (e) {
          newErrors.settingValue = 'Must be valid JSON array'
          setJsonError('Invalid JSON array format')
        }
      }
    }
    
    if (formData.effectiveDate && formData.expiryDate) {
      if (new Date(formData.effectiveDate) >= new Date(formData.expiryDate)) {
        newErrors.expiryDate = 'Expiry date must be after effective date'
      }
    }
    
    if (mode !== 'create' && !formData.reason?.trim()) {
      newErrors.reason = 'Reason for change is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  // Handle form field changes
  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear errors for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }
  
  // Handle data type change
  const handleDataTypeChange = (dataType: DataType) => {
    setFormData(prev => ({
      ...prev,
      dataType,
      settingValue: dataType === 'BOOLEAN' ? false : 
                    dataType === 'NUMBER' ? 0 :
                    dataType === 'JSON' ? '{}' :
                    dataType === 'ARRAY' ? '[]' : ''
    }))
  }
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    try {
      let result: BusinessSetting | undefined
      
      if (mode === 'create' || mode === 'duplicate') {
        result = await createSetting(formData as CreateSettingDto)
      } else {
        result = await updateSetting({
          id: setting!.id,
          ...formData
        } as UpdateSettingDto)
      }
      
      if (result) {
        onSuccess?.(result)
      }
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }
  
  // Handle cancel
  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      router.back()
    }
  }
  
  // Render value input based on data type
  const renderValueInput = () => {
    const commonProps = {
      value: String(formData.settingValue || ''),
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => 
        handleChange('settingValue', formData.dataType === 'NUMBER' ? Number(e.target.value) : e.target.value),
      disabled: isLoading,
      invalid: !!errors.settingValue
    }
    
    switch (formData.dataType) {
      case 'NUMBER':
        return (
          <div>
            <Input
              {...commonProps}
              type="number"
              step="any"
              placeholder="Enter numeric value"
            />
            {errors.settingValue && (
              <p className="text-red-600 text-xs mt-1">{errors.settingValue}</p>
            )}
          </div>
        )
      
      case 'BOOLEAN':
        return (
          <div className="flex items-center space-x-3">
            <Switcher
              checked={Boolean(formData.settingValue)}
              onChange={(checked) => handleChange('settingValue', checked)}
              disabled={isLoading}
            />
            <span className="text-sm text-gray-600">
              {Boolean(formData.settingValue) ? 'True' : 'False'}
            </span>
          </div>
        )
      
      case 'JSON':
      case 'ARRAY':
        return (
          <div>
            <Input
              {...commonProps}
              textArea
              rows={6}
              placeholder={formData.dataType === 'JSON' ? '{"key": "value"}' : '["item1", "item2"]'}
              className="font-mono text-sm"
            />
            {jsonError && (
              <p className="text-red-600 text-xs mt-1">{jsonError}</p>
            )}
          </div>
        )
      
      default:
        return (
          <div>
            <Input
              {...commonProps}
              placeholder="Enter text value"
            />
            {errors.settingValue && (
              <p className="text-red-600 text-xs mt-1">{errors.settingValue}</p>
            )}
          </div>
        )
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 rounded-lg bg-blue-100">
            <PiGearDuotone className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {mode === 'create' ? 'Create Setting' : 
               mode === 'edit' ? 'Edit Setting' : 'Duplicate Setting'}
            </h2>
            <p className="text-gray-600">
              {mode === 'create' ? 'Add a new business setting' :
               mode === 'edit' ? 'Modify existing setting' : 'Create a copy of this setting'}
            </p>
          </div>
        </div>
        
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <Select
              value={formData.categoryId?.toString() || ''}
              onChange={(selectedOption: any) => handleChange('categoryId', selectedOption?.value ? parseInt(selectedOption.value) : 0)}
              isDisabled={isLoading}
              options={[
                { value: '', label: 'Select Category' },
                ...categories.map((category) => ({
                  value: category.id.toString(),
                  label: category.name
                }))
              ]}
            />
            {errors.categoryId && (
              <p className="text-red-600 text-xs mt-1">{errors.categoryId}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Setting Key *
            </label>
            <Input
              value={formData.settingKey || ''}
              onChange={(e) => handleChange('settingKey', e.target.value.toUpperCase())}
              placeholder="SETTING_KEY_NAME"
              disabled={isLoading}
              invalid={!!errors.settingKey}
            />
            {errors.settingKey ? (
              <p className="text-red-600 text-xs mt-1">{errors.settingKey}</p>
            ) : (
              <p className="text-xs text-gray-500 mt-1">
                Uppercase letters, numbers, and underscores only
              </p>
            )}
          </div>
        </div>
      </Card>
      
      {/* Value Configuration */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Value Configuration</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data Type *
            </label>
            <Select
              value={formData.dataType || 'STRING'}
              onChange={(selectedOption: any) => handleDataTypeChange(selectedOption?.value as DataType)}
              isDisabled={isLoading}
              options={dataTypes.map((type) => ({
                value: type.value,
                label: type.label,
                icon: type.icon,
                description: type.description
              }))}
              components={{
                Option: ({ data, label, ...props }: any) => (
                  <div
                    {...props.innerProps}
                    className="select-option flex items-center p-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {data.icon && <data.icon className="h-4 w-4 mr-2" />}
                    <div>
                      <div className="font-medium">{label}</div>
                      <div className="text-xs text-gray-500">{data.description}</div>
                    </div>
                  </div>
                )
              }}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Value *
            </label>
            {renderValueInput()}
            {selectedDataType && (
              <p className="text-xs text-gray-500 mt-1">
                {selectedDataType.description}
              </p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <Input
              textArea
              value={formData.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe what this setting controls..."
              rows={3}
              disabled={isLoading}
            />
          </div>
        </div>
      </Card>
      
      {/* Scope Configuration */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Scope Configuration</h3>
        <p className="text-sm text-gray-600 mb-4">
          Leave empty for global settings. Specify values to create scoped overrides.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <PiBuildingOfficeDuotone className="h-4 w-4 inline mr-1" />
              Outlet
            </label>
            <Select
              value={formData.outletId?.toString() || ''}
              onChange={(selectedOption: any) => handleChange('outletId', selectedOption?.value ? parseInt(selectedOption.value) : undefined)}
              isDisabled={isLoading}
              options={[
                { value: '', label: 'All Outlets (Global)' },
                ...outlets.map((outlet) => ({
                  value: outlet.id.toString(),
                  label: outlet.name
                }))
              ]}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <PiCylinderDuotone className="h-4 w-4 inline mr-1" />
              Cylinder Type
            </label>
            <Select
              value={formData.cylinderType || ''}
              onChange={(selectedOption: any) => handleChange('cylinderType', selectedOption?.value || undefined)}
              isDisabled={isLoading}
              options={[
                { value: '', label: 'All Types' },
                ...cylinderTypes
              ]}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <PiUsersDuotone className="h-4 w-4 inline mr-1" />
              Customer Tier
            </label>
            <Select
              value={formData.customerTier || ''}
              onChange={(selectedOption: any) => handleChange('customerTier', selectedOption?.value as CustomerTier || undefined)}
              isDisabled={isLoading}
              options={[
                { value: '', label: 'All Tiers' },
                ...customerTiers.map((tier) => ({
                  value: tier.value,
                  label: tier.label,
                  description: tier.description
                }))
              ]}
              components={{
                Option: ({ data, label, ...props }: any) => (
                  <div
                    {...props.innerProps}
                    className="select-option p-2 hover:bg-gray-100 cursor-pointer"
                  >
                    <div className="font-medium">{label}</div>
                    <div className="text-xs text-gray-500">{data.description}</div>
                  </div>
                )
              }}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <PiTagDuotone className="h-4 w-4 inline mr-1" />
              Operation Type
            </label>
            <Select
              value={formData.operationType || ''}
              onChange={(selectedOption: any) => handleChange('operationType', selectedOption?.value as OperationType || undefined)}
              isDisabled={isLoading}
              options={[
                { value: '', label: 'All Operations' },
                ...operationTypes.map((op) => ({
                  value: op.value,
                  label: op.label,
                  icon: op.icon
                }))
              ]}
              components={{
                Option: ({ data, label, ...props }: any) => (
                  <div
                    {...props.innerProps}
                    className="select-option flex items-center p-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {data.icon && <data.icon className="h-4 w-4 mr-2" />}
                    {label}
                  </div>
                )
              }}
            />
          </div>
        </div>
      </Card>
      
      {/* Advanced Options */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Advanced Options</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority Level
            </label>
            <Select
              value={formData.priority?.toString() || '3'}
              onChange={(selectedOption: any) => handleChange('priority', selectedOption?.value ? parseInt(selectedOption.value) : 3)}
              isDisabled={isLoading}
              options={priorityLevels.map((level) => ({
                value: level.value.toString(),
                label: level.label
              }))}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <PiCalendarDuotone className="h-4 w-4 inline mr-1" />
              Effective Date
            </label>
            <Input
              type="date"
              value={formData.effectiveDate || ''}
              onChange={(e) => handleChange('effectiveDate', e.target.value)}
              disabled={isLoading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <PiClockDuotone className="h-4 w-4 inline mr-1" />
              Expiry Date
            </label>
            <Input
              type="date"
              value={formData.expiryDate || ''}
              onChange={(e) => handleChange('expiryDate', e.target.value)}
              disabled={isLoading}
              invalid={!!errors.expiryDate}
            />
            {errors.expiryDate && (
              <p className="text-red-600 text-xs mt-1">{errors.expiryDate}</p>
            )}
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex items-center space-x-3">
            <Switcher
              checked={Boolean(formData.isActive)}
              onChange={(checked) => handleChange('isActive', checked)}
              disabled={isLoading}
            />
            <div>
              <span className="text-sm font-medium text-gray-700">Active Setting</span>
              <p className="text-xs text-gray-500">Inactive settings are ignored during resolution</p>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Change Reason (for edits) */}
      {mode !== 'create' && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Information</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Change *
            </label>
            <Input
              textArea
              value={formData.reason || ''}
              onChange={(e) => handleChange('reason', e.target.value)}
              placeholder="Explain why this change is being made..."
              rows={3}
              disabled={isLoading}
              invalid={!!errors.reason}
            />
            {errors.reason && (
              <p className="text-red-600 text-xs mt-1">{errors.reason}</p>
            )}
          </div>
        </Card>
      )}
      
      {/* Actions */}
      <div className="flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-3">
        <Button
          type="button"
          variant="plain"
          onClick={handleCancel}
          disabled={isLoading}
          className="flex items-center justify-center"
        >
          <PiXDuotone className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button
          type="submit"
          loading={isLoading}
          className="flex items-center justify-center"
        >
          <PiFloppyDiskDuotone className="h-4 w-4 mr-2" />
          {mode === 'create' ? 'Create Setting' : 'Save Changes'}
        </Button>
      </div>
    </form>
  )
}