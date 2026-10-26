'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import Container from '@/components/shared/Container'
import ActivityFeed from '@/components/analytics/ActivityFeed'
import { useDashboardMetrics } from '@/hooks/useAnalytics'
import { buildRecentActivities } from '@/utils/recentActivities'

export default function AdminActivityPage() {
    const { data: metrics, isLoading } = useDashboardMetrics()
    const activities = useMemo(
        () => buildRecentActivities(metrics?.recentActivity),
        [metrics?.recentActivity],
    )

    return (
        <Container>
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Recent Activity</h2>
                <Link
                    href="/admin/dashboard"
                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                    Back to Dashboard
                </Link>
            </div>
            <ActivityFeed
                title="All recent activity"
                activities={activities}
                loading={isLoading}
                maxItems={Math.max(activities.length, 1)}
            />
        </Container>
    )
}
