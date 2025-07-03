'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { HiArrowLeft, HiCheck, HiX } from 'react-icons/hi'
import { Form, FormItem } from '@/components/ui/Form'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import Container from '@/components/shared/Container'
import BottomStickyBar from '@/components/template/BottomStickyBar'
import Alert from '@/components/ui/Alert'
import { useCustomers } from '@/hooks/useCustomers'
import { useLeases, useLeaseMutations } from '@/hooks/useLeases'
import { formatCurrency } from '@/utils/formatCurrency'
import { formatDate } from '@/utils/formatDate'
import type { ZodType } from 'zod'

const returnSchema: ZodType<ReturnFormData> = z.object({
  leaseId: z.number().min(1, 'Lease selection is required'),
  cylinderCondition: z.enum(['good', 'damaged', 'empty']),
  refundAmount: z.number().min(0, 'Refund amount must be positive'),
  deductions: z.number().min(0, 'Deductions must be positive'),
  deductionReason: z.string().optional(),
  notes: z.string().optional()
}).refine((data) => {
  if (data.deductions > 0 && !data.deductionReason) {
    return false
  }
  return true
}, {
  message: "Deduction reason is required when deductions are applied",
  path: ["deductionReason"]
})

type ReturnFormData = {
  leaseId: number
  cylinderCondition: 'good' | 'damaged' | 'empty'
  refundAmount: number
  deductions: number
  deductionReason?: string
  notes?: string
}

const cylinderConditionOptions = [
  { value: 'good', label: 'Good Condition', color: 'green' },
  { value: 'damaged', label: 'Damaged', color: 'red' },
  { value: 'empty', label: 'Empty', color: 'amber' },
]

interface ReturnFormProps {
  returnId?: number
}

