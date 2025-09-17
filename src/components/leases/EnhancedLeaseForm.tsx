'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {  HiQrcode, HiCheck } from 'react-icons/hi'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import Alert from '@/components/ui/Alert'
import { FormItem } from '@/components/ui/Form'
import CylinderQRScanner from '@/components/cylinders/CylinderQRScanner'
import { useCustomers } from '@/hooks/useCustomers'
import { useCylinders } from '@/hooks/useCylinders'
import { useLeaseMutations } from '@/hooks/useLeases'
import { useSession } from 'next-auth/react'
import { toast } from 'react-hot-toast'
import { handleBackendValidationErrors } from '@/utils/errorHandler'
import { leaseService } from '@/services/api/lease.service'
import type { CreateLeaseDto } from '@/services/api/lease.service'
import type { Cylinder } from '@/types/cylinder'
import { useAuthStore } from '@/stores'

const leaseSchema = z.object({
  customerId: z.number().min(1, 'Customer is required'),
  cylinderId: z.number().min(1, 'Cylinder is required'),
  depositAmount: z.number().min(0, 'Deposit must be a positive number'),
  leaseAmount: z.number().min(0, 'Lease amount must be a positive number'),
  paymentMethod: z.enum(['cash', 'pos', 'bank_transfer'], {
    required_error: 'Payment method is required',
  }),
  expectedReturnDate: z.string().optional(),
  notes: z.string().optional()
})

type LeaseFormData = z.infer<typeof leaseSchema>

interface EnhancedLeaseFormProps {
  redirectPath?: string
}

