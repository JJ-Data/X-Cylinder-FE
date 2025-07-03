'use client'

import { ReactNode } from 'react'
import Container from '@/components/shared/Container'
import Button from '@/components/ui/Button'
import { PiArrowLeftDuotone } from 'react-icons/pi'
import { useRouter } from 'next/navigation'

interface AnalyticsLayoutProps {
  title: string
  subtitle?: string
  actions?: ReactNode
  children: ReactNode
  backLink?: string
  backLabel?: string
}

export default function AnalyticsLayout({
  title,
  subtitle,
  actions,
  children,
  backLink = '/admin/analytics',
  backLabel = 'Back to Analytics'
}: AnalyticsLayoutProps) {
  const router = useRouter()

  return (
    <Container>
      <div className="mb-6">
        <Button
          size="sm"
          variant="plain"
          icon={<PiArrowLeftDuotone />}
          onClick={() => router.push(backLink)}
          className="mb-4"
        >
          {backLabel}
        </Button>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2">{actions}</div>
          )}
        </div>
      </div>
      
      {children}
    </Container>
  )
}