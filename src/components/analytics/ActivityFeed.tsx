'use client'

import { ReactNode } from 'react'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Badge from '@/components/ui/Badge'
import Skeleton from '@/components/ui/Skeleton'
import Timeline from '@/components/ui/Timeline'
import { format } from 'date-fns'
import { 
  PiPackageDuotone,
  PiGasPumpDuotone,
  PiArrowsLeftRightDuotone,
  PiUserDuotone,
  PiCurrencyCircleDollarDuotone
} from 'react-icons/pi'

export interface ActivityItem {
  id: string | number
  type: 'lease' | 'refill' | 'transfer' | 'customer' | 'payment'
  title: string
  description: string
  timestamp: string
  metadata?: {
    amount?: number
    volume?: number
    cylinderCode?: string
    customerName?: string
    outletName?: string
  }
}

interface ActivityFeedProps {
  title?: string
  activities: ActivityItem[]
  loading?: boolean
  maxItems?: number
  onViewAll?: () => void
}

const activityIcons: Record<ActivityItem['type'], ReactNode> = {
  lease: <PiPackageDuotone className="text-blue-600" />,
  refill: <PiGasPumpDuotone className="text-green-600" />,
  transfer: <PiArrowsLeftRightDuotone className="text-purple-600" />,
  customer: <PiUserDuotone className="text-orange-600" />,
  payment: <PiCurrencyCircleDollarDuotone className="text-emerald-600" />
}

const activityColors: Record<ActivityItem['type'], string> = {
  lease: 'bg-blue-50',
  refill: 'bg-green-50',
  transfer: 'bg-purple-50',
  customer: 'bg-orange-50',
  payment: 'bg-emerald-50'
}

export default function ActivityFeed({
  title = 'Recent Activity',
  activities,
  loading = false,
  maxItems = 10,
  onViewAll
}: ActivityFeedProps) {
  const displayedActivities = activities.slice(0, maxItems)

  return (
    <AdaptiveCard>
      <div className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {onViewAll && activities.length > maxItems && (
            <button
              onClick={onViewAll}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View All ({activities.length})
            </button>
          )}
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No recent activity</p>
          </div>
        ) : (
          <Timeline>
            {displayedActivities.map((activity) => (
              <Timeline.Item key={activity.id}>
                <div className="flex gap-3">
                  <div className={`p-2 rounded-full ${activityColors[activity.type]}`}>
                    {activityIcons[activity.type]}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {activity.title}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {activity.description}
                        </p>
                        
                        {activity.metadata && (
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            {activity.metadata.amount && (
                              <Badge 
                                content={`₦${activity.metadata.amount.toLocaleString()}`}
                                innerClass="bg-green-100 text-green-700"
                              />
                            )}
                            {activity.metadata.volume && (
                              <Badge 
                                content={`${activity.metadata.volume} kg`}
                                innerClass="bg-blue-100 text-blue-700"
                              />
                            )}
                            {activity.metadata.cylinderCode && (
                              <Badge 
                                content={activity.metadata.cylinderCode}
                                innerClass="bg-gray-100 text-gray-700"
                              />
                            )}
                          </div>
                        )}
                      </div>
                      
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {format(new Date(activity.timestamp), 'h:mm a')}
                      </span>
                    </div>
                  </div>
                </div>
              </Timeline.Item>
            ))}
          </Timeline>
        )}
      </div>
    </AdaptiveCard>
  )
}