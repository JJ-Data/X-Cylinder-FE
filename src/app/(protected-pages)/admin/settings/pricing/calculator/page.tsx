'use client'

import { useRouter } from 'next/navigation'
import { PiArrowLeftDuotone, PiCalculatorDuotone } from 'react-icons/pi'
import PricingCalculator from '@/components/settings/PricingCalculator'
import Container from '@/components/shared/Container'
import Button from '@/components/ui/Button'
import type { PricingResult } from '@/types/settings'

export default function PricingCalculatorPage() {
  const router = useRouter()
  
  const handleCalculationComplete = (result: PricingResult) => {
    console.log('Calculation completed:', result)
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
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-lg bg-blue-100">
            <PiCalculatorDuotone className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pricing Calculator</h1>
            <p className="text-gray-600 mt-1">
              Test and calculate prices in real-time using current business settings
            </p>
          </div>
        </div>
      </div>
      
      {/* Calculator */}
      <PricingCalculator onCalculationComplete={handleCalculationComplete} />
    </Container>
  )
}