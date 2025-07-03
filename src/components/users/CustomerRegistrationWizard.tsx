'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  PiUserDuotone, 
  PiEnvelopeDuotone, 
  PiPhoneDuotone, 
  PiMapPinDuotone,
  PiCurrencyCircleDollarDuotone,
  PiCheckCircleDuotone,
  PiArrowRightDuotone,
  PiArrowLeftDuotone,
  PiLockDuotone,
  PiHouseDuotone,
  PiCityDuotone,
  PiMapPinLineDuotone,
  PiCreditCardDuotone,
  PiBankDuotone,
  PiMoneyDuotone
} from 'react-icons/pi'
import { Form, FormItem } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Steps from '@/components/ui/Steps'
import Alert from '@/components/ui/Alert'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import BottomStickyBar from '@/components/template/BottomStickyBar'
import { useCustomerMutations } from '@/hooks/useUsers'
import useWindowSize from '@/components/ui/hooks/useWindowSize'
import { toast } from 'react-hot-toast'
import type {  } from '@/types/user'

const registrationSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits'),
  alternatePhone: z.string().optional(),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postalCode: z.string().optional()
})

const paymentSchema = z.object({
  paymentAmount: z.number().min(1, 'Payment amount is required'),
  paymentMethod: z.enum(['cash', 'bank_transfer', 'card']),
  paymentReference: z.string().optional()
})

type RegistrationFormData = z.infer<typeof registrationSchema>
type PaymentFormData = z.infer<typeof paymentSchema>

const paymentMethods = [
  { value: 'cash', label: 'Cash Payment', icon: PiMoneyDuotone },
  { value: 'bank_transfer', label: 'Bank Transfer', icon: PiBankDuotone },
  { value: 'card', label: 'Card Payment', icon: PiCreditCardDuotone },
]

