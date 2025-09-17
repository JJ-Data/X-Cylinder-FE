'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  PiGearDuotone,
  PiCurrencyNgnDuotone,
  PiGasPumpDuotone,
  PiArrowsLeftRightDuotone,
  PiArrowBendUpLeftDuotone,
  PiCalculatorDuotone,
  PiFloppyDiskDuotone,
  PiWarningDuotone,
  PiCheckCircleDuotone,
} from 'react-icons/pi'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Tabs from '@/components/ui/Tabs'
import Badge from '@/components/ui/Badge'
import Alert from '@/components/ui/Alert'
import Container from '@/components/shared/Container'
import { settingsService } from '@/services/api/settings.service'
import { useSession } from 'next-auth/react'
import { toast } from 'react-hot-toast'
import { formatCurrency } from '@/utils/format'

// Simplified setting structure
interface SimpleSetting {
  id?: number
  key: string
  value: number | string
  label: string
  description?: string
  unit?: string
  min?: number
  max?: number
  options?: { value: string; label: string }[]
  categoryId?: number
}

// Setting categories
const settingCategories = {
  lease: {
    label: 'Lease',
    icon: PiCurrencyNgnDuotone,
    categoryId: 2,
    settings: [
      { key: 'lease.fee_per_kg', label: 'Lease Fee per KG', unit: '₦ per kg', min: 0, categoryId: 2 },
      { key: 'lease.deposit_per_kg', label: 'Deposit per KG', unit: '₦ per kg', min: 0, categoryId: 2 },
    ]
  },
  returns: {
    label: 'Return Penalties',
    icon: PiArrowBendUpLeftDuotone,
    categoryId: 2,
    settings: [
      { key: 'return.penalty.good', label: 'Good Condition', unit: '% of deposit', min: 0, max: 100, categoryId: 2 },
      { key: 'return.penalty.poor', label: 'Poor Condition', unit: '% of deposit', min: 0, max: 100, categoryId: 2 },
      { key: 'return.penalty.damaged', label: 'Damaged Condition', unit: '% of deposit', min: 0, max: 100, categoryId: 2 },
    ]
  },
  refill: {
    label: 'Refill',
    icon: PiGasPumpDuotone,
    categoryId: 3,
    settings: [
      { key: 'refill.price_per_kg', label: 'Price per KG', unit: 'per kg', min: 0, categoryId: 3 },
      { key: 'refill.minimum_charge', label: 'Minimum Charge', unit: 'minimum', min: 0, categoryId: 3 },
    ]
  },
  swap: {
    label: 'Swap',
    icon: PiArrowsLeftRightDuotone,
    categoryId: 4,
    settings: [
      { key: 'swap.fee.good', label: 'Good Condition', unit: '% fee', min: 0, max: 100, categoryId: 4 },
      { key: 'swap.fee.poor', label: 'Poor Condition', unit: '% fee', min: 0, max: 100, categoryId: 4 },
      { key: 'swap.fee.damaged', label: 'Damaged Condition', unit: '% fee', min: 0, max: 100, categoryId: 4 },
    ]
  },
  general: {
    label: 'General',
    icon: PiCalculatorDuotone,
    categoryId: 10,
    settings: [
      { key: 'tax.rate', label: 'Tax Rate', unit: '%', min: 0, max: 100, categoryId: 10 },
      { key: 'tax.type', label: 'Tax Type', unit: '', categoryId: 10, options: [
        { value: 'exclusive', label: 'Exclusive (added on top)' },
        { value: 'inclusive', label: 'Inclusive (included in price)' }
      ]},
      { key: 'late.fee.daily', label: 'Daily Late Fee', unit: 'per day', min: 0, categoryId: 10 },
    ]
  }
}

