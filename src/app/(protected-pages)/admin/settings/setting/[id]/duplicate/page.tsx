'use client'

import { useRouter, useParams } from 'next/navigation'
import { PiArrowLeftDuotone, PiWarningDuotone } from 'react-icons/pi'
import useSWR from 'swr'
import { settingsService } from '@/services/api/settings.service'
import SettingsForm from '@/components/settings/SettingsForm'
import Container from '@/components/shared/Container'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Skeleton from '@/components/ui/Skeleton'
import type { BusinessSetting } from '@/types/settings'

export default function DuplicateSettingPage() {
  const router = useRouter()
  const params = useParams()
  
  const settingId = parseInt(params.id as string)
  
  // Fetch setting data
  const { data: settingResponse, error, isLoading } = useSWR(
    settingId ? `settings/${settingId}` : null,
    () => settingsService.getSettingById(Number(settingId)),
    {
      revalidateOnFocus: false,
    }
  )
  
  const setting = settingResponse?.data || null
  
  const handleSuccess = (newSetting: BusinessSetting) => {
    router.push(`/admin/settings/category/${newSetting.category?.name?.toLowerCase() || 'general'}`)
  }
  
  const handleCancel = () => {
    router.back()
  }
  
  if (error) {
    return (
      <Container>
        <Card className="p-8 text-center">
          <PiWarningDuotone className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Setting</h3>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </Card>
      </Container>
    )
  }
  
  if (isLoading) {
    return (
      <Container>
        <div className="mb-6">
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="space-y-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-6 w-48 mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </Card>
          ))}
        </div>
      </Container>
    )
  }
  
  if (!setting) {
    return (
      <Container>
        <Card className="p-8 text-center">
          <PiWarningDuotone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Setting Not Found</h3>
          <p className="text-gray-600 mb-4">The requested setting could not be found.</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </Card>
      </Container>
    )
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
        setting={setting}
        mode="duplicate"
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </Container>
  )
}