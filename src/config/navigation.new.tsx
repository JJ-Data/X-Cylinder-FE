import {
  TbHome,
  TbPackage,
  TbUsers,
  TbFileText,
  TbChartBar,
  TbSettings,
  TbBuildingStore,
  TbReportAnalytics,
  TbUserCheck,
  TbCylinder,
  TbQrcode,
  TbHistory,
  TbTruckDelivery,
  TbCash,
  TbAlertCircle,
  TbClipboardList,
  TbUpload,
} from 'react-icons/tb'
import { UserRole } from '@/stores/useAuthStore'

export interface NavigationItem {
  id: string
  label: string
  href: string
  icon?: React.ReactNode
  badge?: {
    value: string | number
    variant?: 'default' | 'success' | 'warning' | 'danger'
  }
  subItems?: NavigationItem[]
  permissions?: string[]
}

export interface NavigationSection {
  id: string
  label: string
  items: NavigationItem[]
}

// Customer Navigation
const customerNavigation: NavigationSection[] = [
  {
    id: 'main',
    label: 'Main',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        href: '/customer/dashboard',
        icon: <TbHome size={18} />,
      },
      {
        id: 'my-cylinders',
        label: 'My Cylinders',
        href: '/customer/cylinders',
        icon: <TbCylinder size={18} />,
      },
      {
        id: 'lease-new',
        label: 'Lease New Cylinder',
        href: '/customer/lease-new',
        icon: <TbPackage size={18} />,
      },
      {
        id: 'transactions',
        label: 'Transaction History',
        href: '/customer/transactions',
        icon: <TbHistory size={18} />,
      },
    ],
  },
  {
    id: 'account',
    label: 'Account',
    items: [
      {
        id: 'profile',
        label: 'My Profile',
        href: '/customer/profile',
        icon: <TbUserCheck size={18} />,
      },
      {
        id: 'settings',
        label: 'Settings',
        href: '/customer/settings',
        icon: <TbSettings size={18} />,
      },
    ],
  },
]

// Staff Navigation
const staffNavigation: NavigationSection[] = [
  {
    id: 'main',
    label: 'Main',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        href: '/staff/dashboard',
        icon: <TbHome size={18} />,
      },
      {
        id: 'cylinders',
        label: 'Cylinders',
        href: '/staff/cylinders',
        icon: <TbCylinder size={18} />,
        subItems: [
          {
            id: 'all-cylinders',
            label: 'All Cylinders',
            href: '/staff/cylinders',
          },
          {
            id: 'available',
            label: 'Available',
            href: '/staff/cylinders?status=available',
          },
          {
            id: 'leased',
            label: 'Leased',
            href: '/staff/cylinders?status=leased',
          },
        ],
      },
      {
        id: 'customers',
        label: 'Customers',
        href: '/staff/customers',
        icon: <TbUsers size={18} />,
      },
      {
        id: 'leasing',
        label: 'Leasing',
        href: '/staff/leasing',
        icon: <TbFileText size={18} />,
        subItems: [
          {
            id: 'new-lease',
            label: 'New Lease',
            href: '/staff/leasing/new',
          },
          {
            id: 'returns',
            label: 'Process Return',
            href: '/staff/leasing/returns',
          },
          {
            id: 'pending',
            label: 'Pending Requests',
            href: '/staff/leasing/pending',
          },
        ],
      },
      {
        id: 'transactions',
        label: 'Transactions',
        href: '/staff/transactions',
        icon: <TbCash size={18} />,
      },
    ],
  },
  {
    id: 'operations',
    label: 'Operations',
    items: [
      {
        id: 'inventory',
        label: 'Inventory',
        href: '/staff/inventory',
        icon: <TbClipboardList size={18} />,
      },
      {
        id: 'reports',
        label: 'Reports',
        href: '/staff/reports',
        icon: <TbChartBar size={18} />,
      },
    ],
  },
]

// Refill Operator Navigation
const operatorNavigation: NavigationSection[] = [
  {
    id: 'main',
    label: 'Main',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        href: '/operator/dashboard',
        icon: <TbHome size={18} />,
      },
      {
        id: 'refill-queue',
        label: 'Refill Queue',
        href: '/operator/refill-queue',
        icon: <TbClipboardList size={18} />,
        badge: {
          value: '5',
          variant: 'warning',
        },
      },
      {
        id: 'qr-scanner',
        label: 'QR Scanner',
        href: '/operator/qr-scanner',
        icon: <TbQrcode size={18} />,
      },
      {
        id: 'bulk-refill',
        label: 'Bulk Refill',
        href: '/operator/bulk-refill',
        icon: <TbUpload size={18} />,
      },
      {
        id: 'history',
        label: 'Refill History',
        href: '/operator/history',
        icon: <TbHistory size={18} />,
      },
    ],
  },
  {
    id: 'operations',
    label: 'Operations',
    items: [
      {
        id: 'cylinders',
        label: 'Cylinder Status',
        href: '/operator/cylinders',
        icon: <TbCylinder size={18} />,
      },
      {
        id: 'maintenance',
        label: 'Maintenance',
        href: '/operator/maintenance',
        icon: <TbAlertCircle size={18} />,
      },
      {
        id: 'performance',
        label: 'My Performance',
        href: '/operator/performance',
        icon: <TbChartBar size={18} />,
      },
    ],
  },
]

