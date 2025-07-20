import { Metadata } from 'next'
import { Suspense } from 'react'
import { SwapForm } from '@/components/swaps/SwapForm'
import Loading from '@/components/shared/Loading'
import Card from '@/components/ui/Card'

export const metadata: Metadata = {
  title: 'New Cylinder Swap | CylinderX Admin',
  description: 'Process a new cylinder swap for customer',
}

export default function NewSwapPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">New Cylinder Swap</h1>
        <p className="text-gray-600">
          Process a cylinder swap for a customer with an active lease
        </p>
      </div>
      
      <Suspense fallback={
        <div className="flex flex-auto flex-col h-full">
          <Loading loading={true} />
        </div>
      }>
        <SwapForm />
      </Suspense>
    </div>
  )
}