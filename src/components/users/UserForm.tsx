'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  PiEnvelopeDuotone, 
  PiUserDuotone, 
  PiPhoneDuotone, 
  PiLockDuotone,
  PiHouseDuotone,
  PiCityDuotone,
  PiMapPinLineDuotone,
  PiIdentificationBadgeDuotone,
  PiAddressBookDuotone
} from 'react-icons/pi'
import { Form, FormItem } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import { UserRole, type User, type CreateUserDto, type UpdateUserDto } from '@/types/user'
import { useOutlets } from '@/hooks/useOutlets'
import { useSession } from 'next-auth/react'
import { hasPermission } from '@/types/user'
import useWindowSize from '@/components/ui/hooks/useWindowSize'

const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.nativeEnum(UserRole),
  outletId: z.number().optional(),
  phoneNumber: z.string().optional(),
  alternatePhone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
})

const updateUserSchema = createUserSchema.omit({ password: true, email: true })

type CreateUserFormData = z.infer<typeof createUserSchema>
type UpdateUserFormData = z.infer<typeof updateUserSchema>

interface UserFormProps {
  user?: User
  onSubmit: (data: CreateUserDto | UpdateUserDto) => Promise<void>
  isSubmitting?: boolean
}

export default function UserForm({ user, onSubmit, isSubmitting }: UserFormProps) {
  const { data: session } = useSession()
  const { data: outlets, isLoading: loadingOutlets } = useOutlets()
  const { width } = useWindowSize()
  const _isMobile = width ? width < 768 : false
  const isEditing = !!user

  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
  } = useForm<any>({
    defaultValues: isEditing ? {
      name: `${user.firstName} ${user.lastName}`,
      role: user.role,
      outletId: user.outletId,
      phoneNumber: user.phoneNumber || '',
      alternatePhone: user.alternatePhone || '',
      address: user.address || '',
      city: user.city || '',
      state: user.state || '',
      postalCode: user.postalCode || '',
    } : {
      email: '',
      name: '',
      password: '',
      role: UserRole.CUSTOMER,
      phoneNumber: '',
      alternatePhone: '',
      address: '',
      city: '',
      state: '',
      postalCode: '',
    },
    resolver: zodResolver(isEditing ? updateUserSchema : createUserSchema) as any,
  })

  const watchedRole = watch('role')
  const showOutletField = watchedRole === UserRole.STAFF || watchedRole === UserRole.REFILL_OPERATOR
  const showAddressFields = watchedRole === UserRole.CUSTOMER || watchedRole === UserRole.REFILL_OPERATOR

  const roleOptions = [
    { value: UserRole.ADMIN, label: 'Admin', disabled: !hasPermission(session?.user?.role as UserRole, 'users', 'create') },
    { value: UserRole.STAFF, label: 'Staff' },
    { value: UserRole.REFILL_OPERATOR, label: 'Refill Operator' },
    { value: UserRole.CUSTOMER, label: 'Customer' },
  ]

  const outletOptions = outlets?.outlets?.map(outlet => ({
    value: outlet.id,
    label: outlet.name,
  })) || []

  const handleFormSubmit = async (data: CreateUserFormData | UpdateUserFormData) => {
    await onSubmit(data)
  }

  return (
    <Form onSubmit={handleSubmit(handleFormSubmit)}>
      <div className="space-y-6">
        {/* Basic Information */}
        <AdaptiveCard>
          <div className="p-4 md:p-6">
            <h5 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <PiUserDuotone className="text-xl" />
              Basic Information
            </h5>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {!isEditing && (
                <FormItem
                  label="Email"
                  invalid={Boolean(errors.email)}
                  errorMessage={errors.email?.message?.toString()}
                  asterisk
                >
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="email"
                        placeholder="user@example.com"
                        prefix={<PiEnvelopeDuotone className="text-lg text-gray-400" />}
                      />
                    )}
                  />
                </FormItem>
              )}

              <FormItem
                label="Full Name"
                invalid={Boolean(errors.name)}
                errorMessage={errors.name?.message?.toString()}
                asterisk
              >
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="John Doe"
                      prefix={<PiIdentificationBadgeDuotone className="text-lg text-gray-400" />}
                    />
                  )}
                />
              </FormItem>

              {!isEditing && (
                <FormItem
                  label="Password"
                  invalid={Boolean(errors.password)}
                  errorMessage={errors.password?.message?.toString()}
                  asterisk
                >
                  <Controller
                    name="password"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="password"
                        placeholder="••••••••"
                        prefix={<PiLockDuotone className="text-lg text-gray-400" />}
                      />
                    )}
                  />
                </FormItem>
              )}

              <FormItem
                label="Role"
                invalid={Boolean(errors.role)}
                errorMessage={errors.role?.message?.toString()}
                asterisk
              >
                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={roleOptions}
                      value={roleOptions.find(opt => opt.value === field.value)}
                      onChange={(option) => field.onChange(option?.value)}
                      placeholder="Select role"
                    />
                  )}
                />
              </FormItem>

              {showOutletField && (
                <FormItem
                  label="Assigned Outlet"
                  invalid={Boolean(errors.outletId)}
                  errorMessage={errors.outletId?.message?.toString()}
                  asterisk
                >
                  <Controller
                    name="outletId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        options={outletOptions}
                        value={outletOptions.find(opt => opt.value === field.value)}
                        onChange={(option) => field.onChange(option?.value || undefined)}
                        placeholder="Select outlet"
                        isLoading={loadingOutlets}
                      />
                    )}
                  />
                </FormItem>
              )}
            </div>
          </div>
        </AdaptiveCard>

        {/* Contact Information */}
        <AdaptiveCard>
          <div className="p-4 md:p-6">
            <h5 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <PiPhoneDuotone className="text-xl" />
              Contact Information
            </h5>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormItem
                label="Phone Number"
                invalid={Boolean(errors.phoneNumber)}
                errorMessage={errors.phoneNumber?.message?.toString()}
              >
                <Controller
                  name="phoneNumber"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="+234 xxx xxx xxxx"
                      prefix={<PiPhoneDuotone className="text-lg text-gray-400" />}
                    />
                  )}
                />
              </FormItem>

              <FormItem
                label="Alternate Phone"
                invalid={Boolean(errors.alternatePhone)}
                errorMessage={errors.alternatePhone?.message?.toString()}
              >
                <Controller
                  name="alternatePhone"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="+234 xxx xxx xxxx"
                      prefix={<PiPhoneDuotone className="text-lg text-gray-400" />}
                    />
                  )}
                />
              </FormItem>
            </div>
          </div>
        </AdaptiveCard>

        {/* Address Information */}
        {showAddressFields && (
          <AdaptiveCard>
            <div className="p-4 md:p-6">
              <h5 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <PiAddressBookDuotone className="text-xl" />
                Address Information
              </h5>
              
              <div className="space-y-4">
                <FormItem
                  label="Street Address"
                  invalid={Boolean(errors.address)}
                  errorMessage={errors.address?.message?.toString()}
                >
                  <Controller
                    name="address"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="123 Main Street"
                        prefix={<PiHouseDuotone className="text-lg text-gray-400" />}
                      />
                    )}
                  />
                </FormItem>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormItem
                    label="City"
                    invalid={Boolean(errors.city)}
                    errorMessage={errors.city?.message?.toString()}
                  >
                    <Controller
                      name="city"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="Lagos"
                          prefix={<PiCityDuotone className="text-lg text-gray-400" />}
                        />
                      )}
                    />
                  </FormItem>

                  <FormItem
                    label="State"
                    invalid={Boolean(errors.state)}
                    errorMessage={errors.state?.message?.toString()}
                  >
                    <Controller
                      name="state"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="Lagos"
                          prefix={<PiCityDuotone className="text-lg text-gray-400" />}
                        />
                      )}
                    />
                  </FormItem>

                  <FormItem
                    label="Postal Code"
                    invalid={Boolean(errors.postalCode)}
                    errorMessage={errors.postalCode?.message?.toString()}
                  >
                    <Controller
                      name="postalCode"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="100001"
                          prefix={<PiMapPinLineDuotone className="text-lg text-gray-400" />}
                        />
                      )}
                    />
                  </FormItem>
                </div>
              </div>
            </div>
          </AdaptiveCard>
        )}

        {/* Form Actions */}
        <div className="flex flex-col md:flex-row justify-end gap-3">
          <Button 
            type="button" 
            variant="plain" 
            onClick={() => window.history.back()}
            className="w-full md:w-auto"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="solid" 
            loading={isSubmitting}
            className="w-full md:w-auto"
          >
            {isEditing ? 'Update User' : 'Create User'}
          </Button>
        </div>
      </div>
    </Form>
  )
}