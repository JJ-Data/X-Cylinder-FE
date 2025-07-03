'use client'

import { useState } from 'react'
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

const returnSchema = z.object({
  returnDate: z.string().optional(),
  notes: z.string().optional(),
  condition: z.enum(['good', 'damaged', 'needs_maintenance'])
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
        condition: data.condition
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
    if (!selectedLease) return { deposit: 0, deductions: 0, refund: 0 }
    
    // Parse string amount to number
    const deposit = parseFloat(selectedLease.depositAmount) || 0
    let deductions = 0
    
    // Apply deductions based on condition
    if (watchedValues.condition === 'damaged') {
      deductions = deposit * 0.5 // 50% deduction for damage
    } else if (watchedValues.condition === 'needs_maintenance') {
      deductions = deposit * 0.2 // 20% deduction for maintenance
    }
    
    return {
      deposit,
      deductions,
      refund: Math.max(0, deposit - deductions)
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
                          <HiCheck className="h-6 w-6 mx-auto mb-2" />
                          <div className="font-medium">Good</div>
                          <div className="text-xs mt-1">No deductions</div>
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
                          <HiX className="h-6 w-6 mx-auto mb-2" />
                          <div className="font-medium">Damaged</div>
                          <div className="text-xs mt-1">50% deduction</div>
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => field.onChange('needs_maintenance')}
                          className={`
                            p-4 rounded-lg border-2 text-center transition-all
                            ${field.value === 'needs_maintenance'
                              ? 'border-amber-500 bg-amber-50 text-amber-700'
                              : 'border-gray-300 hover:border-gray-400'
                            }
                          `}
                        >
                          <HiExclamation className="h-6 w-6 mx-auto mb-2" />
                          <div className="font-medium">Needs Maintenance</div>
                          <div className="text-xs mt-1">20% deduction</div>
                        </button>
                      </div>
                    )}
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
                
                {refundDetails.deductions > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Condition Deduction</span>
                    <span className="font-medium">-₦{refundDetails.deductions.toLocaleString()}</span>
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
                    Processing return will mark the cylinder as available and update the customer&apos;s lease history.
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