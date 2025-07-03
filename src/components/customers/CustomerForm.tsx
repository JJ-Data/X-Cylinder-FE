'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { HiArrowLeft } from 'react-icons/hi'
import { Form, FormItem } from '@/components/ui/Form'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import Container from '@/components/shared/Container'
import BottomStickyBar from '@/components/template/BottomStickyBar'
import Loading from '@/components/shared/Loading'
import { useCustomer, useCustomerMutations } from '@/hooks/useCustomers'
import type { ZodType } from 'zod'

const customerSchema: ZodType<CustomerFormData> = z.object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(10, 'Phone number must be at least 10 characters'),
    address: z.string().min(5, 'Address must be at least 5 characters'),
    identificationNumber: z
        .string()
        .min(5, 'Identification number is required'),
    identificationType: z.enum(['nationalId', 'passport', 'driverLicense']),
    emergencyContactName: z.string().optional(),
    emergencyContactPhone: z.string().optional(),
    notes: z.string().optional(),
})

type CustomerFormData = {
    firstName: string
    lastName: string
    email: string
    phone: string
    address: string
    identificationNumber: string
    identificationType: 'nationalId' | 'passport' | 'driverLicense'
    emergencyContactName?: string
    emergencyContactPhone?: string
    notes?: string
}

const identificationTypeOptions = [
    { value: 'nationalId', label: 'National ID' },
    { value: 'passport', label: 'Passport' },
    { value: 'driverLicense', label: 'Driver License' },
]

interface CustomerFormProps {
    customerId?: number
}

