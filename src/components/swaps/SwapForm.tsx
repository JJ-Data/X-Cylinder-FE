'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PiQrCodeDuotone, PiArrowsCounterClockwiseDuotone, PiCheckCircleDuotone, PiXCircleDuotone, PiWarningCircleDuotone } from 'react-icons/pi'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import Alert from '@/components/ui/Alert'
import { FormItem } from '@/components/ui/Form'
import CylinderQRScanner from '@/components/cylinders/CylinderQRScanner'
import { useSwapManagement, useFindCylinder, useAvailableCylinders } from '@/hooks/useSwap'
import { useSession } from 'next-auth/react'
import { useAuthStore } from '@/stores'
import { toast } from 'sonner'
import { format } from 'date-fns'
import type { CreateSwapDto } from '@/types/swap'

const swapSchema = z.object({
  leaseId: z.number().optional(),
  cylinderCode: z.string().optional(),
  qrCode: z.string().optional(),
  newCylinderId: z.number().min(1, 'Please select a replacement cylinder'),
  condition: z.enum(['good', 'poor', 'damaged']),
  weightRecorded: z.number().min(0, 'Weight must be a positive number').optional(),
  damageNotes: z.string().optional(),
  swapFee: z.number().min(0, 'Fee must be positive').optional(),
  reasonForFee: z.string().optional(),
  notes: z.string().optional()
})

type SwapFormData = z.infer<typeof swapSchema>

interface SwapFormProps {
  preselectedLeaseId?: number
  preselectedCylinderCode?: string
}

