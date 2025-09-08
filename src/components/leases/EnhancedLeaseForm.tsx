'use client'

import { useState } from 'react'
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
import type { CreateLeaseDto } from '@/services/api/lease.service'
import type {  } from '@/types/cylinder'
import { useAuthStore } from '@/stores'

const leaseSchema = z.object({
  customerId: z.number().min(1, 'Customer is required'),
  cylinderId: z.number().min(1, 'Cylinder is required'),
  depositAmount: z.number().min(0, 'Deposit must be a positive number'),
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
      depositAmount: 5000, // Default deposit
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
  const selectedCylinder = cylindersData?.data?.find((c: any) => c.id === selectedCylinderId)
  
  const onSubmit = async (data: LeaseFormData) => {
    try {
      setFormError(null) // Clear any previous errors
      const leaseData: CreateLeaseDto = {
        customerId: data.customerId,
        cylinderId: data.cylinderId,
        depositAmount: data.depositAmount,
        leaseAmount: data.depositAmount, // Using deposit amount as lease amount for now
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
  
  const handleCylinderScanned = (cylinder: any) => {
    if (cylinder.status === 'available') {
      setValue('cylinderId', cylinder.id)
      setSearchCylinder(cylinder.cylinderCode)
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
  const cylinderOptions = cylindersData?.data?.map((cylinder: any) => ({
    value: cylinder.id,
    label: `${cylinder.cylinderCode} - ${cylinder.type} (${cylinder.currentOutlet?.name || 'Unknown outlet'})`
  })) || []
  
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
                    placeholder="Enter deposit amount"
                    prefix="₦"
                    onChange={(e) => field.onChange(Number(e.target.value))}
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
                <div>
                  <span className="text-gray-600">Security Deposit:</span>{' '}
                  <span className="font-medium">
                    ₦{watchedValues.depositAmount.toLocaleString()}
                  </span>
                </div>
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