'use client'

import { useMemo } from 'react'
import { Form, FormItem } from '@/components/ui/Form'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import Container from '@/components/shared/Container'
import BottomStickyBar from '@/components/template/BottomStickyBar'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { 
    PiHouseDuotone, 
    PiPhoneDuotone, 
    PiUserGearDuotone,
    PiMapPinDuotone,
    PiEnvelopeDuotone
} from 'react-icons/pi'
import type { OutletFormSchema } from '@/types/outlet'

type OutletFormProps = {
    onFormSubmit: (values: OutletFormSchema) => void
    defaultValues?: Partial<OutletFormSchema>
    managers?: Array<{ value: number; label: string }>
    isSubmitting?: boolean
}

const validationSchema = z.object({
    name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
    location: z.string().min(1, 'Location is required'),
    contactPhone: z
        .string()
        .min(10, 'Phone number must be at least 10 characters')
        .max(20, 'Phone number is too long'),
    contactEmail: z.string().email('Invalid email address'),
    managerId: z.number().nullable().optional(),
    status: z.enum(['active', 'inactive']).optional(),
})

const OutletForm = ({
    onFormSubmit,
    defaultValues = {},
    managers = [],
    isSubmitting = false,
}: OutletFormProps) => {
    const {
        handleSubmit,
        reset,
        formState: { errors },
        control,
    } = useForm<OutletFormSchema>({
        defaultValues: {
            name: '',
            location: '',
            contactPhone: '',
            contactEmail: '',
            managerId: null,
            status: 'active',
            ...defaultValues,
        },
        resolver: zodResolver(validationSchema),
    })

    // Note: useEffect for resetting form values removed to prevent infinite loop
    // The defaultValues are already applied through the useForm hook's defaultValues option

    // Memoize icons to prevent re-renders
    const mapPinIcon = useMemo(() => <PiMapPinDuotone className="text-gray-400" />, [])
    const phoneIcon = useMemo(() => <PiPhoneDuotone className="text-gray-400" />, [])
    const envelopeIcon = useMemo(() => <PiEnvelopeDuotone className="text-gray-400" />, [])

    const onSubmit = (values: OutletFormSchema) => {
        onFormSubmit(values)
    }

    return (
        <Form
            className="flex w-full h-full"
            containerClassName="flex flex-col w-full justify-between"
            onSubmit={handleSubmit(onSubmit)}
        >
            <Container>
                <div className="flex flex-col gap-4">
                    {/* Basic Information Section */}
                    <Card>
                        <h4 className="mb-6 flex items-center gap-2">
                            <PiHouseDuotone className="text-xl" />
                            Basic Information
                        </h4>
                        <div className="grid md:grid-cols-2 gap-4">
                            <FormItem
                                label="Outlet Name"
                                invalid={Boolean(errors.name)}
                                errorMessage={errors.name?.message}
                            >
                                <Controller
                                    name="name"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            placeholder="Enter outlet name"
                                            autoComplete="off"
                                        />
                                    )}
                                />
                            </FormItem>
                            <FormItem
                                label="Location"
                                invalid={Boolean(errors.location)}
                                errorMessage={errors.location?.message}
                            >
                                <Controller
                                    name="location"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            placeholder="Enter outlet location"
                                            autoComplete="off"
                                            prefix={mapPinIcon}
                                        />
                                    )}
                                />
                            </FormItem>
                        </div>
                    </Card>

                    {/* Contact Information Section */}
                    <Card>
                        <h4 className="mb-6 flex items-center gap-2">
                            <PiPhoneDuotone className="text-xl" />
                            Contact Information
                        </h4>
                        <div className="grid md:grid-cols-2 gap-4">
                            <FormItem
                                label="Contact Phone"
                                invalid={Boolean(errors.contactPhone)}
                                errorMessage={errors.contactPhone?.message}
                            >
                                <Controller
                                    name="contactPhone"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            placeholder="Enter contact phone"
                                            autoComplete="off"
                                            prefix={phoneIcon}
                                        />
                                    )}
                                />
                            </FormItem>
                            <FormItem
                                label="Contact Email"
                                invalid={Boolean(errors.contactEmail)}
                                errorMessage={errors.contactEmail?.message}
                            >
                                <Controller
                                    name="contactEmail"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            type="email"
                                            placeholder="Enter contact email"
                                            autoComplete="off"
                                            prefix={envelopeIcon}
                                        />
                                    )}
                                />
                            </FormItem>
                        </div>
                    </Card>

                    {/* Management Section */}
                    <Card>
                        <h4 className="mb-6 flex items-center gap-2">
                            <PiUserGearDuotone className="text-xl" />
                            Management
                        </h4>
                        <div className="grid md:grid-cols-2 gap-4">
                            <FormItem
                                label="Outlet Manager"
                                invalid={Boolean(errors.managerId)}
                                errorMessage={errors.managerId?.message}
                            >
                                <Controller
                                    name="managerId"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            {...field}
                                            options={managers}
                                            placeholder="Select a manager"
                                            isClearable
                                            value={
                                                field.value
                                                    ? managers.find(
                                                          (m) => m.value === field.value
                                                      )
                                                    : null
                                            }
                                            onChange={(option: any) => {
                                                field.onChange(option?.value || null)
                                            }}
                                        />
                                    )}
                                />
                            </FormItem>
                            {defaultValues.status && (
                                <FormItem
                                    label="Status"
                                    invalid={Boolean(errors.status)}
                                    errorMessage={errors.status?.message}
                                >
                                    <Controller
                                        name="status"
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                {...field}
                                                options={[
                                                    { value: 'active', label: 'Active' },
                                                    { value: 'inactive', label: 'Inactive' },
                                                ]}
                                                placeholder="Select status"
                                                value={
                                                    field.value
                                                        ? {
                                                              value: field.value,
                                                              label:
                                                                  field.value
                                                                      .charAt(0)
                                                                      .toUpperCase() +
                                                                  field.value.slice(1),
                                                          }
                                                        : null
                                                }
                                                onChange={(option: any) => {
                                                    field.onChange(option?.value)
                                                }}
                                            />
                                        )}
                                    />
                                </FormItem>
                            )}
                        </div>
                    </Card>
                </div>
            </Container>
            <BottomStickyBar>
                <div className="flex items-center gap-3">
                    <Button
                        variant="solid"
                        type="submit"
                        loading={isSubmitting}
                        disabled={isSubmitting}
                    >
                        {defaultValues.name ? 'Update Outlet' : 'Create Outlet'}
                    </Button>
                    <Button
                        variant="plain"
                        onClick={() => window.history.back()}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                </div>
            </BottomStickyBar>
        </Form>
    )
}

export default OutletForm