'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { HiQrcode, HiCheck, HiX, HiExclamation } from 'react-icons/hi'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import Alert from '@/components/ui/Alert'
import { FormItem } from '@/components/ui/Form'
import CylinderQRScanner from '@/components/cylinders/CylinderQRScanner'
import { useLeases, useLease, useLeaseMutations } from '@/hooks/useLeases'
import { useSession } from 'next-auth/react'
import { toast } from 'react-hot-toast'
import { format } from 'date-fns'
import type { ReturnLeaseDto } from '@/services/api/lease.service'
import { settingsService } from '@/services/api/settings.service'

const returnSchema = z.object({
  returnDate: z.string().optional(),
  notes: z.string().optional(),
  condition: z.enum(['good', 'poor', 'damaged'])
})

type ReturnFormData = z.infer<typeof returnSchema>

interface EnhancedReturnFormProps {
  preselectedLeaseId?: number
}

export function EnhancedReturnForm({ preselectedLeaseId }: EnhancedReturnFormProps) {
  const router = useRouter()
  const { data: _session } = useSession()
  const [scanDialogOpen, setScanDialogOpen] = useState(false)
  const [selectedLeaseId, setSelectedLeaseId] = useState<number | undefined>(preselectedLeaseId)
  const [searchTerm, setSearchTerm] = useState('')
  const [penaltySettings, setPenaltySettings] = useState({
    good: 0,
    poor: 10,
    damaged: 25
  })
  const [loadingSettings, setLoadingSettings] = useState(true)
  
  // API hooks - use leaseStatus instead of status to match backend
  const { data: leasesData, isLoading: loadingLeases } = useLeases({
    leaseStatus: 'active' as any, // Backend expects leaseStatus, not status
    search: searchTerm,
    limit: 10
  })
  
  const { data: selectedLease } = useLease(selectedLeaseId)
  const { returnLease } = useLeaseMutations()
  
  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    watch,
    reset: _reset
  } = useForm<ReturnFormData>({
    resolver: zodResolver(returnSchema),
    defaultValues: {
      returnDate: format(new Date(), 'yyyy-MM-dd'),
      notes: '',
      condition: 'good'
    }
  })
  
  const watchedValues = watch()
  
  // Fetch penalty settings on mount
  useEffect(() => {
    const fetchPenaltySettings = async () => {
      try {
        setLoadingSettings(true)
        const response = await settingsService.getAllSettings()
        
        if (response?.data?.settings) {
          const settings = response.data.settings
          
          // Extract penalty percentages from settings
          const goodPenalty = settings.find((s: any) => 
            s.settingKey === 'return.penalty.good' || s.key === 'return.penalty.good'
          )
          const poorPenalty = settings.find((s: any) => 
            s.settingKey === 'return.penalty.poor' || s.key === 'return.penalty.poor'
          )
          const damagedPenalty = settings.find((s: any) => 
            s.settingKey === 'return.penalty.damaged' || s.key === 'return.penalty.damaged'
          )
          
          setPenaltySettings({
            good: parseFloat(goodPenalty?.settingValue || goodPenalty?.value || '0') || 0,
            poor: parseFloat(poorPenalty?.settingValue || poorPenalty?.value || '10') || 10,
            damaged: parseFloat(damagedPenalty?.settingValue || damagedPenalty?.value || '25') || 25
          })
        }
      } catch (error) {
        console.error('Failed to fetch penalty settings:', error)
        // Use default values on error
      } finally {
        setLoadingSettings(false)
      }
    }
    
    fetchPenaltySettings()
  }, [])
  
  const handleCylinderScanned = (cylinder: any) => {
    if (leasesData?.data) {
      const lease = leasesData.data.find(l => l.cylinderId === cylinder.id)
      if (lease) {
        setSelectedLeaseId(lease.id)
        toast.success('Active lease found for this cylinder')
      } else {
        toast.error('No active lease found for this cylinder')
      }
    }
  }
  
  const onSubmit = async (data: ReturnFormData) => {
    if (!selectedLeaseId) {
      toast.error('Please select a lease to return')
      return
    }
    
    try {
      const returnData: ReturnLeaseDto = {
        returnDate: data.returnDate,
        notes: data.notes,
        condition: data.condition === 'poor' ? 'needs_maintenance' : data.condition as 'good' | 'damaged'
      }
      
      await returnLease.trigger({
        id: selectedLeaseId,
        data: returnData
      })
      router.push('/admin/leases')
    } catch (error: any) {
      toast.error(error.message || 'Failed to process return')
    }
  }
  
  const handleScanQR = () => {
    setScanDialogOpen(true)
  }
  
  // Lease options for select - use direct customer fields
  const leaseOptions = leasesData?.data?.map(lease => ({
    value: lease.id,
    label: `${lease.cylinder?.cylinderCode || 'Unknown'} - ${lease.customer?.firstName || ''} ${lease.customer?.lastName || ''}`,
    lease
  })) || []
  
  // Calculate refund details
  const calculateRefund = () => {
    if (!selectedLease) return { deposit: 0, deductions: 0, refund: 0, penaltyPercent: 0 }
    
    // Parse string amount to number
    const deposit = parseFloat(selectedLease.depositAmount) || 0
    let deductions = 0
    let penaltyPercent = 0
    
    // Apply deductions based on condition using actual settings
    if (watchedValues.condition === 'good') {
      penaltyPercent = penaltySettings.good
    } else if (watchedValues.condition === 'poor') {
      penaltyPercent = penaltySettings.poor
    } else if (watchedValues.condition === 'damaged') {
      penaltyPercent = penaltySettings.damaged
    }
    
    deductions = (deposit * penaltyPercent) / 100
    
    return {
      deposit,
      deductions,
      refund: Math.max(0, deposit - deductions),
      penaltyPercent
    }
  }
  
  const refundDetails = calculateRefund()
  
  return (
    <div className="grid gap-6">
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Lease Selection */}
        <Card>
          <h4 className="mb-4">Select Lease to Return</h4>
          
          <div className="space-y-4">
            <div className="flex gap-2">
              <Select
                className="flex-1"
                options={leaseOptions}
                placeholder="Search by cylinder code or customer..."
                isLoading={loadingLeases}
                value={leaseOptions.find(opt => opt.value === selectedLeaseId) || null}
                onChange={(option) => setSelectedLeaseId(option?.value)}
                onInputChange={setSearchTerm}
              />
              <Button
                type="button"
                variant="solid"
                icon={<HiQrcode />}
                onClick={handleScanQR}
              >
                Scan Cylinder
              </Button>
            </div>
            
            {selectedLease && (
              <Alert showIcon>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-semibold">Customer Information</p>
                    <p className="text-sm">
                      {selectedLease.customer?.firstName} {selectedLease.customer?.lastName}
                    </p>
                    <p className="text-sm">{selectedLease.customer?.email}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Cylinder Information</p>
                    <p className="text-sm">Code: {selectedLease.cylinder?.cylinderCode}</p>
                    <p className="text-sm">Type: {selectedLease.cylinder?.type}</p>
                    <p className="text-sm">
                      Leased on: {format(new Date(selectedLease.leaseDate), 'PPP')}
                    </p>
                  </div>
                </div>
              </Alert>
            )}
          </div>
        </Card>
        
        {/* Return Assessment */}
        {selectedLease && (
          <>
            <Card className="mt-6">
              <h4 className="mb-4">Return Assessment</h4>
              
              {loadingSettings && (
                <Alert type="info" className="mb-4">
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2" />
                    Loading penalty settings...
                  </div>
                </Alert>
              )}
              
              <div className="space-y-4">
                <FormItem
                  label="Return Date"
                  invalid={Boolean(errors.returnDate)}
                  errorMessage={errors.returnDate?.message}
                >
                  <Controller
                    name="returnDate"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="date"
                        max={format(new Date(), 'yyyy-MM-dd')}
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
                    render={({ field }) => {
                      const deposit = parseFloat(selectedLease?.depositAmount || '0')
                      return (
                        <div className="grid grid-cols-3 gap-3">
                          <button
                            type="button"
                            onClick={() => field.onChange('good')}
                            className={`
                              p-4 rounded-lg border-2 text-center transition-all relative
                              ${field.value === 'good'
                                ? 'border-green-500 bg-green-50 text-green-700'
                                : 'border-gray-300 hover:border-gray-400'
                              }
                            `}
                            disabled={loadingSettings}
                          >
                            <HiCheck className="h-6 w-6 mx-auto mb-2" />
                            <div className="font-medium">Good</div>
                            <div className="text-xs mt-1">
                              {loadingSettings ? (
                                <span className="animate-pulse">Loading...</span>
                              ) : penaltySettings.good === 0 ? (
                                'No penalty'
                              ) : (
                                `${penaltySettings.good}% penalty`
                              )}
                            </div>
                            {!loadingSettings && deposit > 0 && penaltySettings.good > 0 && (
                              <div className="text-xs font-semibold mt-1">
                                -₦{((deposit * penaltySettings.good) / 100).toLocaleString()}
                              </div>
                            )}
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => field.onChange('poor')}
                            className={`
                              p-4 rounded-lg border-2 text-center transition-all relative
                              ${field.value === 'poor'
                                ? 'border-amber-500 bg-amber-50 text-amber-700'
                                : 'border-gray-300 hover:border-gray-400'
                              }
                            `}
                            disabled={loadingSettings}
                          >
                            <HiExclamation className="h-6 w-6 mx-auto mb-2" />
                            <div className="font-medium">Poor</div>
                            <div className="text-xs mt-1">
                              {loadingSettings ? (
                                <span className="animate-pulse">Loading...</span>
                              ) : (
                                `${penaltySettings.poor}% penalty`
                              )}
                            </div>
                            {!loadingSettings && deposit > 0 && (
                              <div className="text-xs font-semibold mt-1">
                                -₦{((deposit * penaltySettings.poor) / 100).toLocaleString()}
                              </div>
                            )}
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => field.onChange('damaged')}
                            className={`
                              p-4 rounded-lg border-2 text-center transition-all relative
                              ${field.value === 'damaged'
                                ? 'border-red-500 bg-red-50 text-red-700'
                                : 'border-gray-300 hover:border-gray-400'
                              }
                            `}
                            disabled={loadingSettings}
                          >
                            <HiX className="h-6 w-6 mx-auto mb-2" />
                            <div className="font-medium">Damaged</div>
                            <div className="text-xs mt-1">
                              {loadingSettings ? (
                                <span className="animate-pulse">Loading...</span>
                              ) : (
                                `${penaltySettings.damaged}% penalty`
                              )}
                            </div>
                            {!loadingSettings && deposit > 0 && (
                              <div className="text-xs font-semibold mt-1">
                                -₦{((deposit * penaltySettings.damaged) / 100).toLocaleString()}
                              </div>
                            )}
                          </button>
                        </div>
                      )
                    }}
                  />
                </FormItem>
                
                <FormItem
                  label="Return Notes"
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
                        placeholder="Optional notes about the return condition..."
                      />
                    )}
                  />
                </FormItem>
              </div>
            </Card>
            
            {/* Refund Summary */}
            <Card className="mt-6 bg-gray-50">
              <h4 className="mb-4">Refund Summary</h4>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Original Deposit</span>
                  <span className="font-medium">₦{refundDetails.deposit.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Selected Condition</span>
                  <span className="font-medium capitalize">
                    {watchedValues.condition || 'None'}
                  </span>
                </div>
                
                {refundDetails.penaltyPercent > 0 && (
                  <div className="flex justify-between text-orange-600">
                    <span>Penalty ({refundDetails.penaltyPercent}%)</span>
                    <span className="font-medium">-₦{refundDetails.deductions.toLocaleString()}</span>
                  </div>
                )}
                
                {refundDetails.penaltyPercent === 0 && watchedValues.condition === 'good' && (
                  <div className="flex justify-between text-green-600">
                    <span>Penalty</span>
                    <span className="font-medium">No penalty</span>
                  </div>
                )}
                
                <div className="pt-3 mt-3 border-t border-gray-300">
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold">Total Refund</span>
                    <span className="font-bold text-green-600">
                      ₦{refundDetails.refund.toLocaleString()}
                    </span>
                  </div>
                </div>
                
                <Alert showIcon type="info" className="mt-4">
                  <p className="text-sm">
                    The refund amount is calculated based on the cylinder condition. 
                    {refundDetails.penaltyPercent > 0 
                      ? `A ${refundDetails.penaltyPercent}% penalty applies for ${watchedValues.condition} condition.`
                      : 'No penalty applies for good condition cylinders.'}
                  </p>
                </Alert>
              </div>
            </Card>
          </>
        )}
        
        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <Button
            type="button"
            variant="plain"
            onClick={() => router.push('/admin/leases')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="solid"
            loading={isSubmitting}
            disabled={!selectedLease || isSubmitting}
            icon={<HiCheck />}
          >
            Process Return
          </Button>
        </div>
      </form>
      
      {/* QR Scanner */}
      <CylinderQRScanner
        isOpen={scanDialogOpen}
        onClose={() => setScanDialogOpen(false)}
        onCylinderScanned={handleCylinderScanned}
        title="Scan Cylinder QR Code"
        description="Scan the cylinder's QR code to automatically find the active lease"
      />
    </div>
  )
}