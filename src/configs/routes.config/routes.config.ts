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
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    '/admin/outlets/[id]/edit': {
        key: 'admin.outlets.edit',
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