export function EnhancedLeaseForm({ redirectPath }: EnhancedLeaseFormProps = {}) {
  const router = useRouter()
  const { data: session } = useSession()
  const { activeRole, outletId } = useAuthStore()
  const [search, setSearch] = useState('')
  const [searchCylinder, setSearchCylinder] = useState('')
  const [scanDialogOpen, setScanDialogOpen] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [scannedCylinder, setScannedCylinder] = useState<Cylinder | null>(null)
  const [pricingData, setPricingData] = useState<{
    subtotal: number
    taxAmount: number
    taxRate: number
    taxType: 'inclusive' | 'exclusive'
    leaseAmount: number
    depositAmount: number
    totalAmount: number
    breakdown?: any
  } | null>(null)
  const [loadingPricing, setLoadingPricing] = useState(false)
  
  // API hooks
  const { data: customersData, isLoading: loadingCustomers } = useCustomers({
    searchTerm: search,
    limit: 10
  })
  
  const { data: cylindersData, isLoading: loadingCylinders } = useCylinders({
    code: searchCylinder,
    status: 'available', // Only show available cylinders (lowercase)
    limit: 10,
    // Only filter by outlet for staff users - admins can see all cylinders
    outletId: activeRole === 'STAFF' && outletId ? parseInt(outletId) : undefined,
  })
  
  const { createLease } = useLeaseMutations()
  
  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    setError,
    reset: _reset
  } = useForm<LeaseFormData>({
    resolver: zodResolver(leaseSchema),
    defaultValues: {
      customerId: 0,
      cylinderId: 0,
      depositAmount: 0,
      leaseAmount: 0,
      paymentMethod: 'cash' as const,
      expectedReturnDate: '', // Optional - user can set if needed
      notes: ''
    }
  })
  
  const watchedValues = watch()
  const selectedId = watchedValues.customerId
  const selectedCylinderId = watchedValues.cylinderId
  
  // Find selected customer and cylinder details
  const selected = customersData?.data?.find((c: any) => c.id === selectedId)
  // Use scanned cylinder if it matches the selected ID, otherwise find from list
  const selectedCylinder = scannedCylinder?.id === selectedCylinderId 
    ? scannedCylinder 
    : cylindersData?.data?.find((c: any) => c.id === selectedCylinderId)
  
  // Fetch pricing when cylinder is selected
  useEffect(() => {
    if (selectedCylinder?.type) {
      setLoadingPricing(true)
      leaseService.getPricingQuote(selectedCylinder.type)
        .then((pricing) => {
          setPricingData({
            subtotal: pricing.subtotal,
            taxAmount: pricing.taxAmount,
            taxRate: pricing.taxRate,
            taxType: pricing.taxType,
            leaseAmount: pricing.leaseAmount,
            depositAmount: pricing.depositAmount,
            totalAmount: pricing.totalAmount,
            breakdown: pricing.breakdown
          })
          // Update form values with calculated pricing
          setValue('leaseAmount', pricing.leaseAmount)
          setValue('depositAmount', pricing.depositAmount)
        })
        .catch((error) => {
          console.error('Failed to fetch pricing:', error)
          toast.error('Failed to fetch pricing. Please try again.')
        })
        .finally(() => {
          setLoadingPricing(false)
        })
    } else {
      // Reset pricing when no cylinder is selected
      setPricingData(null)
      setValue('leaseAmount', 0)
      setValue('depositAmount', 0)
    }
  }, [selectedCylinder, setValue])
  
  // Clear scanned cylinder if user manually selects a different one
  useEffect(() => {
    if (selectedCylinderId && scannedCylinder && selectedCylinderId !== scannedCylinder.id) {
      setScannedCylinder(null)
    }
  }, [selectedCylinderId, scannedCylinder])
  
  const onSubmit = async (data: LeaseFormData) => {
    try {
      setFormError(null) // Clear any previous errors
      const leaseData: CreateLeaseDto = {
        customerId: data.customerId,
        cylinderId: data.cylinderId,
        depositAmount: data.depositAmount,
        leaseAmount: data.leaseAmount,
        paymentMethod: data.paymentMethod,
        notes: data.notes || undefined // Convert empty string to undefined
      }
      
      const result = await createLease.trigger(leaseData)
      
      // Determine redirect path based on user role or provided path
      const userRole = session?.user?.role
      const basePath = redirectPath || (userRole === 'ADMIN' ? '/admin/leases' : '/staff/leasing')
      
      if (result?.id) {
        router.push(`${basePath}/${result.id}`)
      } else {
        router.push(basePath)
      }
    } catch (error: any) {
      const errorMessage = handleBackendValidationErrors(error, setError)
      setFormError(errorMessage)
      toast.error(errorMessage)
    }
  }
  
  const handleScanQR = () => {
    setScanDialogOpen(true)
  }
  
  const handleCylinderScanned = (cylinder: Cylinder) => {
    if (cylinder.status === 'available') {
      setValue('cylinderId', cylinder.id)
      setSearchCylinder(cylinder.cylinderCode)
      setScannedCylinder(cylinder) // Store the full cylinder object
      toast.success('Cylinder found and selected')
    } else {
      toast.error(`Cylinder is not available. Status: ${cylinder.status}`)
    }
  }
  
  // Customer options for select - only show active customers
  const customerOptions = customersData?.data
    ?.filter((customer: any) => customer.isActive) // Only show active customers
    ?.map((customer: any) => ({
      value: customer.id,
      label: `${customer.user?.firstName || customer.firstName} ${customer.user?.lastName || customer.lastName} - ${customer.user?.email || customer.email}`
    })) || []
  
  // Cylinder options for select
  const cylinderOptions = [
    // Add scanned cylinder to options if it exists and isn't already in the list
    ...(scannedCylinder && !cylindersData?.data?.find((c: any) => c.id === scannedCylinder.id)
      ? [{
          value: scannedCylinder.id,
          label: `${scannedCylinder.cylinderCode} - ${scannedCylinder.type} (${scannedCylinder.currentOutlet?.name || 'Unknown outlet'})`
        }]
      : []),
    // Add cylinders from the fetched list
    ...(cylindersData?.data?.map((cylinder: any) => ({
      value: cylinder.id,
      label: `${cylinder.cylinderCode} - ${cylinder.type} (${cylinder.currentOutlet?.name || 'Unknown outlet'})`
    })) || [])
  ]
  
  return (
    <div className="grid gap-6">
      {/* Display form-level errors */}
      {formError && (
        <Alert type="danger" className="mb-4">
          {formError}
        </Alert>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Customer Selection */}
          <Card>
            <h4 className="mb-4">Customer Information</h4>
            
            <FormItem
              label="Select Customer"
              invalid={Boolean(errors.customerId)}
              errorMessage={errors.customerId?.message}
              asterisk
            >
              <Controller
                name="customerId"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={customerOptions}
                    placeholder="Search by name or phone..."
                    isLoading={loadingCustomers}
                    value={customerOptions.find((opt: any) => opt.value === field.value) || null}
                    onChange={(option) => field.onChange(option?.value || 0)}
                    onInputChange={setSearch}
                  />
                )}
              />
            </FormItem>
            
            {selected && (
              <Alert showIcon className="mt-4">
                <div className="space-y-1">
                  <p className="font-semibold">
                    {selected.user?.firstName} {selected.user?.lastName}
                  </p>
                  <p className="text-sm">Email: {selected.user?.email}</p>
                  <p className="text-sm">Status: {selected.status || 'active'}</p>
                  <p className="text-sm">
                    Active Leases: {selected.activeLeases || 0}
                  </p>
                </div>
              </Alert>
            )}
          </Card>
          
          {/* Cylinder Selection */}
          <Card>
            <h4 className="mb-4">Cylinder Selection</h4>
            
            <FormItem
              label="Select Cylinder"
              invalid={Boolean(errors.cylinderId)}
              errorMessage={errors.cylinderId?.message}
              asterisk
            >
              <div className="flex gap-2">
                <Controller
                  name="cylinderId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      className="flex-1"
                      options={cylinderOptions}
                      placeholder="Search by code..."
                      isLoading={loadingCylinders}
                      value={cylinderOptions.find((opt: any) => opt.value === field.value) || null}
                      onChange={(option) => field.onChange(option?.value || 0)}
                      onInputChange={setSearchCylinder}
                    />
                  )}
                />
                <Button
                  type="button"
                  variant="solid"
                  icon={<HiQrcode />}
                  onClick={handleScanQR}
                >
                  Scan QR
                </Button>
              </div>
            </FormItem>
            
            {selectedCylinder && (
              <>
                <Alert showIcon className="mt-4">
                  <div className="space-y-1">
                    <p className="font-semibold">Code: {selectedCylinder.cylinderCode}</p>
                    <p className="text-sm">Type: {selectedCylinder.type}</p>
                    <p className="text-sm">
                      Gas Volume: {selectedCylinder.currentGasVolume}/{selectedCylinder.maxGasVolume} kg
                    </p>
                    <p className="text-sm">
                      Location: {selectedCylinder.currentOutlet?.name || 'Unknown'}
                    </p>
                  </div>
                </Alert>
                
                {/* Pricing Breakdown */}
                {loadingPricing && (
                  <Alert className="mt-3">
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                      <span>Fetching pricing...</span>
                    </div>
                  </Alert>
                )}
                
                {pricingData && !loadingPricing && (
                  <Alert type="info" showIcon className="mt-3">
                    <div className="space-y-2">
                      <p className="font-semibold">Pricing Calculation (Per-KG Model)</p>
                      <div className="text-sm space-y-1">
                        <p>Cylinder Size: {selectedCylinder.type}</p>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Lease Fee (Subtotal):</span>
                            <span>₦{pricingData.subtotal.toLocaleString()}</span>
                          </div>
                          {pricingData.taxAmount > 0 && (
                            <div className="flex justify-between text-gray-600">
                              <span>
                                Tax ({pricingData.taxRate}%{' '}
                                {pricingData.taxType === 'inclusive' ? 'incl.' : 'excl.'}):
                              </span>
                              <span>₦{pricingData.taxAmount.toLocaleString()}</span>
                            </div>
                          )}
                          <div className="flex justify-between font-medium">
                            <span>Lease Total:</span>
                            <span>₦{pricingData.leaseAmount.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Security Deposit:</span>
                            <span>₦{pricingData.depositAmount.toLocaleString()}</span>
                          </div>
                          <div className="pt-1 mt-1 border-t">
                            <div className="flex justify-between font-semibold text-base">
                              <span>Total Amount:</span>
                              <span>₦{pricingData.totalAmount.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Alert>
                )}
              </>
            )}
          </Card>
        </div>
        
        {/* Payment Details */}
        <Card className="mt-6">
          <h4 className="mb-4">Payment Details</h4>
          
          <div className="grid md:grid-cols-2 gap-4">
            <FormItem
              label="Security Deposit (₦)"
              invalid={Boolean(errors.depositAmount)}
              errorMessage={errors.depositAmount?.message}
              asterisk
            >
              <Controller
                name="depositAmount"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="number"
                    placeholder={selectedCylinder ? "Calculated automatically" : "Select cylinder first"}
                    prefix="₦"
                    readOnly={!!pricingData}
                    disabled={!selectedCylinder || loadingPricing}
                    value={field.value || 0}
                    onChange={(e) => !pricingData && field.onChange(Number(e.target.value))}
                  />
                )}
              />
            </FormItem>
            
            <FormItem
              label="Lease Fee (₦)"
              invalid={Boolean(errors.leaseAmount)}
              errorMessage={errors.leaseAmount?.message}
              asterisk
            >
              <Controller
                name="leaseAmount"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="number"
                    placeholder={selectedCylinder ? "Calculated automatically" : "Select cylinder first"}
                    prefix="₦"
                    readOnly={!!pricingData}
                    disabled={!selectedCylinder || loadingPricing}
                    value={field.value || 0}
                    onChange={(e) => !pricingData && field.onChange(Number(e.target.value))}
                  />
                )}
              />
            </FormItem>
            
            <FormItem
              label="Payment Method"
              invalid={Boolean(errors.paymentMethod)}
              errorMessage={errors.paymentMethod?.message}
              asterisk
            >
              <Controller
                name="paymentMethod"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={[
                      { value: 'cash', label: 'Cash' },
                      { value: 'pos', label: 'POS (Card Payment)' },
                      { value: 'bank_transfer', label: 'Bank Transfer' },
                    ]}
                    placeholder="Select payment method"
                    value={
                      field.value
                        ? { value: field.value, label: 
                            field.value === 'cash' ? 'Cash' :
                            field.value === 'pos' ? 'POS (Card Payment)' :
                            'Bank Transfer'
                          }
                        : null
                    }
                    onChange={(option: any) => {
                      field.onChange(option?.value || 'cash')
                    }}
                  />
                )}
              />
            </FormItem>
            
            <FormItem
              label="Expected Return Date (Optional)"
              invalid={Boolean(errors.expectedReturnDate)}
              errorMessage={errors.expectedReturnDate?.message}
            >
              <Controller
                name="expectedReturnDate"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                  />
                )}
              />
            </FormItem>
            
            <FormItem
              label="Notes"
              className="md:col-span-2"
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
                    placeholder="Optional notes about this lease..."
                  />
                )}
              />
            </FormItem>
          </div>
          
          {/* Summary */}
          {selected && selectedCylinder && (
            <div className="mt-6 p-4 bg-gray-50 rounded">
              <h5 className="font-semibold mb-2">Transaction Summary</h5>
              <div className="grid md:grid-cols-2 gap-2 text-sm">
                {pricingData ? (
                  <>
                    <div>
                      <span className="text-gray-600">Lease Subtotal:</span>{' '}
                      <span className="font-medium">
                        ₦{pricingData.subtotal.toLocaleString()}
                      </span>
                    </div>
                    {pricingData.taxAmount > 0 && (
                      <div>
                        <span className="text-gray-600">
                          Tax ({pricingData.taxRate}%{' '}
                          {pricingData.taxType === 'inclusive' ? 'incl.' : 'excl.'}):
                        </span>{' '}
                        <span className="font-medium">
                          ₦{pricingData.taxAmount.toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-600">Lease Total:</span>{' '}
                      <span className="font-medium">
                        ₦{(watchedValues.leaseAmount || 0).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Security Deposit:</span>{' '}
                      <span className="font-medium">
                        ₦{(watchedValues.depositAmount || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="col-span-2 pt-2 mt-2 border-t">
                      <span className="text-gray-600 font-semibold">Total Amount:</span>{' '}
                      <span className="font-bold text-lg">
                        ₦{((watchedValues.leaseAmount || 0) + (watchedValues.depositAmount || 0)).toLocaleString()}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="col-span-2 text-gray-500 text-sm">
                    Select a cylinder to see pricing breakdown
                  </div>
                )}
                <div>
                  <span className="text-gray-600">Payment Method:</span>{' '}
                  <span className="font-medium">
                    {watchedValues.paymentMethod === 'cash' ? 'Cash' :
                     watchedValues.paymentMethod === 'pos' ? 'POS (Card Payment)' :
                     'Bank Transfer'}
                  </span>
                </div>
                {watchedValues.expectedReturnDate && (
                  <div>
                    <span className="text-gray-600">Expected Return:</span>{' '}
                    <span className="font-medium">
                      {new Date(watchedValues.expectedReturnDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <div>
                  <span className="text-gray-600">Processed by:</span>{' '}
                  <span className="font-medium">
                    {(session?.user as any)?.firstName} {(session?.user as any)?.lastName}
                  </span>
                </div>
              </div>
            </div>
          )}
        </Card>
        
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
            disabled={!selected || !selectedCylinder || isSubmitting}
            icon={<HiCheck />}
          >
            Create Lease
          </Button>
        </div>
      </form>
      
      {/* QR Scanner */}
      <CylinderQRScanner
        isOpen={scanDialogOpen}
        onClose={() => setScanDialogOpen(false)}
        onCylinderScanned={handleCylinderScanned}
        title="Scan Cylinder QR Code"
        description="Position the cylinder QR code within the camera view to select it for lease"
      />
    </div>
  )
}