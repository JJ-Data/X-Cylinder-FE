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
  PiCheckCircleDuotone,
  PiArrowLeftDuotone,
  PiHouseDuotone,
  PiCityDuotone,
  PiMapPinLineDuotone
} from 'react-icons/pi'
import { Form, FormItem } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Steps from '@/components/ui/Steps'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import BottomStickyBar from '@/components/template/BottomStickyBar'
import { useCustomerMutations } from '@/hooks/useUsers'
import useWindowSize from '@/components/ui/hooks/useWindowSize'
import { toast } from 'react-hot-toast'
import Alert from '@/components/ui/Alert'
import { handleBackendValidationErrors } from '@/utils/errorHandler'
import type {  } from '@/types/user'

const registrationSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits'),
  alternatePhone: z.string().optional(),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postalCode: z.string().optional()
})

// Payment schema removed - no longer required for registration

type RegistrationFormData = z.infer<typeof registrationSchema>
// Payment form data and methods removed - no longer required

export default function CustomerRegistrationWizard() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [registeredUser, setRegisteredUser] = useState<any>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [generalError, setGeneralError] = useState<string | null>(null)
  const { width } = useWindowSize()
  const isMobile = width ? width < 768 : false
  
  const { registerCustomer } = useCustomerMutations()

  // Registration form
  const registrationForm = useForm<RegistrationFormData>({
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      phoneNumber: '',
      alternatePhone: '',
      address: '',
      city: '',
      state: '',
      postalCode: ''
    },
    resolver: zodResolver(registrationSchema)
  })
  
  const { setError, clearErrors } = registrationForm

  // Payment form removed - no longer required

  const steps = [
    { label: 'Customer Information', icon: <PiUserDuotone /> },
    { label: 'Complete', icon: <PiCheckCircleDuotone /> },
  ]

  const handleRegistration = async (data: RegistrationFormData) => {
    try {
      // Clear any previous errors
      setGeneralError(null)
      clearErrors()
      
      // Clean all fields and convert empty strings to undefined for optional fields
      const cleanedData = {
        email: data.email.trim(),
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        phoneNumber: data.phoneNumber.trim(),
        address: data.address.trim(),
        city: data.city.trim(),
        state: data.state.trim(),
        // Optional fields - convert empty strings to undefined
        alternatePhone: data.alternatePhone?.trim() || undefined,
        postalCode: data.postalCode?.trim() || undefined
      }
      
      const result = await registerCustomer.trigger(cleanedData as any)
      setRegisteredUser(result)
      setShowSuccess(true)
      setCurrentStep(1) // Move to complete step
    } catch (error: any) {
      // Handle backend validation errors
      const errorMessage = handleBackendValidationErrors(error, setError)
      setGeneralError(errorMessage)
      
      // Also show toast for immediate feedback
      toast.error(errorMessage)
      
      // Scroll to top to show error alert
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Payment handler removed - customers are auto-activated on registration

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
              {registeredUser?.customer.firstName} {registeredUser?.customer.lastName} has been successfully registered and activated.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600 mb-6">
              <p className="mb-1">Email: <span className="font-medium text-gray-900">{registeredUser?.customer.email}</span></p>
              <p className="mb-1">Phone: <span className="font-medium text-gray-900">{registeredUser?.customer.phoneNumber || registrationForm.watch('phoneNumber')}</span></p>
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
                onClick={() => router.push(`/admin/leases/create?customerId=${registeredUser?.customer.id}`)}
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
      onSubmit={registrationForm.handleSubmit(handleRegistration)}
      onChange={() => {
        // Clear general error when user starts typing
        if (generalError) {
          setGeneralError(null)
        }
      }}
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
              {/* Error Alert */}
              {generalError && (
                <Alert type="danger" showIcon className="mb-4">
                  {generalError}
                </Alert>
              )}
              
              {/* Validation Errors Alert */}
              {Object.keys(registrationForm.formState.errors).length > 0 && !generalError && (
                <Alert type="warning" showIcon className="mb-4">
                  Please correct the errors in the form below
                </Alert>
              )}
              
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
                      label="First Name"
                      invalid={Boolean(registrationForm.formState.errors.firstName)}
                      errorMessage={registrationForm.formState.errors.firstName?.message}
                      asterisk
                    >
                      <Controller
                        name="firstName"
                        control={registrationForm.control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            placeholder="John"
                            prefix={<PiUserDuotone className="text-lg text-gray-400" />}
                          />
                        )}
                      />
                    </FormItem>

                    <FormItem
                      label="Last Name"
                      invalid={Boolean(registrationForm.formState.errors.lastName)}
                      errorMessage={registrationForm.formState.errors.lastName?.message}
                      asterisk
                    >
                      <Controller
                        name="lastName"
                        control={registrationForm.control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            placeholder="Doe"
                            prefix={<PiUserDuotone className="text-lg text-gray-400" />}
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

          {/* Step 2 removed - customers are auto-activated */}
        </div>
      </Container>

      <BottomStickyBar>
        <div className="flex items-center justify-between w-full">
          <Button
            type="button"
            variant="plain"
            onClick={() => router.push('/admin/users')}
          >
            Cancel
          </Button>
          
          <Button
            type="submit"
            variant="solid"
            icon={<PiCheckCircleDuotone />}
            loading={registerCustomer.isMutating}
            disabled={currentStep > 0} // Disable when showing success
          >
            {isMobile ? 'Register' : 'Register Customer'}
          </Button>
        </div>
      </BottomStickyBar>
    </Form>
  )
}