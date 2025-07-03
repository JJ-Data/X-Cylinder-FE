import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { HiChevronRight } from 'react-icons/hi'
import { useNavigationStore } from '@/stores/useNavigationStore'
import { useAuthStore, UserRole } from '@/stores/useAuthStore'
import useCurrentSession from '@/utils/hooks/useCurrentSession'
import { generateBreadcrumbs } from '@/config/navigation.new'
// import { generateBreadcrumbs } from '@/config/navigation'o
// import { UserRole } from '@/types/auth'

interface BreadcrumbProps {
    className?: string
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ className = '' }) => {
    const pathname = usePathname()
    const { session } = useCurrentSession()
    const { activeRole } = useAuthStore()
    const { updateBreadcrumbs } = useNavigationStore()
    const breadcrumbs = useNavigationStore((state) => state.breadcrumbs)

    React.useEffect(() => {
        const user =
            session?.user && 'role' in session.user ? session.user : null
        const role = activeRole || user?.role
        if (role) {
            const generatedBreadcrumbs = generateBreadcrumbs(
                role as UserRole,
                pathname,
            )
            updateBreadcrumbs(generatedBreadcrumbs)
        }
    }, [pathname, activeRole, session?.user, updateBreadcrumbs])

    if (breadcrumbs.length === 0) {
        return null
    }

    return (
        <nav
            aria-label="Breadcrumb"
            className={`flex items-center ${className}`}
        >
            <ol className="flex items-center space-x-2">
                <li>
                    <Link
                        href="/"
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        Home
                    </Link>
                </li>
                {breadcrumbs.map((crumb, index) => (
                    <React.Fragment key={crumb.href || index}>
                        <li className="flex items-center">
                            <HiChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-600" />
                        </li>
                        <li>
                            {index === breadcrumbs.length - 1 || !crumb.href ? (
                                <span className="text-gray-900 font-medium dark:text-gray-100">
                                    {crumb.label}
                                </span>
                            ) : (
                                <Link
                                    href={crumb.href}
                                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                >
                                    {crumb.label}
                                </Link>
                            )}
                        </li>
                    </React.Fragment>
                ))}
            </ol>
        </nav>
    )
}
