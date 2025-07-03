'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  PiArrowLeftDuotone,
  PiArrowsLeftRightDuotone,
  PiMagnifyingGlassDuotone,
  PiWarningDuotone,
  PiCheckDuotone,
  PiCubeDuotone,
  PiFlaskDuotone,
  PiInfoDuotone
} from 'react-icons/pi'
import { Form, FormItem } from '@/components/ui/Form'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import Container from '@/components/shared/Container'
import BottomStickyBar from '@/components/template/BottomStickyBar'
import Alert from '@/components/ui/Alert'
import Badge from '@/components/ui/Badge'
import { useOutlets } from '@/hooks/useOutlets'
import { useCylinders } from '@/hooks/useCylinders'
import { useTransferMutations } from '@/hooks/useTransfers'
import useWindowSize from '@/components/ui/hooks/useWindowSize'
import type { ZodType } from 'zod'

const transferSchema: ZodType<TransferFormData> = z.object({
  sourceOutletId: z.number().min(1, 'Source outlet is required'),
  destinationOutletId: z.number().min(1, 'Destination outlet is required'),
  cylinderIds: z.array(z.number()).min(1, 'At least one cylinder must be selected'),
  reason: z.enum(['rebalancing', 'request', 'maintenance', 'other']),
  notes: z.string().optional(),
}).refine((data) => data.sourceOutletId !== data.destinationOutletId, {
  message: "Source and destination outlets must be different",
  path: ["destinationOutletId"],
})

type TransferFormData = {
  sourceOutletId: number
  destinationOutletId: number
  cylinderIds: number[]
  reason: 'rebalancing' | 'request' | 'maintenance' | 'other'
  notes?: string
}

const transferReasonOptions = [
  { value: 'rebalancing', label: 'Stock Rebalancing' },
  { value: 'request', label: 'Outlet Request' },
  { value: 'maintenance', label: 'Maintenance Transfer' },
  { value: 'other', label: 'Other' },
]

interface TransferFormProps {
  transferId?: number
}

