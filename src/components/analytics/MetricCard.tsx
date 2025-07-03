'use client'

import { ReactNode } from 'react'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Badge from '@/components/ui/Badge'
import Skeleton from '@/components/ui/Skeleton'
import { 
  PiTrendUpDuotone, 
  PiTrendDownDuotone,
  PiEqualsDuotone 
} from 'react-icons/pi'
import cn from '@/components/ui/utils/classNames'

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: ReactNode
  trend?: {
    value: number
    type: 'increase' | 'decrease' | 'neutral'
  }
  loading?: boolean
  className?: string
  iconBgColor?: string
  onClick?: () => void
}

export default function MetricCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  loading = false,
  className,
  iconBgColor = 'bg-blue-50',
  onClick
}: MetricCardProps) {
  const getTrendIcon = () => {
    if (!trend) return null
    
    switch (trend.type) {
      case 'increase':
        return <PiTrendUpDuotone className="text-green-600" />
      case 'decrease':
        return <PiTrendDownDuotone className="text-red-600" />
      case 'neutral':
        return <PiEqualsDuotone className="text-gray-600" />
    }
  }

  const getTrendColor = () => {
    if (!trend) return ''
    
    switch (trend.type) {
      case 'increase':
        return 'text-green-600'
      case 'decrease':
        return 'text-red-600'
      case 'neutral':
        return 'text-gray-600'
    }
  }

  return (
    <AdaptiveCard 
      className={cn(
        'hover:shadow-lg transition-shadow duration-200',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      <div className="p-4 md:p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs md:text-sm font-medium text-gray-600 mb-1">
              {title}
            </p>
            
            {loading ? (
              <>
                <Skeleton className="h-7 w-24 mb-2" />
                <Skeleton className="h-4 w-32" />
              </>
            ) : (
              <>
                <div className="flex items-baseline gap-2 mb-2">
                  <p className="text-xl md:text-2xl font-bold text-gray-900">
                    {value}
                  </p>
                  {trend && (
                    <div className={cn('flex items-center gap-1', getTrendColor())}>
                      {getTrendIcon()}
                      <span className="text-sm font-medium">
                        {Math.abs(trend.value)}%
                      </span>
                    </div>
                  )}
                </div>
                
                {subtitle && (
                  <p className="text-xs text-gray-500">{subtitle}</p>
                )}
              </>
            )}
          </div>
          
          {icon && (
            <div className={cn(
              'p-2 md:p-3 rounded-lg',
              iconBgColor
            )}>
              <div className="text-xl md:text-2xl">
                {icon}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdaptiveCard>
  )
}