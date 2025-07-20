'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  PiCalculatorDuotone,
  PiCurrencyDollarDuotone,
  PiTrendUpDuotone,
  PiTrendDownDuotone,
  PiInfoDuotone,
  PiTagDuotone,
  PiCylinderDuotone,
  PiUsersDuotone,
  PiBuildingOfficeDuotone,
  PiCalendarDuotone,
  PiNumberSquareThreeDuotone,
  PiClockDuotone,
  PiCheckCircleDuotone,
  PiXCircleDuotone,
  PiSpinnerDuotone,
} from 'react-icons/pi'
import { usePricingCalculator } from '@/hooks/useSettings'
import { useOutlets } from '@/hooks/useOutlets'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Badge from '@/components/ui/Badge'
import { formatCurrency } from '@/utils/formatCurrency'
import type { PricingContext, PricingResult, OperationType, CustomerTier } from '@/types/settings'

interface PricingCalculatorProps {
  className?: string
  onCalculationComplete?: (result: PricingResult) => void
}

const operationTypes: { value: OperationType; label: string; icon: React.ComponentType<any> }[] = [
  { value: 'LEASE', label: 'Cylinder Lease', icon: PiCalendarDuotone },
  { value: 'REFILL', label: 'Gas Refill', icon: PiCylinderDuotone },
  { value: 'SWAP', label: 'Cylinder Swap', icon: PiTagDuotone },
  { value: 'REGISTRATION', label: 'Customer Registration', icon: PiUsersDuotone },
  { value: 'PENALTY', label: 'Late Penalty', icon: PiXCircleDuotone },
  { value: 'DEPOSIT', label: 'Security Deposit', icon: PiCheckCircleDuotone },
]

const customerTiers: { value: CustomerTier; label: string; description: string }[] = [
  { value: 'REGULAR', label: 'Regular', description: 'Standard customers' },
  { value: 'BUSINESS', label: 'Business', description: 'Business customers (10% discount)' },
  { value: 'PREMIUM', label: 'Premium', description: 'Premium customers (15% discount)' },
]

const cylinderTypes = [
  { value: '5kg', label: '5kg Cylinder' },
  { value: '10kg', label: '10kg Cylinder' },
  { value: '15kg', label: '15kg Cylinder' },
  { value: '20kg', label: '20kg Cylinder' },
  { value: '50kg', label: '50kg Cylinder' },
]

const swapConditions = [
  { value: 'good', label: 'Good Condition' },
  { value: 'fair', label: 'Fair Condition' },
  { value: 'poor', label: 'Poor Condition' },
  { value: 'damaged', label: 'Damaged' },
]