export function ReturnForm({ returnId }: ReturnFormProps) {
  const router = useRouter()
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null)
  const [selectedLease, setSelectedLease] = useState<any>(null)
  
  const { data: customers } = useCustomers()
  const { data: leasesResponse } = useLeases({ 
    customerId: selectedCustomerId || undefined
  })
  const leases = leasesResponse?.data || []
  const { returnLease } = useLeaseMutations()
  
  const {
    handleSubmit,
    reset: _reset,
    formState: { errors },
    control,
    watch,
    setValue
  } = useForm<ReturnFormData>({
    defaultValues: {
      leaseId: 0,
      cylinderCondition: 'good',
      refundAmount: 0,
      deductions: 0,
      deductionReason: '',
      notes: ''
    },
    resolver: zodResolver(returnSchema)
  })
  
  const watchedValues = watch()
  
  // Update refund amount when lease is selected or deductions change
  useEffect(() => {
    if (selectedLease) {
      const baseRefund = selectedLease.deposit || 0
      const finalRefund = Math.max(0, baseRefund - watchedValues.deductions)
      setValue('refundAmount', finalRefund)
    }
  }, [selectedLease, watchedValues.deductions, setValue])
  
  const onSubmit = async (data: ReturnFormData) => {
    try {
      await returnLease.trigger({
        id: data.leaseId,
        data: {
          cylinderCondition: data.cylinderCondition,
          refundAmount: data.refundAmount,
          deductions: data.deductions,
          deductionReason: data.deductionReason,
          notes: data.notes
        }
      })
      router.push('/admin/leases')
    } catch (error) {
      console.error('Failed to process return:', error)
    }
  }
  
  // Transform data for Select components
  const customerOptions = customers?.data?.map((customer: any) => ({
    value: customer.id,
    label: `${customer.user?.firstName || customer.firstName} ${customer.user?.lastName || customer.lastName} - ${customer.user?.phone || customer.phone}`
  })) || []
  
  const leaseOptions = leases.map((lease: any) => ({
    value: lease.id,
    label: `${lease.cylinder?.cylinderCode || 'Unknown'} - ${lease.cylinder?.type || 'Unknown'} (Leased ${formatDate(lease.createdAt)})`,
    lease: lease
  }))
  
  const handleCustomerSelect = (customerId: number) => {
    setSelectedCustomerId(customerId)
    setSelectedLease(null)
    setValue('leaseId', 0)
  }
  
  const handleLeaseSelect = (leaseId: number) => {
    const lease = leases.find((l: any) => l.id === leaseId)
    if (lease) {
      setSelectedLease(lease)
      setValue('leaseId', leaseId)
    }
  }
  
  const calculateDaysLeased = (startDate: string) => {
    const start = new Date(startDate)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }
  
  return (
    <Form
      className="flex w-full h-full"
      containerClassName="flex flex-col w-full justify-between"
      onSubmit={handleSubmit(onSubmit)}
    >
      <Container>
        {/* Header */}
        <div className="mb-8">
          <Button
            size="sm"
            variant="plain"
            icon={<HiArrowLeft />}
            onClick={() => router.push('/admin/leases')}
          >
            Back to Leases
          </Button>
          
          <h3 className="mb-2">Process Lease Return</h3>
        </div>
        
        <div className="flex flex-col gap-4">
          {/* Customer Selection */}
          <Card>
            <h4 className="mb-6">Select Customer</h4>
            <FormItem
              label="Customer"
              asterisk
            >
              <Select
                options={customerOptions}
                placeholder="Search and select a customer"
                value={
                  selectedCustomerId 
                    ? customerOptions.find((opt: any) => opt.value === selectedCustomerId)
                    : null
                }
                onChange={(option: any) => {
                  handleCustomerSelect(option?.value || 0)
                }}
              />
            </FormItem>
          </Card>
          
          {/* Lease Selection */}
          {selectedCustomerId && (
            <Card>
              <h4 className="mb-6">Select Active Lease</h4>
              <FormItem
                label="Active Lease"
                invalid={Boolean(errors.leaseId)}
                errorMessage={errors.leaseId?.message}
                asterisk
              >
                <Controller
                  name="leaseId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={leaseOptions}
                      placeholder="Select lease to return"
                      value={
                        field.value 
                          ? leaseOptions.find((opt: any) => opt.value === field.value)
                          : null
                      }
                      onChange={(option: any) => {
                        handleLeaseSelect(option?.value || 0)
                      }}
                    />
                  )}
                />
              </FormItem>
              
              {leases.length === 0 && (
                <Alert showIcon className="mt-4">
                  This customer has no active leases
                </Alert>
              )}
            </Card>
          )}
          
          {/* Lease Details */}
          {selectedLease && (
            <>
              <Card>
                <h4 className="mb-6">Lease Details</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Cylinder</p>
                    <p className="font-medium">{selectedLease.cylinder.cylinderCode} - {selectedLease.cylinder.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Lease Date</p>
                    <p className="font-medium">{formatDate(selectedLease.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Days Leased</p>
                    <p className="font-medium">{calculateDaysLeased(selectedLease.createdAt)} days</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Deposit Amount</p>
                    <p className="font-medium">{formatCurrency(selectedLease.deposit)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Monthly Rate</p>
                    <p className="font-medium">{formatCurrency(selectedLease.monthlyRate)}/month</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Paid</p>
                    <p className="font-medium">{formatCurrency(selectedLease.totalPaid || 0)}</p>
                  </div>
                </div>
              </Card>
              
              {/* Return Details */}
              <Card>
                <h4 className="mb-6">Return Assessment</h4>
                <div className="grid gap-4">
                  <FormItem
                    label="Cylinder Condition"
                    invalid={Boolean(errors.cylinderCondition)}
                    errorMessage={errors.cylinderCondition?.message}
                    asterisk
                  >
                    <Controller
                      name="cylinderCondition"
                      control={control}
                      render={({ field }) => (
                        <div className="grid grid-cols-3 gap-3">
                          {cylinderConditionOptions.map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => field.onChange(option.value)}
                              className={`
                                p-4 rounded-lg border-2 text-center transition-all
                                ${field.value === option.value
                                  ? option.color === 'green' 
                                    ? 'border-green-500 bg-green-50 text-green-700'
                                    : option.color === 'red'
                                    ? 'border-red-500 bg-red-50 text-red-700'
                                    : 'border-amber-500 bg-amber-50 text-amber-700'
                                  : 'border-gray-300 hover:border-gray-400'
                                }
                              `}
                            >
                              {option.value === 'good' && <HiCheck className="h-6 w-6 mx-auto mb-2" />}
                              {option.value === 'damaged' && <HiX className="h-6 w-6 mx-auto mb-2" />}
                              {option.value === 'empty' && (
                                <div className="h-6 w-6 mx-auto mb-2 rounded-full border-2 border-current" />
                              )}
                              <div className="font-medium">{option.label}</div>
                            </button>
                          ))}
                        </div>
                      )}
                    />
                  </FormItem>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormItem
                      label="Deductions"
                      invalid={Boolean(errors.deductions)}
                      errorMessage={errors.deductions?.message}
                    >
                      <Controller
                        name="deductions"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="number"
                            min="0"
                            max={selectedLease.deposit}
                            placeholder="Enter deduction amount"
                            autoComplete="off"
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        )}
                      />
                    </FormItem>
                    
                    <FormItem
                      label="Deduction Reason"
                      invalid={Boolean(errors.deductionReason)}
                      errorMessage={errors.deductionReason?.message}
                      asterisk={watchedValues.deductions > 0}
                    >
                      <Controller
                        name="deductionReason"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            placeholder="Reason for deduction"
                            autoComplete="off"
                            disabled={watchedValues.deductions === 0}
                          />
                        )}
                      />
                    </FormItem>
                  </div>
                  
                  <FormItem
                    label="Additional Notes"
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
                          placeholder="Optional notes about the return"
                          autoComplete="off"
                        />
                      )}
                    />
                  </FormItem>
                </div>
              </Card>
              
              {/* Refund Summary */}
              <Card className="bg-gray-50">
                <h4 className="mb-4">Refund Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Original Deposit:</span>
                    <span className="font-medium">{formatCurrency(selectedLease.deposit)}</span>
                  </div>
                  {watchedValues.deductions > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Deductions:</span>
                      <span className="font-medium">-{formatCurrency(watchedValues.deductions)}</span>
                    </div>
                  )}
                  <div className="pt-2 mt-2 border-t border-gray-300">
                    <div className="flex justify-between text-lg">
                      <span className="font-semibold">Total Refund:</span>
                      <span className="font-bold text-green-600">
                        {formatCurrency(watchedValues.refundAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </>
          )}
        </div>
      </Container>
      
      <BottomStickyBar>
        <div className="flex items-center gap-3">
          <Button
            variant="solid"
            type="submit"
            loading={returnLease.isMutating}
            disabled={returnLease.isMutating || !selectedLease}
            icon={<HiCheck />}
          >
            Process Return
          </Button>
          <Button
            variant="plain"
            onClick={() => router.push('/admin/leases')}
            disabled={returnLease.isMutating}
          >
            Cancel
          </Button>
        </div>
      </BottomStickyBar>
    </Form>
  )
}

export default ReturnForm