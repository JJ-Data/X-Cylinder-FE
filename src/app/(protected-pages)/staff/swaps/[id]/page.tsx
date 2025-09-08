import { Metadata } from 'next'
import { Suspense } from 'react'
import SwapDetailsPage from '@/components/swaps/SwapDetailsPage'
import Loading from '@/components/shared/Loading'

export const metadata: Metadata = {
  title: 'Swap Details | CylinderX Staff',
  description: 'View cylinder swap details and receipt',
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
      <SwapDetailsPage swapId={parseInt(id)} />
    </Suspense>
  )
}