// Admin Navigation
const adminNavigation: NavigationSection[] = [
  {
    id: 'main',
    label: 'Main',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        href: '/admin/dashboard',
        icon: <TbHome size={18} />,
      },
      {
        id: 'analytics',
        label: 'Analytics',
        href: '/admin/analytics',
        icon: <TbReportAnalytics size={18} />,
        subItems: [
          {
            id: 'overview',
            label: 'Overview',
            href: '/admin/analytics',
          },
          {
            id: 'revenue',
            label: 'Revenue',
            href: '/admin/analytics/revenue',
          },
          {
            id: 'utilization',
            label: 'Cylinder Utilization',
            href: '/admin/analytics/utilization',
          },
          {
            id: 'performance',
            label: 'Outlet Performance',
            href: '/admin/analytics/performance',
          },
        ],
      },
    ],
  },
  {
    id: 'management',
    label: 'Management',
    items: [
      {
        id: 'outlets',
        label: 'Outlets',
        href: '/admin/outlets',
        icon: <TbBuildingStore size={18} />,
      },
      {
        id: 'users',
        label: 'Users',
        href: '/admin/users',
        icon: <TbUsers size={18} />,
        subItems: [
          {
            id: 'all-users',
            label: 'All Users',
            href: '/admin/users',
          },
          {
            id: 'staff',
            label: 'Staff',
            href: '/admin/users?role=staff',
          },
          {
            id: 'operators',
            label: 'Operators',
            href: '/admin/users?role=operator',
          },
          {
            id: 'customers',
            label: 'Customers',
            href: '/admin/users?role=customer',
          },
        ],
      },
      {
        id: 'cylinders',
        label: 'Cylinders',
        href: '/admin/cylinders',
        icon: <TbCylinder size={18} />,
      },
      {
        id: 'transfers',
        label: 'Transfers',
        href: '/admin/transfers',
        icon: <TbTruckDelivery size={18} />,
      },
    ],
  },
  {
    id: 'system',
    label: 'System',
    items: [
      {
        id: 'settings',
        label: 'Settings',
        href: '/admin/settings',
        icon: <TbSettings size={18} />,
      },
      {
        id: 'reports',
        label: 'Reports',
        href: '/admin/reports',
        icon: <TbFileText size={18} />,
      },
    ],
  },
]

// Navigation configuration by role
export const navigationConfig: Record<UserRole, NavigationSection[]> = {
  CUSTOMER: customerNavigation,
  STAFF: staffNavigation,
  REFILL_OP: operatorNavigation,
  ADMIN: adminNavigation,
}

// Get navigation for a specific role
export const getNavigationByRole = (role: UserRole): NavigationSection[] => {
  return navigationConfig[role] || []
}

// Get flattened navigation items for breadcrumb generation
export const getFlattenedNavigation = (role: UserRole): NavigationItem[] => {
  const sections = getNavigationByRole(role)
  const items: NavigationItem[] = []

  sections.forEach((section) => {
    section.items.forEach((item) => {
      items.push(item)
      if (item.subItems) {
        items.push(...item.subItems)
      }
    })
  })

  return items
}

// Find navigation item by href
export const findNavigationItem = (
  role: UserRole,
  href: string
): NavigationItem | undefined => {
  const items = getFlattenedNavigation(role)
  return items.find((item) => item.href === href)
}

// Generate breadcrumbs from pathname
export const generateBreadcrumbs = (role: UserRole, pathname: string) => {
  const segments = pathname.split('/').filter(Boolean)
  const breadcrumbs: { label: string; href: string }[] = []

  let currentPath = ''
  segments.forEach((segment) => {
    currentPath += `/${segment}`
    const item = findNavigationItem(role, currentPath)
    if (item) {
      breadcrumbs.push({
        label: item.label,
        href: item.href,
      })
    } else {
      // Handle dynamic segments
      breadcrumbs.push({
        label: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
        href: currentPath,
      })
    }
  })

  return breadcrumbs
}