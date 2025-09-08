import { Metadata } from 'next'
import { Suspense } from 'react'
import SwapReceiptPage from '@/components/swaps/SwapReceiptPage'
import Loading from '@/components/shared/Loading'

export const metadata: Metadata = {
  title: 'Swap Receipt | CylinderX Staff',
  description: 'Print cylinder swap receipt',
}

interface Props {
  params: Promise<{
    id: string
  }>
}

export default async function Page({ params }: Props) {
  const { id } = await params
  return (
    <Suspense fallback={
      <div className="flex flex-auto flex-col h-full">
        <Loading loading={true} />
      </div>
    }>
      <SwapReceiptPage swapId={parseInt(id)} />
    </Suspense>
  )
}