export default function SimplifiedSettingsPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState('lease')
  const [settings, setSettings] = useState<Record<string, SimpleSetting>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Check if user is admin
  useEffect(() => {
    if (session && session.user?.role !== 'ADMIN') {
      router.push('/access-denied')
    }
  }, [session, router])

  // Load settings
  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setIsLoading(true)
    try {
      const response = await settingsService.getAllSettings()
      
      // Convert to key-value map
      const settingsMap: Record<string, SimpleSetting> = {}
      
      // Initialize with default values
      Object.values(settingCategories).forEach(category => {
        category.settings.forEach(setting => {
          // Use appropriate default value based on setting type
          const defaultValue = 'options' in setting && setting.options
            ? (setting.options[0]?.value || 'exclusive') // Default for dropdown
            : 0 // Default for numeric
            
          settingsMap[setting.key] = {
            ...setting,
            value: defaultValue,
            categoryId: setting.categoryId
          }
        })
      })
      
      // Update with actual values from API
      if (response?.data?.settings) {
        response.data.settings.forEach((setting: any) => {
          // Check both possible field names for compatibility
          const settingKey = setting.settingKey || setting.key || setting.setting_key
          const settingValue = setting.settingValue || setting.value || setting.setting_value
          const dataType = setting.dataType || setting.data_type
          
          if (settingsMap[settingKey]) {
            // Parse the value based on data type
            let parsedValue = settingValue
            try {
              // Try to parse JSON (values are stored as JSON strings)
              parsedValue = JSON.parse(settingValue)
            } catch {
              // If not JSON, use as is
              parsedValue = settingValue
            }
            
            // For numeric settings, ensure it's a number
            if (dataType === 'number' || (typeof parsedValue === 'number' && !settingsMap[settingKey].options)) {
              parsedValue = Number(parsedValue) || 0
            }
            
            settingsMap[settingKey] = {
              ...settingsMap[settingKey],
              id: setting.id,
              value: parsedValue
            }
          }
        })
      }
      
      setSettings(settingsMap)
    } catch (error) {
      console.error('Failed to load settings:', error)
      toast.error('Failed to load settings')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSettingChange = (key: string, value: string | number) => {
    const setting = settings[key]
    if (!setting) return
    
    // Determine if this is a numeric or string setting
    const foundSetting = settingCategories[activeTab as keyof typeof settingCategories]
      ?.settings.find(s => s.key === key)
    const isNumericSetting = !(foundSetting && 'options' in foundSetting && foundSetting.options)
    
    let finalValue: string | number = value
    
    if (isNumericSetting) {
      // Handle numeric settings
      const numValue = Number(value) || 0
      
      // Validate min/max for numeric settings
      if (setting.min !== undefined && numValue < setting.min) return
      if (setting.max !== undefined && numValue > setting.max) return
      
      finalValue = numValue
    }
    // For string settings (dropdowns), use value as is
    
    setSettings(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        value: finalValue
      }
    }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Prepare updates - ensure all values are properly formatted
      const updates = Object.values(settings)
        .filter(setting => setting.key && setting.value !== undefined)
        .map(setting => {
          // Don't JSON stringify - send raw values
          // Backend expects: numbers as numbers, strings as strings
          
          return {
            key: setting.key,
            value: setting.value,
            // Determine dataType based on the actual value type
            dataType: typeof setting.value === 'string' ? 'string' : 'number',
            categoryId: setting.categoryId
          }
        })
      
      await settingsService.batchUpdateSettings(updates)
      toast.success('Settings saved successfully')
      setHasChanges(false)
    } catch (error: any) {
      console.error('Failed to save settings:', error)
      const errorMessage = error?.response?.data?.error || 'Failed to save settings'
      toast.error(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    loadSettings()
    setHasChanges(false)
  }

  const currentCategory = settingCategories[activeTab as keyof typeof settingCategories]
  const Icon = currentCategory?.icon || PiGearDuotone

  return (
    <Container>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <PiGearDuotone className="h-8 w-8 mr-3 text-blue-600" />
              Pricing Settings
            </h1>
            <p className="text-gray-600 mt-2">
              Configure pricing for all operations
            </p>
          </div>
          {hasChanges && (
            <div className="flex items-center space-x-3">
              <Button
                variant="plain"
                onClick={handleReset}
                disabled={isSaving}
              >
                Reset
              </Button>
              <Button
                onClick={handleSave}
                loading={isSaving}
                className="flex items-center"
              >
                <PiFloppyDiskDuotone className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Admin Only Notice */}
      {session?.user?.role === 'ADMIN' && (
        <Alert type="info" className="mb-6">
          <div className="flex items-center">
            <PiCheckCircleDuotone className="h-5 w-5 mr-2" />
            <span>Only administrators can modify these settings</span>
          </div>
        </Alert>
      )}

      {/* Settings Tabs */}
      <Card className="p-0">
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.TabList className="border-b px-6">
            {Object.entries(settingCategories).map(([key, category]) => {
              const TabIcon = category.icon
              return (
                <Tabs.TabNav key={key} value={key}>
                  <div className="flex items-center space-x-2">
                    <TabIcon className="h-4 w-4" />
                    <span>{category.label}</span>
                  </div>
                </Tabs.TabNav>
              )
            })}
          </Tabs.TabList>
          
          <Tabs.TabContent value={activeTab}>
            <div className="p-6">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center space-x-2 text-gray-500">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
                  <span>Loading settings...</span>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center mb-4">
                  <Icon className="h-5 w-5 text-blue-600 mr-2" />
                  <h3 className="text-lg font-semibold">{currentCategory.label} Settings</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {currentCategory.settings.map(settingDef => {
                    const setting = settings[settingDef.key]
                    if (!setting) return null
                    
                    return (
                      <div key={setting.key} className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          {setting.label}
                          {setting.unit && (
                            <Badge
                              content={setting.unit}
                              innerClass="bg-gray-100 text-gray-600 text-xs ml-2"
                            />
                          )}
                        </label>
                        
                        {/* Render dropdown for settings with options */}
                        {'options' in settingDef && settingDef.options ? (
                          <div>
                            <Select
                              value={'options' in settingDef && settingDef.options ? settingDef.options.find(opt => opt.value === setting.value) || null : null}
                              options={'options' in settingDef && settingDef.options ? settingDef.options : []}
                              onChange={(option) => handleSettingChange(setting.key, option?.value || 'exclusive')}
                              placeholder="Select option"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              {'options' in settingDef && settingDef.options ? settingDef.options.find(opt => opt.value === setting.value)?.label : ''}
                            </p>
                          </div>
                        ) : (
                          /* Render input for numeric settings */
                          <>
                            <div className="flex items-center space-x-2">
                              {/* Show currency symbol only for non-percentage settings */}
                              {!setting.unit?.includes('%') && <span className="text-gray-500">₦</span>}
                              <Input
                                type="number"
                                value={setting.value}
                                onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                                min={setting.min}
                                max={setting.max}
                                step={setting.unit?.includes('%') ? 1 : 1}
                                className="flex-1"
                              />
                              {/* Show percentage symbol for percentage settings */}
                              {setting.unit?.includes('%') && <span className="text-gray-500">%</span>}
                            </div>
                            <p className="text-xs text-gray-500">
                              Current: {setting.unit?.includes('%') 
                                ? `${setting.value}%` 
                                : formatCurrency(Number(setting.value) || 0)
                              }
                            </p>
                          </>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
            </div>
          </Tabs.TabContent>
        </Tabs>
      </Card>

      {/* Quick Info */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center">
            <PiCurrencyNgnDuotone className="h-5 w-5 text-blue-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-blue-900">Lease Pricing</p>
              <p className="text-xs text-blue-700">Daily rates + deposits</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex items-center">
            <PiGasPumpDuotone className="h-5 w-5 text-green-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-green-900">Refill Pricing</p>
              <p className="text-xs text-green-700">Per KG gas pricing</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-orange-50 border-orange-200">
          <div className="flex items-center">
            <PiArrowsLeftRightDuotone className="h-5 w-5 text-orange-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-orange-900">Swap Fees</p>
              <p className="text-xs text-orange-700">Condition-based fees</p>
            </div>
          </div>
        </Card>
      </div>
    </Container>
  )
}