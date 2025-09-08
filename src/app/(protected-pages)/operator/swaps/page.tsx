import { Metadata } from 'next'
import { Suspense } from 'react'
import SwapsPage from '@/components/swaps/SwapsPage'
import Loading from '@/components/shared/Loading'

export const metadata: Metadata = {
  title: 'Cylinder Swaps | CylinderX Operator',
  description: 'Manage cylinder swaps and replacement operations for your outlet',
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="flex flex-auto flex-col h-full">
        <Loading loading={true} />
      </div>
    }>
      <SwapsPage />
    </Suspense>
  )
}