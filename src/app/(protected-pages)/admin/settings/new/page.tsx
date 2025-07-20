'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { PiArrowLeftDuotone } from 'react-icons/pi'
import SettingsForm from '@/components/settings/SettingsForm'
import Container from '@/components/shared/Container'
import Button from '@/components/ui/Button'
import type { BusinessSetting } from '@/types/settings'

export default function NewSettingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const categoryId = searchParams.get('category') ? parseInt(searchParams.get('category')!) : undefined
  
  const handleSuccess = (setting: BusinessSetting) => {
    router.push(`/admin/settings/category/${setting.category?.name?.toLowerCase() || 'general'}`)
  }
  
  const handleCancel = () => {
    router.back()
  }
  
  return (
    <Container>
      {/* Navigation */}
      <div className="mb-6">
        <Button
          variant="plain"
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <PiArrowLeftDuotone className="h-4 w-4 mr-2" />
          Back to Settings
        </Button>
      </div>
      
      {/* Form */}
      <SettingsForm
        mode="create"
        categoryId={categoryId}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </Container>
  )
}