export function SwapForm({ preselectedLeaseId, preselectedCylinderCode }: SwapFormProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const { activeRole } = useAuthStore()
  const [scanDialogOpen, setScanDialogOpen] = useState(false)
  const [foundLease, setFoundLease] = useState<any>(null)
  const [searchInput, setSearchInput] = useState('')
  
  // API hooks
  const { findCylinder, isSearching: isSearchingCylinder } = useFindCylinder()
  const { createSwap, isCreatingSwap } = useSwapManagement()
  const { data: availableCylinders, isLoading: loadingAvailableCylinders } = useAvailableCylinders(
    foundLease?.cylinder?.type
  )
  
  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    reset
  } = useForm<SwapFormData>({
    resolver: zodResolver(swapSchema),
    defaultValues: {
      condition: 'good',
      weightRecorded: 0,
      swapFee: 0,
      notes: ''
    }
  })
  
  const watchedValues = watch()
  
  // Initialize with preselected values
  useEffect(() => {
    if (preselectedLeaseId) {
      setValue('leaseId', preselectedLeaseId)
      handleFindCylinder({ leaseId: preselectedLeaseId })
    } else if (preselectedCylinderCode) {
      setValue('cylinderCode', preselectedCylinderCode)
      setSearchInput(preselectedCylinderCode)
      handleFindCylinder({ cylinderCode: preselectedCylinderCode })
    }
  }, [preselectedLeaseId, preselectedCylinderCode, setValue]) // eslint-disable-line react-hooks/exhaustive-deps
  
  const handleFindCylinder = async (identifier: {
    leaseId?: number
    cylinderCode?: string
    qrCode?: string
  }) => {
    try {
      const result = await findCylinder(identifier)
      setFoundLease(result)
      toast.success('Active lease found for cylinder')
    } catch (error: any) {
      toast.error(error.message || 'Cylinder not found or not currently leased')
      setFoundLease(null)
    }
  }
  
  const handleCylinderScanned = (cylinder: any) => {
    setValue('qrCode', cylinder.cylinderCode)
    setSearchInput(cylinder.cylinderCode)
    handleFindCylinder({ cylinderCode: cylinder.cylinderCode })
  }
  
  const handleManualSearch = () => {
    if (!searchInput.trim()) {
      toast.error('Please enter a cylinder code, lease ID, or QR code')
      return
    }
    
    // Try to determine if it's a lease ID (numeric) or cylinder code
    const numericValue = parseInt(searchInput)
    if (!isNaN(numericValue) && numericValue > 0) {
      setValue('leaseId', numericValue)
      handleFindCylinder({ leaseId: numericValue })
    } else {
      setValue('cylinderCode', searchInput)
      handleFindCylinder({ cylinderCode: searchInput })
    }
  }
  
  const handleScanQR = () => {
    setScanDialogOpen(true)
  }
  
  // Calculate swap fee based on condition
  const calculateSwapFee = () => {
    if (!foundLease) return 0
    
    const baseFee = 0
    let conditionFee = 0
    
    if (watchedValues.condition === 'poor') {
      conditionFee = 500 // ₦500 for poor condition
    } else if (watchedValues.condition === 'damaged') {
      conditionFee = 1500 // ₦1500 for damaged condition
    }
    
    return baseFee + conditionFee
  }
  
  const swapFee = calculateSwapFee()
  
  // Update swap fee when condition changes
  useEffect(() => {
    setValue('swapFee', swapFee)
    if (swapFee > 0) {
      setValue('reasonForFee', `Condition-based fee for ${watchedValues.condition} cylinder`)
    } else {
      setValue('reasonForFee', undefined)
    }
  }, [swapFee, watchedValues.condition, setValue])
  
  const availableCylinderOptions = availableCylinders?.map((cylinder: any) => ({
    value: cylinder.id,
    label: `${cylinder.cylinderCode} - ${cylinder.type} (${cylinder.currentGasVolume}/${cylinder.maxGasVolume} kg)`,
    cylinder
  })) || []
  
  const onSubmit = async (data: SwapFormData) => {
    if (!foundLease) {
      toast.error('Please find a cylinder to swap first')
      return
    }
    
    try {
      const swapData: CreateSwapDto = {
        leaseId: foundLease.lease.id,
        newCylinderId: data.newCylinderId,
        condition: data.condition,
        weightRecorded: data.weightRecorded,
        damageNotes: data.damageNotes,
        swapFee: data.swapFee,
        reasonForFee: data.reasonForFee,
        notes: data.notes
      }
      
      await createSwap(swapData)
      toast.success('Cylinder swap completed successfully')
      
      // Navigate based on user role
      const basePath = activeRole === 'ADMIN' ? '/admin' 
                     : activeRole === 'STAFF' ? '/staff'
                     : '/operator'
      router.push(`${basePath}/swaps`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to process cylinder swap')
    }
  }
  
  return (
    <div className="grid gap-6">
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Cylinder Search */}
        <Card>
          <h4 className="mb-4">Find Cylinder to Swap</h4>
          
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                className="flex-1"
                placeholder="Enter cylinder code, lease ID, or QR code..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && e.preventDefault()}
              />
              <Button
                type="button"
                variant="solid"
                icon={<PiArrowsCounterClockwiseDuotone />}
                onClick={handleManualSearch}
                loading={isSearchingCylinder}
                disabled={!searchInput.trim()}
              >
                Search
              </Button>
              <Button
                type="button"
                variant="solid"
                icon={<PiQrCodeDuotone />}
                onClick={handleScanQR}
              >
                Scan QR
              </Button>
            </div>
            
            {foundLease && (
              <Alert showIcon type="success">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-semibold">Customer Information</p>
                    <p className="text-sm">
                      {foundLease.lease.customer.firstName} {foundLease.lease.customer.lastName}
                    </p>
                    <p className="text-sm">{foundLease.lease.customer.email}</p>
                    <p className="text-sm">Outlet: {foundLease.lease.outlet.name}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Current Cylinder</p>
                    <p className="text-sm">Code: {foundLease.cylinder.cylinderCode}</p>
                    <p className="text-sm">Type: {foundLease.cylinder.type}</p>
                    <p className="text-sm">Status: {foundLease.cylinder.status}</p>
                    <p className="text-sm">Gas Volume: {foundLease.cylinder.currentGasVolume} kg</p>
                  </div>
                </div>
              </Alert>
            )}
          </div>
        </Card>
        
        {/* Swap Assessment */}
        {foundLease && (
          <>
            <Card className="mt-6">
              <h4 className="mb-4">Cylinder Assessment</h4>
              
              <div className="space-y-4">
                <FormItem
                  label="Current Weight (kg)"
                  invalid={Boolean(errors.weightRecorded)}
                  errorMessage={errors.weightRecorded?.message}
                >
                  <Controller
                    name="weightRecorded"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="number"
                        step="0.1"
                        min="0"
                        placeholder="Enter current weight in kg"
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    )}
                  />
                </FormItem>
                
                <FormItem
                  label="Cylinder Condition"
                  invalid={Boolean(errors.condition)}
                  errorMessage={errors.condition?.message}
                  asterisk
                >
                  <Controller
                    name="condition"
                    control={control}
                    render={({ field }) => (
                      <div className="grid grid-cols-3 gap-3">
                        <button
                          type="button"
                          onClick={() => field.onChange('good')}
                          className={`
                            p-4 rounded-lg border-2 text-center transition-all
                            ${field.value === 'good'
                              ? 'border-green-500 bg-green-50 text-green-700'
                              : 'border-gray-300 hover:border-gray-400'
                            }
                          `}
                        >
                          <PiCheckCircleDuotone className="text-2xl mx-auto mb-2" />
                          <div className="font-medium">Good</div>
                          <div className="text-xs mt-1">No extra fee</div>
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => field.onChange('poor')}
                          className={`
                            p-4 rounded-lg border-2 text-center transition-all
                            ${field.value === 'poor'
                              ? 'border-amber-500 bg-amber-50 text-amber-700'
                              : 'border-gray-300 hover:border-gray-400'
                            }
                          `}
                        >
                          <PiWarningCircleDuotone className="text-2xl mx-auto mb-2" />
                          <div className="font-medium">Poor</div>
                          <div className="text-xs mt-1">₦500 fee</div>
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => field.onChange('damaged')}
                          className={`
                            p-4 rounded-lg border-2 text-center transition-all
                            ${field.value === 'damaged'
                              ? 'border-red-500 bg-red-50 text-red-700'
                              : 'border-gray-300 hover:border-gray-400'
                            }
                          `}
                        >
                          <PiXCircleDuotone className="text-2xl mx-auto mb-2" />
                          <div className="font-medium">Damaged</div>
                          <div className="text-xs mt-1">₦1,500 fee</div>
                        </button>
                      </div>
                    )}
                  />
                </FormItem>
                
                {(watchedValues.condition === 'poor' || watchedValues.condition === 'damaged') && (
                  <FormItem
                    label="Damage Notes"
                    invalid={Boolean(errors.damageNotes)}
                    errorMessage={errors.damageNotes?.message}
                  >
                    <Controller
                      name="damageNotes"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          textArea
                          rows={3}
                          placeholder="Describe the damage or issues..."
                        />
                      )}
                    />
                  </FormItem>
                )}
              </div>
            </Card>
            
            {/* Replacement Cylinder Selection */}
            <Card className="mt-6">
              <h4 className="mb-4">Select Replacement Cylinder</h4>
              
              <div className="space-y-4">
                <FormItem
                  label="Available Cylinders"
                  invalid={Boolean(errors.newCylinderId)}
                  errorMessage={errors.newCylinderId?.message}
                  asterisk
                >
                  <Controller
                    name="newCylinderId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        options={availableCylinderOptions}
                        placeholder={
                          loadingAvailableCylinders 
                            ? "Loading available cylinders..." 
                            : availableCylinderOptions.length === 0
                            ? "No available cylinders of this type"
                            : "Select a replacement cylinder..."
                        }
                        isLoading={loadingAvailableCylinders}
                        value={availableCylinderOptions.find((opt: any) => opt.value === field.value) || null}
                        onChange={(option) => field.onChange(option?.value)}
                        isDisabled={availableCylinderOptions.length === 0}
                      />
                    )}
                  />
                </FormItem>
                
                {availableCylinderOptions.length === 0 && !loadingAvailableCylinders && (
                  <Alert showIcon type="warning">
                    <p className="text-sm">
                      No available cylinders of type "{foundLease.cylinder.type}" found. 
                      Please check cylinder inventory or refill existing cylinders.
                    </p>
                  </Alert>
                )}
              </div>
            </Card>
            
            {/* Swap Summary */}
            <Card className="mt-6 bg-gray-50">
              <h4 className="mb-4">Swap Summary</h4>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Swap Date</span>
                  <span className="font-medium">{format(new Date(), 'PPP')}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Condition Assessment</span>
                  <span className="font-medium capitalize">{watchedValues.condition}</span>
                </div>
                
                {swapFee > 0 && (
                  <div className="flex justify-between text-amber-600">
                    <span>Condition Fee</span>
                    <span className="font-medium">₦{swapFee.toLocaleString()}</span>
                  </div>
                )}
                
                <div className="pt-3 mt-3 border-t border-gray-300">
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold">Total Fee</span>
                    <span className="font-bold text-blue-600">
                      ₦{swapFee.toLocaleString()}
                    </span>
                  </div>
                </div>
                
                <Alert showIcon type="info" className="mt-4">
                  <p className="text-sm">
                    Processing swap will replace the current cylinder with a new one 
                    and update the lease record.
                  </p>
                </Alert>
              </div>
            </Card>
            
            {/* Additional Notes */}
            <Card className="mt-6">
              <h4 className="mb-4">Additional Information</h4>
              
              <FormItem
                label="Swap Notes"
                invalid={Boolean(errors.notes)}
                errorMessage={errors.notes?.message}
              >
                <Controller
                  name="notes"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      textArea
                      rows={3}
                      placeholder="Optional notes about the swap process..."
                    />
                  )}
                />
              </FormItem>
            </Card>
          </>
        )}
        
        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <Button
            type="button"
            variant="plain"
            onClick={() => {
              const basePath = activeRole === 'ADMIN' ? '/admin' 
                             : activeRole === 'STAFF' ? '/staff'
                             : '/operator'
              router.push(`${basePath}/swaps`)
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="solid"
            loading={isSubmitting || isCreatingSwap}
            disabled={!foundLease || !watchedValues.newCylinderId || isSubmitting || isCreatingSwap}
            icon={<PiArrowsCounterClockwiseDuotone />}
          >
            Process Swap
          </Button>
        </div>
      </form>
      
      {/* QR Scanner */}
      <CylinderQRScanner
        isOpen={scanDialogOpen}
        onClose={() => setScanDialogOpen(false)}
        onCylinderScanned={handleCylinderScanned}
        title="Scan Cylinder QR Code"
        description="Scan the cylinder's QR code to find the active lease"
      />
    </div>
  )
}