export default function PricingCalculator({ className, onCalculationComplete }: PricingCalculatorProps) {
  const [context, setContext] = useState<PricingContext>({
    operationType: 'LEASE',
    cylinderType: '5kg',
    quantity: 1,
    customerTier: 'REGULAR',
    duration: 30, // days for lease
  })
  
  const [result, setResult] = useState<PricingResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const { calculatePrice, isCalculating } = usePricingCalculator()
  const { data: outletsResponse } = useOutlets()
  const outlets = outletsResponse?.outlets || []
  
  const handleCalculate = useCallback(async () => {
    try {
      setError(null)
      const pricingResult = await calculatePrice(context)
      setResult(pricingResult)
      onCalculationComplete?.(pricingResult)
    } catch (error: any) {
      setError(error.message || 'Calculation failed')
      setResult(null)
    }
  }, [context, calculatePrice, onCalculationComplete])
  
  // Auto-calculate when context changes
  useEffect(() => {
    const timer = setTimeout(() => {
      handleCalculate()
    }, 500) // Debounce for 500ms
    
    return () => clearTimeout(timer)
  }, [context, handleCalculate])
  
  const handleContextChange = (field: keyof PricingContext, value: any) => {
    setContext(prev => ({
      ...prev,
      [field]: value,
      // Reset operation-specific fields when operation type changes
      ...(field === 'operationType' && {
        duration: value === 'LEASE' ? 30 : undefined,
        gasAmount: value === 'REFILL' ? 5 : undefined,
        condition: value === 'SWAP' ? 'good' : undefined,
      })
    }))
  }
  
  const selectedOperation = operationTypes.find(op => op.value === context.operationType)
  const OperationIcon = selectedOperation?.icon || PiCalculatorDuotone
  
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Calculator Header */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 rounded-lg bg-blue-100">
            <PiCalculatorDuotone className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Pricing Calculator</h2>
            <p className="text-gray-600">Test and calculate prices in real-time</p>
          </div>
        </div>
        
        {/* Context Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Operation Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <PiTagDuotone className="h-4 w-4 inline mr-1" />
              Operation Type
            </label>
            <Select
              value={context.operationType}
              onChange={(selectedOption: any) => handleContextChange('operationType', selectedOption?.value as OperationType)}
              options={operationTypes.map(op => ({
                value: op.value,
                label: op.label,
                icon: op.icon
              }))}
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
          
          {/* Cylinder Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <PiCylinderDuotone className="h-4 w-4 inline mr-1" />
              Cylinder Type
            </label>
            <Select
              value={context.cylinderType}
              onChange={(selectedOption: any) => handleContextChange('cylinderType', selectedOption?.value)}
              options={cylinderTypes}
            />
          </div>
          
          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <PiNumberSquareThreeDuotone className="h-4 w-4 inline mr-1" />
              Quantity
            </label>
            <Input
              type="number"
              min="1"
              value={context.quantity}
              onChange={(e) => handleContextChange('quantity', parseInt(e.target.value) || 1)}
            />
          </div>
          
          {/* Customer Tier */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <PiUsersDuotone className="h-4 w-4 inline mr-1" />
              Customer Tier
            </label>
            <Select
              value={context.customerTier || 'REGULAR'}
              onChange={(selectedOption: any) => handleContextChange('customerTier', selectedOption?.value as CustomerTier)}
              options={customerTiers}
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
          
          {/* Outlet */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <PiBuildingOfficeDuotone className="h-4 w-4 inline mr-1" />
              Outlet (Optional)
            </label>
            <Select
              value={context.outletId?.toString() || ''}
              onChange={(selectedOption: any) => handleContextChange('outletId', selectedOption?.value ? parseInt(selectedOption.value) : undefined)}
              options={[
                { value: '', label: 'All Outlets' },
                ...outlets.map(outlet => ({
                  value: outlet.id.toString(),
                  label: outlet.name
                }))
              ]}
            />
          </div>
          
          {/* Operation-specific fields */}
          {context.operationType === 'LEASE' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <PiCalendarDuotone className="h-4 w-4 inline mr-1" />
                Duration (days)
              </label>
              <Input
                type="number"
                min="1"
                value={context.duration || 30}
                onChange={(e) => handleContextChange('duration', parseInt(e.target.value) || 30)}
              />
            </div>
          )}
          
          {context.operationType === 'REFILL' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <PiNumberSquareThreeDuotone className="h-4 w-4 inline mr-1" />
                Gas Amount (kg)
              </label>
              <Input
                type="number"
                min="0"
                step="0.1"
                value={context.gasAmount || 5}
                onChange={(e) => handleContextChange('gasAmount', parseFloat(e.target.value) || 5)}
              />
            </div>
          )}
          
          {context.operationType === 'SWAP' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <PiInfoDuotone className="h-4 w-4 inline mr-1" />
                Cylinder Condition
              </label>
              <Select
                value={context.condition || 'good'}
                onChange={(selectedOption: any) => handleContextChange('condition', selectedOption?.value)}
                options={swapConditions}
              />
            </div>
          )}
        </div>
      </Card>
      
      {/* Calculation Result */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <PiCurrencyDollarDuotone className="h-5 w-5 mr-2 text-green-600" />
            Price Calculation
          </h3>
          {isCalculating && (
            <PiSpinnerDuotone className="h-5 w-5 animate-spin text-blue-600" />
          )}
        </div>
        
        {error ? (
          <div className="text-center py-8">
            <PiXCircleDuotone className="h-12 w-12 text-red-500 mx-auto mb-3" />
            <p className="text-red-600 font-medium">{error}</p>
            <Button onClick={handleCalculate} className="mt-4" size="sm">
              Try Again
            </Button>
          </div>
        ) : result ? (
          <div className="space-y-4">
            {/* Total Price */}
            <div className="text-center py-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Total Price</p>
              <p className="text-4xl font-bold text-blue-600">
                {formatCurrency(result.totalPrice)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                for {context.quantity} {context.cylinderType} cylinder(s)
              </p>
            </div>
            
            {/* Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Base Price */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Base Price</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatCurrency(result.basePrice)}
                  </span>
                </div>
              </div>
              
              {/* Subtotal */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Subtotal</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatCurrency(result.breakdown.subtotal)}
                  </span>
                </div>
              </div>
              
              {/* Discounts */}
              {result.breakdown.totalDiscounts > 0 && (
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-green-700 flex items-center">
                      <PiTrendDownDuotone className="h-4 w-4 mr-1" />
                      Total Discounts
                    </span>
                    <span className="text-sm font-semibold text-green-700">
                      -{formatCurrency(result.breakdown.totalDiscounts)}
                    </span>
                  </div>
                </div>
              )}
              
              {/* Surcharges */}
              {result.breakdown.totalSurcharges > 0 && (
                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-orange-700 flex items-center">
                      <PiTrendUpDuotone className="h-4 w-4 mr-1" />
                      Total Surcharges
                    </span>
                    <span className="text-sm font-semibold text-orange-700">
                      +{formatCurrency(result.breakdown.totalSurcharges)}
                    </span>
                  </div>
                </div>
              )}
              
              {/* Taxes */}
              {result.breakdown.totalTaxes > 0 && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-700">Total Taxes</span>
                    <span className="text-sm font-semibold text-blue-700">
                      +{formatCurrency(result.breakdown.totalTaxes)}
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Applied Discounts */}
            {result.discounts.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Applied Discounts</h4>
                <div className="space-y-2">
                  {result.discounts.map((discount, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{discount.description}</span>
                      <div className="flex items-center space-x-2">
                        {discount.percentage && (
                          <Badge content={`${discount.percentage}%`} innerClass="bg-green-100 text-green-700" />
                        )}
                        <span className="text-green-600 font-medium">
                          -{formatCurrency(discount.amount)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Applied Rules */}
            {result.appliedRules.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Applied Rules</h4>
                <div className="flex flex-wrap gap-2">
                  {result.appliedRules.map((rule, index) => (
                    <Badge
                      key={index}
                      content={rule}
                      innerClass="bg-blue-100 text-blue-700"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <PiCalculatorDuotone className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p>Adjust parameters above to calculate pricing</p>
          </div>
        )}
      </Card>
    </div>
  )
}