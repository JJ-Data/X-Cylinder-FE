'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import { FormItem, Form } from '@/components/ui/Form'
import PasswordInput from '@/components/shared/PasswordInput'
import { userService } from '@/services/api/user.service'
import { toast } from 'react-hot-toast'
import { PiLockDuotone } from 'react-icons/pi'

interface ChangePasswordDialogProps {
  isOpen: boolean
  onClose: () => void
}

type ChangePasswordFormData = {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

const validationSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: "New password must be different from current password",
  path: ['newPassword'],
})

export default function ChangePasswordDialog({ isOpen, onClose }: ChangePasswordDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  })

  const onSubmit = async (data: ChangePasswordFormData) => {
    setIsSubmitting(true)
    try {
      await userService.changePassword(data.currentPassword, data.newPassword)
      toast.success('Password changed successfully')
      reset()
      onClose()
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to change password'
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      reset()
      onClose()
    }
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      width={400}
      closable={!isSubmitting}
    >
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary-50 rounded-lg">
            <PiLockDuotone className="text-2xl text-primary-600" />
          </div>
          <div>
            <h5 className="text-lg font-semibold">Change Password</h5>
            <p className="text-sm text-gray-600">Update your account password</p>
          </div>
        </div>

        <Form onSubmit={handleSubmit(onSubmit)}>
          <FormItem
            label="Current Password"
            invalid={Boolean(errors.currentPassword)}
            errorMessage={errors.currentPassword?.message}
            className={errors.currentPassword ? 'mb-8' : 'mb-4'}
          >
            <Controller
              name="currentPassword"
              control={control}
              render={({ field }) => (
                <PasswordInput
                  placeholder="Enter current password"
                  autoComplete="current-password"
                  disabled={isSubmitting}
                  {...field}
                />
              )}
            />
          </FormItem>

          <FormItem
            label="New Password"
            invalid={Boolean(errors.newPassword)}
            errorMessage={errors.newPassword?.message}
            className={errors.newPassword ? 'mb-8' : 'mb-4'}
          >
            <Controller
              name="newPassword"
              control={control}
              render={({ field }) => (
                <PasswordInput
                  placeholder="Enter new password"
                  autoComplete="new-password"
                  disabled={isSubmitting}
                  {...field}
                />
              )}
            />
          </FormItem>

          <FormItem
            label="Confirm New Password"
            invalid={Boolean(errors.confirmPassword)}
            errorMessage={errors.confirmPassword?.message}
            className={errors.confirmPassword ? 'mb-8' : 'mb-6'}
          >
            <Controller
              name="confirmPassword"
              control={control}
              render={({ field }) => (
                <PasswordInput
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                  disabled={isSubmitting}
                  {...field}
                />
              )}
            />
          </FormItem>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="plain"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="solid"
              loading={isSubmitting}
              className="flex-1"
            >
              Change Password
            </Button>
          </div>
        </Form>
      </div>
    </Dialog>
  )
}