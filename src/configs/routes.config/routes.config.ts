import authRoute from './authRoute'
import type { Routes } from '@/@types/routes'

export const protectedRoutes: Routes = {
    // Admin routes
    '/admin/dashboard': {
        key: 'admin.dashboard',
        authority: ['ADMIN'],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    '/admin/cylinders': {
        key: 'admin.cylinders',
        authority: ['ADMIN'],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    '/admin/cylinders/new': {
        key: 'admin.cylinders.new',
        authority: ['ADMIN'],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    '/admin/outlets': {
        key: 'admin.outlets',
        authority: ['ADMIN'],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    '/admin/outlets/new': {
        key: 'admin.outlets.new',
        authority: ['ADMIN'],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    '/admin/outlets/[id]': {
        key: 'admin.outlets.detail',
        authority: ['ADMIN'],
        dynamicRoute: true,
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    '/admin/outlets/[id]/edit': {
        key: 'admin.outlets.edit',
        authority: ['ADMIN'],
        dynamicRoute: true,
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    // Admin Analytics routes
    '/admin/analytics': {
        key: 'admin.analytics.overview',
        authority: ['ADMIN'],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    '/admin/analytics/revenue': {
        key: 'admin.analytics.revenue',
        authority: ['ADMIN'],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    '/admin/analytics/outlets': {
        key: 'admin.analytics.outlets',
        authority: ['ADMIN'],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    '/admin/analytics/cylinders': {
        key: 'admin.analytics.cylinders',
        authority: ['ADMIN'],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    '/admin/analytics/customers': {
        key: 'admin.analytics.customers',
        authority: ['ADMIN'],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    '/admin/analytics/operators': {
        key: 'admin.analytics.operators',
        authority: ['ADMIN'],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    // Admin User Management routes
    '/admin/users': {
        key: 'admin.users',
        authority: ['ADMIN'],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    '/admin/users/create': {
        key: 'admin.users.create',
        authority: ['ADMIN'],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    '/admin/users/[id]': {
        key: 'admin.users.detail',
        authority: ['ADMIN'],
        dynamicRoute: true,
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    '/admin/users/[id]/edit': {
        key: 'admin.users.edit',
        authority: ['ADMIN'],
        dynamicRoute: true,
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    // Admin Customer Management routes
    '/admin/customers/register': {
        key: 'admin.registerCustomer',
        authority: ['ADMIN'],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    '/admin/customers/new': {
        key: 'admin.customers.new',
        authority: ['ADMIN'],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    '/admin/customers/[id]/edit': {
        key: 'admin.customers.edit',
        authority: ['ADMIN'],
        dynamicRoute: true,
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    // Admin Cylinder routes
    '/admin/cylinders/[id]': {
        key: 'admin.cylinders.detail',
        authority: ['ADMIN'],
        dynamicRoute: true,
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    '/admin/cylinders/[id]/edit': {
        key: 'admin.cylinders.edit',
        authority: ['ADMIN'],
        dynamicRoute: true,
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    '/admin/cylinders/transfer': {
        key: 'admin.cylinders.transfer',
        authority: ['ADMIN'],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    '/admin/cylinders/scan': {
        key: 'admin.cylinders.scan',
        authority: ['ADMIN'],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    // Admin Lease Management routes
    '/admin/leases': {
        key: 'admin.leases.all',
        authority: ['ADMIN'],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    '/admin/leases/new': {
        key: 'admin.leases.new',
        authority: ['ADMIN'],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    '/admin/leases/return': {
        key: 'admin.leases.return',
        authority: ['ADMIN'],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    '/admin/leases/[id]': {
        key: 'admin.leases.detail',
        authority: ['ADMIN'],
        dynamicRoute: true,
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    '/admin/leases/[id]/receipt': {
        key: 'admin.leases.receipt',
        authority: ['ADMIN'],
        dynamicRoute: true,
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    // Admin Refill Management routes
    '/admin/refills': {
        key: 'admin.refills.all',
        authority: ['ADMIN'],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    '/admin/refills/new': {
        key: 'admin.refills.new',
        authority: ['ADMIN'],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    '/admin/refills/bulk': {
        key: 'admin.refills.bulk',
        authority: ['ADMIN'],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    '/admin/refills/[id]': {
        key: 'admin.refills.detail',
        authority: ['ADMIN'],
        dynamicRoute: true,
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    '/admin/refills/[id]/receipt': {
        key: 'admin.refills.receipt',
        authority: ['ADMIN'],
        dynamicRoute: true,
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    // Admin Swap Management routes
    '/admin/swaps': {
        key: 'admin.swaps.all',
        authority: ['ADMIN'],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    '/admin/swaps/new': {
        key: 'admin.swaps.new',
        authority: ['ADMIN'],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    '/admin/swaps/[id]': {
        key: 'admin.swaps.detail',
        authority: ['ADMIN'],
        dynamicRoute: true,
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    '/admin/swaps/[id]/receipt': {
        key: 'admin.swaps.receipt',
        authority: ['ADMIN'],
        dynamicRoute: true,
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    // Admin Transfer routes
    '/admin/transfers': {
        key: 'admin.transfers',
        authority: ['ADMIN'],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    '/admin/transfers/new': {
        key: 'admin.transfers.new',
        authority: ['ADMIN'],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    // Admin Settings routes
    '/admin/settings': {
        key: 'admin.settings',
        authority: ['ADMIN'],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    '/admin/settings/simplified': {
        key: 'admin.settings',
        authority: ['ADMIN'],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    '/admin/settings/new': {
        key: 'admin.settings.new',
        authority: ['ADMIN'],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    '/admin/settings/category/[category]': {
        key: 'admin.settings.category',
        authority: ['ADMIN'],
        dynamicRoute: true,
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    '/admin/settings/setting/[id]/edit': {
        key: 'admin.settings.edit',
        authority: ['ADMIN'],
        dynamicRoute: true,
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    '/admin/settings/setting/[id]/duplicate': {
        key: 'admin.settings.duplicate',
        authority: ['ADMIN'],
        dynamicRoute: true,
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    '/admin/settings/pricing/calculator': {
        key: 'admin.settings.calculator',
        authority: ['ADMIN'],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    // Admin Reports route
    '/admin/reports': {
        key: 'admin.reports',
        authority: ['ADMIN'],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    // Staff routes
    '/staff/dashboard': {
        key: 'staff.dashboard',
        authority: ['STAFF'],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    '/staff/customers': {
        key: 'staff.customers',
        authority: ['STAFF'],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    '/staff/cylinders': {
        key: 'staff.cylinders',
        authority: ['STAFF'],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    '/staff/leasing': {
        key: 'staff.leasing',
        authority: ['STAFF'],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    '/staff/leasing/new': {
        key: 'staff.leasing.new',
        authority: ['STAFF'],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    '/staff/leasing/returns': {
        key: 'staff.leasing.returns',
        authority: ['STAFF'],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    '/staff/leasing/[id]': {
        key: 'staff.leasing.detail',
        authority: ['STAFF'],
        dynamicRoute: true,
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    '/staff/leasing/[id]/receipt': {
        key: 'staff.leasing.receipt',
        authority: ['STAFF'],
        dynamicRoute: true,
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    // Staff Customer routes
    '/staff/customers/register': {
        key: 'staff.registerCustomer',
        authority: ['STAFF'],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    '/staff/customers/[id]': {
        key: 'staff.customers.detail',
        authority: ['STAFF'],
        dynamicRoute: true,
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    // Staff Cylinder routes
    '/staff/cylinders/scan': {
        key: 'staff.cylinders.scan',
        authority: ['STAFF'],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    '/staff/cylinders/[id]': {
        key: 'staff.cylinders.detail',
        authority: ['STAFF'],
        dynamicRoute: true,
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    // Staff Refill routes
    '/staff/refills': {
        key: 'staff.refills.all',
        authority: ['STAFF'],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    '/staff/refills/new': {
        key: 'staff.refills.new',
        authority: ['STAFF'],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    '/staff/refills/[id]/receipt': {
        key: 'staff.refills.receipt',
        authority: ['STAFF'],
        dynamicRoute: true,
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    // Staff Swap routes
    '/staff/swaps': {
        key: 'staff.swaps.all',
        authority: ['STAFF'],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    '/staff/swaps/new': {
        key: 'staff.swaps.new',
        authority: ['STAFF'],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    '/staff/swaps/[id]': {
        key: 'staff.swaps.detail',
        authority: ['STAFF'],
        dynamicRoute: true,
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    '/staff/swaps/[id]/receipt': {
        key: 'staff.swaps.receipt',
        authority: ['STAFF'],
        dynamicRoute: true,
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    // Staff Transactions route
    '/staff/transactions': {
        key: 'staff.transactions',
        authority: ['STAFF'],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    // Operator routes
    '/operator/dashboard': {
        key: 'operator.dashboard',
        authority: ['OPERATOR', 'REFILL_OP'],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    '/operator/qr-scanner': {
        key: 'operator.qr-scanner',
        authority: ['OPERATOR', 'REFILL_OP'],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    '/operator/refill-queue': {
        key: 'operator.refill-queue',
        authority: ['OPERATOR', 'REFILL_OP'],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    // Operator Refill routes
    '/operator/refills': {
        key: 'operator.refills.all',
        authority: ['OPERATOR', 'REFILL_OP'],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    '/operator/refills/new': {
        key: 'operator.refills.new',
        authority: ['OPERATOR', 'REFILL_OP'],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    '/operator/refills/[id]/receipt': {
        key: 'operator.refills.receipt',
        authority: ['OPERATOR', 'REFILL_OP'],
        dynamicRoute: true,
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    // Operator Swap routes
    '/operator/swaps': {
        key: 'operator.swaps.all',
        authority: ['OPERATOR', 'REFILL_OP'],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    '/operator/swaps/new': {
        key: 'operator.swaps.new',
        authority: ['OPERATOR', 'REFILL_OP'],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    '/operator/swaps/[id]': {
        key: 'operator.swaps.detail',
        authority: ['OPERATOR', 'REFILL_OP'],
        dynamicRoute: true,
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    '/operator/swaps/[id]/receipt': {
        key: 'operator.swaps.receipt',
        authority: ['OPERATOR', 'REFILL_OP'],
        dynamicRoute: true,
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    // Customer routes
    '/customer/dashboard': {
        key: 'customer.dashboard',
        authority: ['CUSTOMER'],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
}

export const publicRoutes: Routes = {}

export const authRoutes = authRoute