export function CustomerForm({ customerId }: CustomerFormProps) {
    const router = useRouter()
    const isEdit = !!customerId

    const { data: customer, isLoading: customerLoading } = useCustomer(
        isEdit ? customerId : undefined,
    )
    const { createCustomer, updateCustomer } = useCustomerMutations()

    const {
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
        control,
    } = useForm<CustomerFormData>({
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            address: '',
            identificationNumber: '',
            identificationType: 'nationalId',
            emergencyContactName: '',
            emergencyContactPhone: '',
            notes: '',
        },
        resolver: zodResolver(customerSchema),
    })

    // Populate form with existing data
    useEffect(() => {
        if (customer) {
            reset({
                firstName: customer.firstName,
                lastName: customer.lastName,
                email: customer.email,
                phone: customer.phone,
                address: customer.address,
                identificationNumber: customer.identificationNumber,
                identificationType: customer.identificationType || 'nationalId',
                emergencyContactName: customer.emergencyContactName || '',
                emergencyContactPhone: customer.emergencyContactPhone || '',
                notes: customer.notes || '',
            })
        }
    }, [customer, reset])

    const onSubmit = async (data: CustomerFormData) => {
        try {
            if (isEdit) {
                await updateCustomer(customerId, data)
            } else {
                await createCustomer(data)
            }
            router.push('/admin/customers')
        } catch (error) {
            console.error('Failed to save customer:', error)
        }
    }

    if (isEdit && customerLoading) {
        return (
            <Container>
                <Loading loading={true} />
            </Container>
        )
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
                        onClick={() => router.push('/admin/customers')}
                    >
                        Back to Customers
                    </Button>

                    <h3 className="mb-2">
                        {isEdit ? 'Edit Customer' : 'Add New Customer'}
                    </h3>
                </div>

                <div className="flex flex-col gap-4">
                    {/* Basic Information Section */}
                    <Card>
                        <h4 className="mb-6">Basic Information</h4>
                        <div className="grid md:grid-cols-2 gap-4">
                            <FormItem
                                label="First Name"
                                invalid={Boolean(errors.firstName)}
                                errorMessage={errors.firstName?.message}
                                asterisk
                            >
                                <Controller
                                    name="firstName"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            placeholder="Enter first name"
                                            autoComplete="off"
                                        />
                                    )}
                                />
                            </FormItem>

                            <FormItem
                                label="Last Name"
                                invalid={Boolean(errors.lastName)}
                                errorMessage={errors.lastName?.message}
                                asterisk
                            >
                                <Controller
                                    name="lastName"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            placeholder="Enter last name"
                                            autoComplete="off"
                                        />
                                    )}
                                />
                            </FormItem>
                        </div>
                    </Card>

                    {/* Contact Information Section */}
                    <Card>
                        <h4 className="mb-6">Contact Information</h4>
                        <div className="grid md:grid-cols-2 gap-4">
                            <FormItem
                                label="Email"
                                invalid={Boolean(errors.email)}
                                errorMessage={errors.email?.message}
                                asterisk
                            >
                                <Controller
                                    name="email"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            type="email"
                                            placeholder="Enter email address"
                                            autoComplete="off"
                                        />
                                    )}
                                />
                            </FormItem>

                            <FormItem
                                label="Phone"
                                invalid={Boolean(errors.phone)}
                                errorMessage={errors.phone?.message}
                                asterisk
                            >
                                <Controller
                                    name="phone"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            placeholder="Enter phone number"
                                            autoComplete="off"
                                        />
                                    )}
                                />
                            </FormItem>

                            <FormItem
                                label="Address"
                                invalid={Boolean(errors.address)}
                                errorMessage={errors.address?.message}
                                asterisk
                                className="md:col-span-2"
                            >
                                <Controller
                                    name="address"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            textArea
                                            rows={2}
                                            placeholder="Enter full address"
                                            autoComplete="off"
                                        />
                                    )}
                                />
                            </FormItem>
                        </div>
                    </Card>

                    {/* Identification Section */}
                    <Card>
                        <h4 className="mb-6">Identification</h4>
                        <div className="grid md:grid-cols-2 gap-4">
                            <FormItem
                                label="Identification Type"
                                invalid={Boolean(errors.identificationType)}
                                errorMessage={
                                    errors.identificationType?.message
                                }
                                asterisk
                            >
                                <Controller
                                    name="identificationType"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            {...field}
                                            options={identificationTypeOptions}
                                            placeholder="Select ID type"
                                            value={
                                                field.value
                                                    ? identificationTypeOptions.find(
                                                          (opt) =>
                                                              opt.value ===
                                                              field.value,
                                                      )
                                                    : null
                                            }
                                            onChange={(option: any) => {
                                                field.onChange(
                                                    option?.value ||
                                                        'nationalId',
                                                )
                                            }}
                                        />
                                    )}
                                />
                            </FormItem>

                            <FormItem
                                label="Identification Number"
                                invalid={Boolean(errors.identificationNumber)}
                                errorMessage={
                                    errors.identificationNumber?.message
                                }
                                asterisk
                            >
                                <Controller
                                    name="identificationNumber"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            placeholder="Enter ID number"
                                            autoComplete="off"
                                        />
                                    )}
                                />
                            </FormItem>
                        </div>
                    </Card>

                    {/* Emergency Contact Section */}
                    <Card>
                        <h4 className="mb-6">Emergency Contact (Optional)</h4>
                        <div className="grid md:grid-cols-2 gap-4">
                            <FormItem
                                label="Contact Name"
                                invalid={Boolean(errors.emergencyContactName)}
                                errorMessage={
                                    errors.emergencyContactName?.message
                                }
                            >
                                <Controller
                                    name="emergencyContactName"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            placeholder="Enter emergency contact name"
                                            autoComplete="off"
                                        />
                                    )}
                                />
                            </FormItem>

                            <FormItem
                                label="Contact Phone"
                                invalid={Boolean(errors.emergencyContactPhone)}
                                errorMessage={
                                    errors.emergencyContactPhone?.message
                                }
                            >
                                <Controller
                                    name="emergencyContactPhone"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            placeholder="Enter emergency contact phone"
                                            autoComplete="off"
                                        />
                                    )}
                                />
                            </FormItem>
                        </div>
                    </Card>

                    {/* Additional Information Section */}
                    <Card>
                        <h4 className="mb-6">Additional Information</h4>
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
                                        textArea
                                        rows={3}
                                        placeholder="Optional notes about the customer"
                                        autoComplete="off"
                                    />
                                )}
                            />
                        </FormItem>
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
                        {isEdit ? 'Update' : 'Create'} Customer
                    </Button>
                    <Button
                        variant="plain"
                        onClick={() => router.push('/admin/customers')}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                </div>
            </BottomStickyBar>
        </Form>
    )
}

export default CustomerForm
