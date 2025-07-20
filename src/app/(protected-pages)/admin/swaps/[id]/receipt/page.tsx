import { Metadata } from 'next'
import { Suspense } from 'react'
import SwapReceiptPage from '@/components/swaps/SwapReceiptPage'
import Loading from '@/components/shared/Loading'

export const metadata: Metadata = {
  title: 'Swap Receipt | CylinderX Admin',
  description: 'Print cylinder swap receipt',
}

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ReceiptPage({ params }: PageProps) {
  const { id } = await params
  const swapId = parseInt(id)
  
  if (isNaN(swapId)) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Invalid Swap ID</h1>
          <p className="text-gray-600">The swap ID provided is not valid.</p>
        </div>
      </div>
    )
  }
  
  return (
    <Suspense fallback={
      <div className="flex flex-auto flex-col h-full">
        <Loading loading={true} />
      </div>
    }>
      <SwapReceiptPage swapId={swapId} />
    </Suspense>
  )
}