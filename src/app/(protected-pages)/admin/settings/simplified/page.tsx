'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  PiGearDuotone,
  PiCurrencyDollarDuotone,
  PiGasPumpDuotone,
  PiArrowsLeftRightDuotone,
  PiCalculatorDuotone,
  PiFloppyDiskDuotone,
  PiWarningDuotone,
  PiCheckCircleDuotone,
} from 'react-icons/pi'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
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
  value: number
  label: string
  description?: string
  unit?: string
  min?: number
  max?: number
}

// Setting categories
const settingCategories = {
  lease: {
    label: 'Lease',
    icon: PiCurrencyDollarDuotone,
    settings: [
      { key: 'lease.base_price.12kg', label: '12kg Daily Rate', unit: 'per day', min: 0 },
      { key: 'lease.base_price.25kg', label: '25kg Daily Rate', unit: 'per day', min: 0 },
      { key: 'lease.base_price.50kg', label: '50kg Daily Rate', unit: 'per day', min: 0 },
      { key: 'lease.deposit.12kg', label: '12kg Deposit', unit: 'deposit', min: 0 },
      { key: 'lease.deposit.25kg', label: '25kg Deposit', unit: 'deposit', min: 0 },
      { key: 'lease.deposit.50kg', label: '50kg Deposit', unit: 'deposit', min: 0 },
    ]
  },
  refill: {
    label: 'Refill',
    icon: PiGasPumpDuotone,
    settings: [
      { key: 'refill.price_per_kg', label: 'Price per KG', unit: 'per kg', min: 0 },
      { key: 'refill.minimum_charge', label: 'Minimum Charge', unit: 'minimum', min: 0 },
    ]
  },
  swap: {
    label: 'Swap',
    icon: PiArrowsLeftRightDuotone,
    settings: [
      { key: 'swap.fee.standard', label: 'Standard Swap Fee', unit: 'fee', min: 0 },
      { key: 'swap.fee.damaged', label: 'Damaged Cylinder Fee', unit: 'fee', min: 0 },
    ]
  },
  general: {
    label: 'General',
    icon: PiCalculatorDuotone,
    settings: [
      { key: 'tax.rate', label: 'Tax Rate', unit: '%', min: 0, max: 100 },
      { key: 'late.fee.daily', label: 'Daily Late Fee', unit: 'per day', min: 0 },
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
          settingsMap[setting.key] = {
            ...setting,
            value: 0
          }
        })
      })
      
      // Update with actual values from API
      if (response?.data?.settings) {
        response.data.settings.forEach((setting: any) => {
          if (settingsMap[setting.settingKey]) {
            settingsMap[setting.settingKey] = {
              ...settingsMap[setting.settingKey],
              id: setting.id,
              value: Number(setting.settingValue) || 0
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

  const handleSettingChange = (key: string, value: string) => {
    const numValue = Number(value) || 0
    const setting = settings[key]
    
    // Validate min/max
    if (setting?.min !== undefined && numValue < setting.min) return
    if (setting?.max !== undefined && numValue > setting.max) return
    
    setSettings(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        value: numValue
      }
    }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Prepare updates
      const updates = Object.values(settings).map(setting => ({
        key: setting.key,
        value: setting.value,
        dataType: 'number'
      }))
      
      await settingsService.batchUpdateSettings(updates)
      toast.success('Settings saved successfully')
      setHasChanges(false)
    } catch (error) {
      console.error('Failed to save settings:', error)
      toast.error('Failed to save settings')
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
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-500">$</span>
                          <Input
                            type="number"
                            value={setting.value}
                            onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                            min={setting.min}
                            max={setting.max}
                            step={setting.unit === '%' ? 0.1 : 1}
                            className="flex-1"
                          />
                        </div>
                        <p className="text-xs text-gray-500">
                          Current: {formatCurrency(setting.value)}
                          {setting.unit === '%' && '%'}
                        </p>
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
            <PiCurrencyDollarDuotone className="h-5 w-5 text-blue-600 mr-2" />
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