export default function CustomerRegistrationWizard() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [registeredUser, setRegisteredUser] = useState<any>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const { width } = useWindowSize()
  const isMobile = width ? width < 768 : false
  
  const { registerCustomer, activateCustomer } = useCustomerMutations()

  // Registration form
  const registrationForm = useForm<RegistrationFormData>({
    defaultValues: {
      email: '',
      name: '',
      password: '',
      phoneNumber: '',
      alternatePhone: '',
      address: '',
      city: '',
      state: '',
      postalCode: ''
    },
    resolver: zodResolver(registrationSchema)
  })

  // Payment form
  const paymentForm = useForm<PaymentFormData>({
    defaultValues: {
      paymentAmount: 5000, // Default activation fee
      paymentMethod: 'cash',
      paymentReference: ''
    },
    resolver: zodResolver(paymentSchema)
  })

  const steps = [
    { label: 'Customer Information', icon: <PiUserDuotone /> },
    { label: 'Payment & Activation', icon: <PiCurrencyCircleDollarDuotone /> },
    { label: 'Complete', icon: <PiCheckCircleDuotone /> },
  ]

  const handleRegistration = async (data: RegistrationFormData) => {
    try {
      const result = await registerCustomer.trigger(data)
      setRegisteredUser(result)
      setCurrentStep(1)
    } catch (error: any) {
      toast.error(error.message || 'Registration failed')
    }
  }

  const handlePayment = async (data: PaymentFormData) => {
    if (!registeredUser) return

    try {
      await activateCustomer.trigger({
        userId: registeredUser.id,
        ...data
      })
      setShowSuccess(true)
      setCurrentStep(2)
    } catch (error: any) {
      toast.error(error.message || 'Activation failed')
    }
  }

  const handleStepChange = (step: number) => {
    if (step < currentStep) {
      setCurrentStep(step)
    }
  }

  if (showSuccess) {
    return (
      <Container>
        <AdaptiveCard className="max-w-2xl mx-auto mt-8 md:mt-20 text-center">
          <div className="p-6 md:p-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-green-100 rounded-full flex items-center justify-center">
                <PiCheckCircleDuotone className="h-10 w-10 md:h-12 md:w-12 text-green-600" />
              </div>
            </div>
            <h3 className="text-xl md:text-2xl font-semibold mb-2">Customer Registered!</h3>
            <p className="text-gray-600 mb-6">
              {registeredUser?.name} has been successfully registered and activated.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600 mb-6">
              <p className="mb-1">Email: <span className="font-medium text-gray-900">{registeredUser?.email}</span></p>
              <p className="mb-1">Phone: <span className="font-medium text-gray-900">{registrationForm.watch('phoneNumber')}</span></p>
              <p>Status: <span className="font-medium text-green-600">Active</span></p>
            </div>
            <div className="flex flex-col md:flex-row justify-center gap-3">
              <Button
                variant="plain"
                onClick={() => router.push('/admin/users')}
                className="w-full md:w-auto"
              >
                View All Users
              </Button>
              <Button
                variant="solid"
                onClick={() => router.push(`/admin/leases/create?customerId=${registeredUser?.id}`)}
                className="w-full md:w-auto"
              >
                Initiate Cylinder Lease
              </Button>
            </div>
          </div>
        </AdaptiveCard>
      </Container>
    )
  }

  return (
    <Form
      className="flex w-full h-full"
      containerClassName="flex flex-col w-full justify-between"
      onSubmit={
        currentStep === 0 
          ? registrationForm.handleSubmit(handleRegistration)
          : paymentForm.handleSubmit(handlePayment)
      }
    >
      <Container>
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <Button
            size="sm"
            variant="plain"
            icon={<PiArrowLeftDuotone />}
            onClick={() => router.push('/admin/users')}
          >
            {isMobile ? 'Back' : 'Back to Users'}
          </Button>
          
          <h3 className="text-xl md:text-2xl font-bold mb-1 mt-4">Register New Customer</h3>
          <p className="text-sm text-gray-500 mb-4">Create and activate a new customer account</p>
          
          {/* Steps */}
          <Steps current={currentStep}>
            {steps.map((step, index) => (
              <Steps.Item 
                key={index} 
                title={step.label}
              />
            ))}
          </Steps>
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {/* Step 1: Customer Information */}
          {currentStep === 0 && (
            <div className="space-y-6">
              {/* Basic Information */}
              <AdaptiveCard>
                <div className="p-4 md:p-6">
                  <h5 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <PiUserDuotone className="text-xl" />
                    Basic Information
                  </h5>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormItem
                      label="Email"
                      invalid={Boolean(registrationForm.formState.errors.email)}
                      errorMessage={registrationForm.formState.errors.email?.message}
                      asterisk
                    >
                      <Controller
                        name="email"
                        control={registrationForm.control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="email"
                            placeholder="customer@example.com"
                            prefix={<PiEnvelopeDuotone className="text-lg text-gray-400" />}
                          />
                        )}
                      />
                    </FormItem>

                    <FormItem
                      label="Full Name"
                      invalid={Boolean(registrationForm.formState.errors.name)}
                      errorMessage={registrationForm.formState.errors.name?.message}
                      asterisk
                    >
                      <Controller
                        name="name"
                        control={registrationForm.control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            placeholder="John Doe"
                            prefix={<PiUserDuotone className="text-lg text-gray-400" />}
                          />
                        )}
                      />
                    </FormItem>

                    <FormItem
                      label="Password"
                      invalid={Boolean(registrationForm.formState.errors.password)}
                      errorMessage={registrationForm.formState.errors.password?.message}
                      asterisk
                    >
                      <Controller
                        name="password"
                        control={registrationForm.control}
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
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormItem
                      label="Phone Number"
                      invalid={Boolean(registrationForm.formState.errors.phoneNumber)}
                      errorMessage={registrationForm.formState.errors.phoneNumber?.message}
                      asterisk
                    >
                      <Controller
                        name="phoneNumber"
                        control={registrationForm.control}
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
                      invalid={Boolean(registrationForm.formState.errors.alternatePhone)}
                      errorMessage={registrationForm.formState.errors.alternatePhone?.message}
                    >
                      <Controller
                        name="alternatePhone"
                        control={registrationForm.control}
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
              <AdaptiveCard>
                <div className="p-4 md:p-6">
                  <h5 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <PiMapPinDuotone className="text-xl" />
                    Address Information
                  </h5>
                  
                  <div className="space-y-4">
                    <FormItem
                      label="Street Address"
                      invalid={Boolean(registrationForm.formState.errors.address)}
                      errorMessage={registrationForm.formState.errors.address?.message}
                      asterisk
                    >
                      <Controller
                        name="address"
                        control={registrationForm.control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            placeholder="123 Main Street"
                            prefix={<PiHouseDuotone className="text-lg text-gray-400" />}
                          />
                        )}
                      />
                    </FormItem>

                    <div className="grid md:grid-cols-3 gap-4">
                      <FormItem
                        label="City"
                        invalid={Boolean(registrationForm.formState.errors.city)}
                        errorMessage={registrationForm.formState.errors.city?.message}
                        asterisk
                      >
                        <Controller
                          name="city"
                          control={registrationForm.control}
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
                        invalid={Boolean(registrationForm.formState.errors.state)}
                        errorMessage={registrationForm.formState.errors.state?.message}
                        asterisk
                      >
                        <Controller
                          name="state"
                          control={registrationForm.control}
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
                        invalid={Boolean(registrationForm.formState.errors.postalCode)}
                        errorMessage={registrationForm.formState.errors.postalCode?.message}
                      >
                        <Controller
                          name="postalCode"
                          control={registrationForm.control}
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
            </div>
          )}

          {/* Step 2: Payment & Activation */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <Alert type="info" showIcon>
                Customer account created successfully. Process payment to activate the account.
              </Alert>

              {/* Payment Details */}
              <AdaptiveCard>
                <div className="p-4 md:p-6">
                  <h5 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <PiCurrencyCircleDollarDuotone className="text-xl" />
                    Payment Information
                  </h5>
                  
                  <div className="space-y-4">
                    <FormItem
                      label="Payment Amount"
                      invalid={Boolean(paymentForm.formState.errors.paymentAmount)}
                      errorMessage={paymentForm.formState.errors.paymentAmount?.message}
                      asterisk
                    >
                      <Controller
                        name="paymentAmount"
                        control={paymentForm.control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="number"
                            placeholder="5000"
                            prefix="₦"
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        )}
                      />
                    </FormItem>

                    <FormItem
                      label="Payment Method"
                      invalid={Boolean(paymentForm.formState.errors.paymentMethod)}
                      errorMessage={paymentForm.formState.errors.paymentMethod?.message}
                      asterisk
                    >
                      <Controller
                        name="paymentMethod"
                        control={paymentForm.control}
                        render={({ field }) => (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {paymentMethods.map((method) => {
                              const Icon = method.icon
                              return (
                                <Card
                                  key={method.value}
                                  className={`p-4 cursor-pointer transition-all ${
                                    field.value === method.value
                                      ? 'border-blue-500 bg-blue-50'
                                      : 'hover:border-gray-300'
                                  }`}
                                  onClick={() => field.onChange(method.value)}
                                >
                                  <div className="text-center">
                                    <Icon className="text-3xl mx-auto mb-2 text-gray-600" />
                                    <p className="font-medium text-sm md:text-base">{method.label}</p>
                                  </div>
                                </Card>
                              )
                            })}
                          </div>
                        )}
                      />
                    </FormItem>

                    {paymentForm.watch('paymentMethod') !== 'cash' && (
                      <FormItem
                        label="Payment Reference"
                        invalid={Boolean(paymentForm.formState.errors.paymentReference)}
                        errorMessage={paymentForm.formState.errors.paymentReference?.message}
                      >
                        <Controller
                          name="paymentReference"
                          control={paymentForm.control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              placeholder="Transaction reference or receipt number"
                            />
                          )}
                        />
                      </FormItem>
                    )}
                  </div>
                </div>
              </AdaptiveCard>

              {/* Customer Summary */}
              <AdaptiveCard className="bg-gray-50">
                <div className="p-4 md:p-6">
                  <h5 className="text-lg font-semibold mb-4">Customer Summary</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{registeredUser?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{registeredUser?.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-medium">{registrationForm.getValues('phoneNumber')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Address:</span>
                      <span className="font-medium">
                        {registrationForm.getValues('city')}, {registrationForm.getValues('state')}
                      </span>
                    </div>
                  </div>
                </div>
              </AdaptiveCard>
            </div>
          )}
        </div>
      </Container>

      <BottomStickyBar>
        <div className="flex items-center justify-between w-full">
          <Button
            type="button"
            variant="plain"
            onClick={() => currentStep > 0 ? setCurrentStep(currentStep - 1) : router.push('/admin/users')}
          >
            {currentStep === 0 ? 'Cancel' : 'Previous'}
          </Button>
          
          <Button
            type="submit"
            variant="solid"
            icon={<PiArrowRightDuotone />}
            loading={
              currentStep === 0 
                ? registerCustomer.isMutating 
                : activateCustomer.isMutating
            }
          >
            {currentStep === 0 ? 'Next' : (isMobile ? 'Activate' : 'Activate Customer')}
          </Button>
        </div>
      </BottomStickyBar>
    </Form>
  )
}