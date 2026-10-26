import type { useDashboardMetrics } from '@/hooks/useAnalytics'
import type { ActivityItem } from '@/components/analytics/ActivityFeed'

type DashboardMetrics = NonNullable<
    ReturnType<typeof useDashboardMetrics>['data']
>

/** Turns the dashboard's recent leases and refills into a newest-first activity list */
export function buildRecentActivities(
    recentActivity: DashboardMetrics['recentActivity'] | undefined,
): ActivityItem[] {
    const activities: ActivityItem[] = []

    if (recentActivity?.leases) {
        recentActivity.leases.forEach((lease) => {
            activities.push({
                id: `lease-${lease.id}`,
                type: 'lease',
                title: `New lease by ${lease.customerName}`,
                description: `${lease.cylinderCode} leased from ${lease.outletName}`,
                timestamp: lease.leaseDate,
                metadata: {
                    amount: lease.amount,
                    cylinderCode: lease.cylinderCode,
                    customerName: lease.customerName,
                    outletName: lease.outletName,
                },
            })
        })
    }

    if (recentActivity?.refills) {
        recentActivity.refills.forEach((refill) => {
            activities.push({
                id: `refill-${refill.id}`,
                type: 'refill',
                title: `Cylinder refilled by ${refill.operatorName}`,
                description: `${refill.cylinderCode} refilled with ${refill.volume} kg`,
                timestamp: refill.refillDate,
                metadata: {
                    volume: refill.volume,
                    amount: refill.cost,
                    cylinderCode: refill.cylinderCode,
                },
            })
        })
    }

    return activities.sort(
        (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )
}