export function TransferForm({ transferId: _transferId }: TransferFormProps) {
  const router = useRouter()
  const { width } = useWindowSize()
  const isMobile = width ? width < 768 : false
  const [selectedCylinders, setSelectedCylinders] = useState<number[]>([])
  const [cylinderSearch, setCylinderSearch] = useState('')
  
  // Memoize the search icon to prevent re-renders
  const searchIcon = useMemo(() => 
    <PiMagnifyingGlassDuotone className="w-4 h-4 text-gray-400" />, 
    []
  )
  
  const { createTransfer } = useTransferMutations()
  const { data: outlets } = useOutlets()
  
  const {
    handleSubmit,
    formState: { errors },
    control,
    watch,
    setValue,
  } = useForm<TransferFormData>({
    defaultValues: {
      sourceOutletId: 0,
      destinationOutletId: 0,
      cylinderIds: [],
      reason: 'rebalancing',
      notes: '',
    },
    resolver: zodResolver(transferSchema),
  })
  
  const watchedSourceOutlet = watch('sourceOutletId')
  
  // Fetch cylinders for selected source outlet
  const { data: cylindersResponse } = useCylinders({ 
    outletId: watchedSourceOutlet || undefined,
    status: 'available' 
  })
  const cylinders = cylindersResponse?.data || []
  
  // Update form when cylinders are selected
  useEffect(() => {
    setValue('cylinderIds', selectedCylinders)
  }, [selectedCylinders, setValue])
  
  const onSubmit = async (data: TransferFormData) => {
    try {
      // TODO: Implement bulk transfer logic
      // The API expects single transfers, but this form is for bulk transfers
      // Need to loop through cylinderIds and create individual transfers
      console.log('Bulk transfer data:', data)
      // await createTransfer.trigger(data)
      router.push('/admin/transfers')
    } catch (error) {
      console.error('Failed to create transfer:', error)
    }
  }
  
  // Transform outlets for Select component
  const outletOptions = outlets?.outlets?.map(outlet => ({
    value: outlet.id,
    label: `${outlet.name} - ${outlet.location}`,
  })) || []
  
  // Filter cylinders based on search
  const filteredCylinders = cylinders.filter(cylinder =>
    cylinder.cylinderCode.toLowerCase().includes(cylinderSearch.toLowerCase()) ||
    cylinder.type.toLowerCase().includes(cylinderSearch.toLowerCase())
  )
  
  const toggleCylinder = (cylinderId: number) => {
    if (selectedCylinders.includes(cylinderId)) {
      setSelectedCylinders(selectedCylinders.filter(id => id !== cylinderId))
    } else {
      setSelectedCylinders([...selectedCylinders, cylinderId])
    }
  }
  
  const selectAllCylinders = () => {
    if (selectedCylinders.length === filteredCylinders.length) {
      setSelectedCylinders([])
    } else {
      setSelectedCylinders(filteredCylinders.map(c => c.id))
    }
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
            icon={<PiArrowLeftDuotone />}
            onClick={() => router.push('/admin/transfers')}
          >
            {isMobile ? 'Back' : 'Back to Transfers'}
          </Button>
          
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Create Cylinder Transfer</h3>
          <p className="text-sm text-gray-500">Transfer cylinders between outlets</p>
        </div>
        
        <div className="flex flex-col gap-4">
          {/* Outlet Selection Section */}
          <AdaptiveCard>
            <div className="p-4 md:p-6">
              <h4 className="text-lg font-semibold mb-4 md:mb-6">Transfer Details</h4>
            <div className="grid md:grid-cols-2 gap-6">
              <FormItem
                label="Source Outlet"
                invalid={Boolean(errors.sourceOutletId)}
                errorMessage={errors.sourceOutletId?.message}
                asterisk
              >
                <Controller
                  name="sourceOutletId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={outletOptions}
                      placeholder="Select source outlet"
                      value={
                        field.value 
                          ? outletOptions.find(opt => opt.value === field.value)
                          : null
                      }
                      onChange={(option: any) => {
                        field.onChange(option?.value || 0)
                        // Reset cylinder selection when outlet changes
                        setSelectedCylinders([])
                      }}
                    />
                  )}
                />
              </FormItem>
              
              <FormItem
                label="Destination Outlet"
                invalid={Boolean(errors.destinationOutletId)}
                errorMessage={errors.destinationOutletId?.message}
                asterisk
              >
                <Controller
                  name="destinationOutletId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={outletOptions.filter(opt => opt.value !== watchedSourceOutlet)}
                      placeholder="Select destination outlet"
                      value={
                        field.value 
                          ? outletOptions.find(opt => opt.value === field.value)
                          : null
                      }
                      onChange={(option: any) => {
                        field.onChange(option?.value || 0)
                      }}
                    />
                  )}
                />
              </FormItem>
              
              <FormItem
                label="Transfer Reason"
                invalid={Boolean(errors.reason)}
                errorMessage={errors.reason?.message}
                asterisk
              >
                <Controller
                  name="reason"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={transferReasonOptions}
                      placeholder="Select reason"
                      value={
                        field.value 
                          ? transferReasonOptions.find(opt => opt.value === field.value)
                          : null
                      }
                      onChange={(option: any) => {
                        field.onChange(option?.value || 'rebalancing')
                      }}
                    />
                  )}
                />
              </FormItem>
              
              <FormItem
                label="Notes"
                invalid={Boolean(errors.notes)}
                errorMessage={errors.notes?.message}
              >
                <Controller
                  name="notes"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Optional transfer notes"
                      autoComplete="off"
                    />
                  )}
                />
              </FormItem>
            </div>
            </div>
          </AdaptiveCard>
          
          {/* Cylinder Selection Section */}
          {watchedSourceOutlet > 0 && (
            <AdaptiveCard>
              <div className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                  <h4 className="text-lg font-semibold">Select Cylinders to Transfer</h4>
                <div className="flex items-center gap-2">
                  {selectedCylinders.length > 0 && (
                    <Badge className="bg-blue-100 text-blue-700 border-blue-200 border">
                      {selectedCylinders.length} selected
                    </Badge>
                  )}
                  <Button
                    size="sm"
                    variant="plain"
                    onClick={selectAllCylinders}
                  >
                    {selectedCylinders.length === filteredCylinders.length ? 'Deselect All' : 'Select All'}
                  </Button>
                </div>
              </div>
              
              {errors.cylinderIds && (
                <Alert showIcon type="danger" className="mb-4">
                  <PiWarningDuotone className="text-lg" />
                  {errors.cylinderIds.message}
                </Alert>
              )}
              
              {/* Search */}
              <div className="mb-4">
                <Input
                  placeholder="Search cylinders by code or type..."
                  value={cylinderSearch}
                  onChange={(e) => setCylinderSearch(e.target.value)}
                  prefix={searchIcon}
                />
              </div>
              
              {/* Cylinder List */}
              {cylinders.length === 0 ? (
                <div className="text-center py-8">
                  <PiCubeDuotone className="text-6xl text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No available cylinders in the selected outlet</p>
                </div>
              ) : filteredCylinders.length === 0 ? (
                <div className="text-center py-8">
                  <PiMagnifyingGlassDuotone className="text-6xl text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No cylinders match your search</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                  {filteredCylinders.map((cylinder) => (
                    <div
                      key={cylinder.id}
                      onClick={() => toggleCylinder(cylinder.id)}
                      className={`
                        p-3 md:p-4 rounded-lg border-2 cursor-pointer transition-all
                        ${selectedCylinders.includes(cylinder.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                        }
                      `}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <PiCubeDuotone className="text-gray-400" />
                            <p className="font-medium">{cylinder.cylinderCode}</p>
                          </div>
                          <p className="text-sm text-gray-600">{cylinder.type}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                            <PiFlaskDuotone className="text-gray-400" />
                            <span>{cylinder.currentGasVolume}/{cylinder.maxGasVolume} kg</span>
                          </div>
                        </div>
                        <div className={`
                          w-5 h-5 rounded border-2 flex items-center justify-center
                          ${selectedCylinders.includes(cylinder.id)
                            ? 'bg-blue-500 border-blue-500'
                            : 'border-gray-300'
                          }
                        `}>
                          {selectedCylinders.includes(cylinder.id) && (
                            <PiCheckDuotone className="w-3 h-3 text-white" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              </div>
            </AdaptiveCard>
          )}
          
          {/* Summary */}
          {selectedCylinders.length > 0 && (
            <Alert showIcon type="info">
              <PiInfoDuotone className="text-lg" />
              <div className="flex items-center justify-between">
                <span>
                  Transferring {selectedCylinders.length} cylinder{selectedCylinders.length > 1 ? 's' : ''} 
                  {watchedSourceOutlet && watch('destinationOutletId') && (
                    <span>
                      {' '}from <strong>{outlets?.outlets?.find(o => o.id === watchedSourceOutlet)?.name}</strong>
                      {' '}to <strong>{outlets?.outlets?.find(o => o.id === watch('destinationOutletId'))?.name}</strong>
                    </span>
                  )}
                </span>
              </div>
            </Alert>
          )}
        </div>
      </Container>
      
      <BottomStickyBar>
        <div className="flex items-center gap-2 md:gap-3">
          <Button
            variant="solid"
            type="submit"
            loading={createTransfer.isMutating}
            disabled={createTransfer.isMutating || selectedCylinders.length === 0}
            icon={<PiArrowsLeftRightDuotone />}
          >
            {isMobile ? 'Transfer' : 'Create Transfer'}
          </Button>
          <Button
            variant="plain"
            onClick={() => router.push('/admin/transfers')}
            disabled={createTransfer.isMutating}
          >
            Cancel
          </Button>
        </div>
      </BottomStickyBar>
    </Form>
  )
}

export default TransferForm