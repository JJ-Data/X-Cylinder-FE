'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    PiPlusDuotone,
    PiUsersDuotone,
    PiCheckCircleDuotone,
    PiXCircleDuotone,
    PiCrownDuotone,
    PiUserGearDuotone,
    PiGasPumpDuotone,
    PiUserDuotone,
    PiTrendUpDuotone,
    PiMagnifyingGlassDuotone,
    PiFunnelDuotone,
    PiDownloadDuotone,
    PiEyeDuotone,
    PiPencilDuotone,
    PiTrashDuotone,
    PiLockDuotone,
    PiDotsThreeVerticalDuotone,
} from 'react-icons/pi'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Container from '@/components/shared/Container'
import DataTable from '@/components/shared/DataTable'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Tag from '@/components/ui/Tag'
import Badge from '@/components/ui/Badge'
import Dialog from '@/components/ui/Dialog'
import Skeleton from '@/components/ui/Skeleton'
import Dropdown from '@/components/ui/Dropdown'
import { useUsers, useUserMutations } from '@/hooks/useUsers'
import { UserRole, type User, type UserFilters } from '@/types/user'
import { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { useSession } from 'next-auth/react'
import { hasPermission } from '@/types/user'
import useWindowSize from '@/components/ui/hooks/useWindowSize'
import UserCard from '@/components/users/UserCard'

const roleOptions = [
    { value: '', label: 'All Roles' },
    { value: UserRole.ADMIN, label: 'Admin' },
    { value: UserRole.STAFF, label: 'Staff' },
    { value: UserRole.REFILL_OPERATOR, label: 'Refill Operator' },
    { value: UserRole.CUSTOMER, label: 'Customer' },
]

const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'true', label: 'Active' },
    { value: 'false', label: 'Inactive' },
]

export default function UsersPage() {
    const router = useRouter()
    const { data: session } = useSession()
    const { width } = useWindowSize()
    const isMobile = width ? width < 768 : false

    const [filters, setFilters] = useState<UserFilters>({
        page: 1,
        pageSize: 10,
    })
    const [searchTerm, setSearchTerm] = useState('')
    const [showFilters, setShowFilters] = useState(false)
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean
        user?: User
    }>({ open: false })

    const { data: usersData, isLoading } = useUsers(filters)
    const { deleteUser, toggleUserStatus } = useUserMutations()

    const users = usersData?.users || []
    const totalPages = usersData?.totalPages || 1
    const totalUsers = usersData?.total || 0

    // Calculate statistics
    const activeUsers = users.filter((u: User) => u.isActive).length
    const _inactiveUsers = users.filter((u: User) => !u.isActive).length
    const _adminCount = users.filter(
        (u: User) => u.role === UserRole.ADMIN,
    ).length
    const staffCount = users.filter(
        (u: User) => u.role === UserRole.STAFF,
    ).length
    const operatorCount = users.filter(
        (u: User) => u.role === UserRole.REFILL_OPERATOR,
    ).length
    const customerCount = users.filter(
        (u: User) => u.role === UserRole.CUSTOMER,
    ).length

    const handleSearch = () => {
        setFilters({ ...filters, search: searchTerm, page: 1 })
    }

    const handleFilterChange = (key: keyof UserFilters, value: any) => {
        setFilters({ ...filters, [key]: value, page: 1 })
    }

    const handlePageChange = (page: number) => {
        setFilters({ ...filters, page })
    }

    const clearFilters = () => {
        setSearchTerm('')
        setFilters({ page: 1, pageSize: 10 })
    }

    const handleExport = () => {
        // TODO: Implement export functionality
        console.log('Export users')
    }

    // Ensure role is properly formatted for permission check
    const userRole = session?.user?.role || ''

    const handleStatusToggle = async (user: User) => {
        try {
            await toggleUserStatus.trigger(user.id)
        } catch (error) {
            console.error('Failed to toggle user status:', error)
        }
    }

    const handleDelete = async () => {
        if (!deleteDialog.user) return

        try {
            await deleteUser.trigger(deleteDialog.user.id)
            setDeleteDialog({ open: false })
        } catch (error) {
            console.error('Failed to delete user:', error)
        }
    }

    const getRoleIcon = (role: UserRole) => {
        switch (role) {
            case UserRole.ADMIN:
                return <PiCrownDuotone className="text-red-600" />
            case UserRole.STAFF:
                return <PiUserGearDuotone className="text-blue-600" />
            case UserRole.REFILL_OPERATOR:
                return <PiGasPumpDuotone className="text-green-600" />
            case UserRole.CUSTOMER:
                return <PiUserDuotone className="text-gray-600" />
            default:
                return <PiUserDuotone className="text-gray-600" />
        }
    }

    const getRoleColor = (role: UserRole) => {
        switch (role) {
            case UserRole.ADMIN:
                return 'red'
            case UserRole.STAFF:
                return 'blue'
            case UserRole.REFILL_OPERATOR:
                return 'green'
            case UserRole.CUSTOMER:
                return 'gray'
            default:
                return 'gray'
        }
    }

    const getStatusStyle = (isActive: boolean) => {
        return isActive
            ? {
                  color: 'text-green-700',
                  bgColor: 'bg-green-100',
                  borderColor: 'border-green-200',
                  icon: <PiCheckCircleDuotone className="text-green-600" />,
              }
            : {
                  color: 'text-red-700',
                  bgColor: 'bg-red-100',
                  borderColor: 'border-red-200',
                  icon: <PiXCircleDuotone className="text-red-600" />,
              }
    }

    const columns: ColumnDef<User>[] = [
        {
            header: 'User',
            accessorKey: 'firstName',
            cell: ({ row }) => {
                const user = row.original
                const initials =
                    `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
                return (
                    <div className="flex items-center gap-3">
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold bg-${getRoleColor(user.role)}-500`}
                        >
                            {initials}
                        </div>
                        <div>
                            <p className="font-medium text-gray-900">{`${user.firstName} ${user.lastName}`}</p>
                            <p className="text-sm text-gray-500">
                                {user.email}
                            </p>
                        </div>
                    </div>
                )
            },
        },
        {
            header: 'Role',
            accessorKey: 'role',
            cell: ({ row }) => {
                const user = row.original
                return (
                    <div className="flex items-center gap-2">
                        {getRoleIcon(user.role)}
                        <Tag
                            className={`capitalize bg-${getRoleColor(user.role)}-100 text-${getRoleColor(user.role)}-700 border-${getRoleColor(user.role)}-200 border`}
                        >
                            {user.role.replace('_', ' ').toLowerCase()}
                        </Tag>
                    </div>
                )
            },
        },
        {
            header: 'Contact',
            accessorKey: 'phoneNumber',
            cell: ({ row }) => (
                <div>
                    <p className="text-sm">{row.original.phoneNumber || '-'}</p>
                    {row.original.outletId && (
                        <p className="text-xs text-gray-500">
                            Outlet #{row.original.outletId}
                        </p>
                    )}
                </div>
            ),
        },
        {
            header: 'Status',
            accessorKey: 'isActive',
            cell: ({ row }) => {
                const statusStyle = getStatusStyle(row.original.isActive)
                return (
                    <Tag
                        className={`${statusStyle.color} ${statusStyle.bgColor} ${statusStyle.borderColor} border`}
                    >
                        <span className="flex items-center gap-1">
                            {statusStyle.icon}
                            {row.original.isActive ? 'Active' : 'Inactive'}
                        </span>
                    </Tag>
                )
            },
        },
        {
            header: 'Joined',
            accessorKey: 'createdAt',
            cell: ({ row }) => (
                <span className="text-sm text-gray-600">
                    {format(new Date(row.original.createdAt), 'MMM d, yyyy')}
                </span>
            ),
        },
        {
            header: '',
            id: 'actions',
            cell: ({ row }) => {
                const user = row.original
                return (
                    <div className="flex items-center justify-end gap-2">
                        <Button
                            size="sm"
                            variant="plain"
                            icon={<PiEyeDuotone />}
                            onClick={() =>
                                router.push(`/admin/users/${user.id}`)
                            }
                        />
                        <Dropdown
                            renderTitle={
                                <Button
                                    size="sm"
                                    variant="plain"
                                    icon={<PiDotsThreeVerticalDuotone />}
                                />
                            }
                        >
                            <Dropdown.Item
                                eventKey="edit"
                                onClick={() =>
                                    router.push(`/admin/users/${user.id}/edit`)
                                }
                            >
                                <PiPencilDuotone className="mr-2" />
                                Edit User
                            </Dropdown.Item>
                            <Dropdown.Item
                                eventKey="password"
                                onClick={() => {
                                    /* TODO: Implement password reset */
                                }}
                            >
                                <PiLockDuotone className="mr-2" />
                                Reset Password
                            </Dropdown.Item>
                            <Dropdown.Item
                                eventKey="status"
                                onClick={() => handleStatusToggle(user)}
                            >
                                {user.isActive ? (
                                    <>
                                        <PiXCircleDuotone className="mr-2" />
                                        Deactivate
                                    </>
                                ) : (
                                    <>
                                        <PiCheckCircleDuotone className="mr-2" />
                                        Activate
                                    </>
                                )}
                            </Dropdown.Item>
                            {hasPermission(
                                userRole as UserRole,
                                'users',
                                'delete',
                            ) && (
                                <Dropdown.Item
                                    eventKey="delete"
                                    onClick={() =>
                                        setDeleteDialog({ open: true, user })
                                    }
                                    className="text-red-600"
                                >
                                    <PiTrashDuotone className="mr-2" />
                                    Delete User
                                </Dropdown.Item>
                            )}
                        </Dropdown>
                    </div>
                )
            },
        },
    ]

    return (
        <Container>
            <div className="mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
                            User Management
                        </h3>
                        <p className="text-sm text-gray-500">
                            Manage system users and their permissions
                        </p>
                    </div>
                    {!isMobile &&
                        hasPermission(
                            userRole as UserRole,
                            'users',
                            'create',
                        ) && (
                            <Button
                                variant="solid"
                                icon={<PiPlusDuotone />}
                                onClick={() =>
                                    router.push('/admin/users/create')
                                }
                                size="md"
                            >
                                Add User
                            </Button>
                        )}
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
                <AdaptiveCard className="hover:shadow-lg transition-shadow duration-200">
                    <div className="p-4 md:p-5">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-xs md:text-sm font-medium text-gray-600">
                                Total Users
                            </p>
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <PiUsersDuotone className="text-lg md:text-xl text-blue-600" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xl md:text-2xl font-bold text-gray-900">
                                {isLoading ? (
                                    <Skeleton className="w-16 h-7" />
                                ) : (
                                    totalUsers
                                )}
                            </p>
                            <p className="text-xs text-gray-500">
                                All system users
                            </p>
                            {!isLoading && (
                                <div className="flex items-center gap-1 text-xs">
                                    <PiTrendUpDuotone className="text-green-500" />
                                    <span className="text-green-600">+12</span>
                                    <span className="text-gray-400">
                                        this month
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </AdaptiveCard>

                <AdaptiveCard className="hover:shadow-lg transition-shadow duration-200">
                    <div className="p-4 md:p-5">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-xs md:text-sm font-medium text-gray-600">
                                Active
                            </p>
                            <div className="p-2 bg-green-50 rounded-lg">
                                <PiCheckCircleDuotone className="text-lg md:text-xl text-green-600" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xl md:text-2xl font-bold text-gray-900">
                                {isLoading ? (
                                    <Skeleton className="w-16 h-7" />
                                ) : (
                                    activeUsers
                                )}
                            </p>
                            <p className="text-xs text-gray-500">
                                Can access system
                            </p>
                            {!isLoading && totalUsers > 0 && (
                                <div className="flex items-center gap-1 text-xs">
                                    <span className="text-gray-600">
                                        {Math.round(
                                            (activeUsers / totalUsers) * 100,
                                        )}
                                        %
                                    </span>
                                    <span className="text-gray-400">
                                        of total
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </AdaptiveCard>

                <AdaptiveCard className="hover:shadow-lg transition-shadow duration-200">
                    <div className="p-4 md:p-5">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-xs md:text-sm font-medium text-gray-600">
                                Staff
                            </p>
                            <div className="p-2 bg-purple-50 rounded-lg">
                                <PiUserGearDuotone className="text-lg md:text-xl text-purple-600" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xl md:text-2xl font-bold text-gray-900">
                                {isLoading ? (
                                    <Skeleton className="w-16 h-7" />
                                ) : (
                                    staffCount + operatorCount
                                )}
                            </p>
                            <p className="text-xs text-gray-500">
                                Staff & operators
                            </p>
                            {!isLoading && (
                                <div className="text-xs space-y-1">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">
                                            Staff:
                                        </span>
                                        <span className="font-medium">
                                            {staffCount}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">
                                            Operators:
                                        </span>
                                        <span className="font-medium">
                                            {operatorCount}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </AdaptiveCard>

                <AdaptiveCard className="hover:shadow-lg transition-shadow duration-200">
                    <div className="p-4 md:p-5">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-xs md:text-sm font-medium text-gray-600">
                                Customers
                            </p>
                            <div className="p-2 bg-indigo-50 rounded-lg">
                                <PiUserDuotone className="text-lg md:text-xl text-indigo-600" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xl md:text-2xl font-bold text-gray-900">
                                {isLoading ? (
                                    <Skeleton className="w-16 h-7" />
                                ) : (
                                    customerCount
                                )}
                            </p>
                            <p className="text-xs text-gray-500">
                                Registered customers
                            </p>
                            {!isLoading && (
                                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                                    <div
                                        className="bg-indigo-600 h-1.5 rounded-full"
                                        style={{
                                            width: `${totalUsers > 0 ? (customerCount / totalUsers) * 100 : 0}%`,
                                        }}
                                    ></div>
                                </div>
                            )}
                        </div>
                    </div>
                </AdaptiveCard>
            </div>

            {/* Search and Filters */}
            <AdaptiveCard className="mb-6">
                <div className="p-4 md:p-6">
                    {/* Mobile Filter Toggle */}
                    {isMobile && (
                        <Button
                            variant="plain"
                            icon={<PiFunnelDuotone />}
                            onClick={() => setShowFilters(!showFilters)}
                            className="mb-3 w-full justify-center"
                        >
                            {showFilters ? 'Hide Filters' : 'Show Filters'}
                            {(filters.role ||
                                filters.isActive !== undefined) && (
                                <Badge content="Active" className="ml-2" />
                            )}
                        </Button>
                    )}

                    <div
                        className={`${isMobile && !showFilters ? 'hidden' : ''} space-y-4`}
                    >
                        {/* Search Bar */}
                        <div className="flex flex-col md:flex-row gap-3">
                            <div className="flex-1">
                                <Input
                                    placeholder="Search users by name or email..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    onKeyDown={(e) =>
                                        e.key === 'Enter' && handleSearch()
                                    }
                                    prefix={
                                        <PiMagnifyingGlassDuotone className="text-lg" />
                                    }
                                    className="w-full"
                                />
                            </div>
                            <Button
                                onClick={handleSearch}
                                variant="solid"
                                className="w-full md:w-auto"
                                icon={<PiMagnifyingGlassDuotone />}
                            >
                                Search
                            </Button>
                        </div>

                        {/* Filter Options */}
                        <div className="flex flex-col md:flex-row gap-3 pt-3 border-t">
                            <div className="flex-1 flex flex-col md:flex-row gap-3">
                                <Select
                                    placeholder="Filter by role"
                                    options={roleOptions}
                                    value={roleOptions.find(
                                        (opt) => opt.value === filters.role,
                                    )}
                                    onChange={(option) =>
                                        handleFilterChange(
                                            'role',
                                            option?.value || undefined,
                                        )
                                    }
                                    className="w-full md:w-40"
                                />
                                <Select
                                    placeholder="Filter by status"
                                    options={statusOptions}
                                    value={statusOptions.find(
                                        (opt) =>
                                            opt.value ===
                                            (filters.isActive?.toString() ||
                                                ''),
                                    )}
                                    onChange={(option) =>
                                        handleFilterChange(
                                            'isActive',
                                            option?.value
                                                ? option.value === 'true'
                                                : undefined,
                                        )
                                    }
                                    className="w-full md:w-40"
                                />
                            </div>
                            <div className="flex gap-3">
                                {(filters.role ||
                                    filters.isActive !== undefined ||
                                    searchTerm) && (
                                    <Button
                                        variant="plain"
                                        size="sm"
                                        onClick={clearFilters}
                                    >
                                        Clear All
                                    </Button>
                                )}
                                <Button
                                    variant="plain"
                                    icon={<PiDownloadDuotone />}
                                    onClick={handleExport}
                                    className="w-full md:w-auto"
                                >
                                    Export
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </AdaptiveCard>

            {/* User List */}
            {isMobile ? (
                // Mobile Card View
                <div className="space-y-4">
                    {isLoading ? (
                        Array.from({ length: 5 }).map((_, index) => (
                            <AdaptiveCard key={index}>
                                <div className="p-4 space-y-3">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-3 w-1/2" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-3 w-full" />
                                        <Skeleton className="h-3 w-full" />
                                    </div>
                                    <Skeleton className="h-8 w-full" />
                                </div>
                            </AdaptiveCard>
                        ))
                    ) : users.length > 0 ? (
                        users.map((user: User) => (
                            <UserCard
                                key={user.id}
                                user={user}
                                onView={() =>
                                    router.push(`/admin/users/${user.id}`)
                                }
                                onEdit={() =>
                                    router.push(`/admin/users/${user.id}/edit`)
                                }
                                onStatusToggle={() => handleStatusToggle(user)}
                                onDelete={() =>
                                    setDeleteDialog({ open: true, user })
                                }
                                hasDeletePermission={hasPermission(
                                    userRole as UserRole,
                                    'users',
                                    'delete',
                                )}
                            />
                        ))
                    ) : (
                        <AdaptiveCard>
                            <div className="text-center py-12">
                                <PiUsersDuotone className="text-6xl text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 mb-2">
                                    No users found
                                </p>
                                <p className="text-sm text-gray-400">
                                    Try adjusting your filters or search
                                    criteria
                                </p>
                                {hasPermission(
                                    userRole as UserRole,
                                    'users',
                                    'create',
                                ) && (
                                    <Button
                                        variant="solid"
                                        icon={<PiPlusDuotone />}
                                        onClick={() =>
                                            router.push('/admin/users/create')
                                        }
                                        className="mt-4"
                                    >
                                        Add New User
                                    </Button>
                                )}
                            </div>
                        </AdaptiveCard>
                    )}

                    {/* Mobile Pagination */}
                    {users.length > 0 && (
                        <div className="flex justify-between items-center p-4 bg-white rounded-lg shadow-sm">
                            <Button
                                variant="plain"
                                size="sm"
                                onClick={() =>
                                    handlePageChange(filters.page! - 1)
                                }
                                disabled={filters.page === 1}
                            >
                                Previous
                            </Button>
                            <span className="text-sm text-gray-600">
                                Page {filters.page} of {totalPages}
                            </span>
                            <Button
                                variant="plain"
                                size="sm"
                                onClick={() =>
                                    handlePageChange(filters.page! + 1)
                                }
                                disabled={filters.page === totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </div>
            ) : (
                // Desktop Table View
                <AdaptiveCard>
                    <DataTable
                        columns={columns}
                        data={users}
                        loading={isLoading}
                        onPaginationChange={(pageIndex) =>
                            handlePageChange(pageIndex + 1)
                        }
                        pagingData={{
                            total: totalUsers,
                            pageIndex: filters.page! - 1,
                            pageSize: filters.pageSize || 10,
                        }}
                    />
                </AdaptiveCard>
            )}

            {/* Floating Action Button for Mobile */}
            {isMobile &&
                hasPermission(userRole as UserRole, 'users', 'create') && (
                    <div className="fixed bottom-6 right-6 z-50">
                        <Button
                            variant="solid"
                            size="lg"
                            className="rounded-full shadow-lg w-14 h-14 p-0"
                            onClick={() => router.push('/admin/users/create')}
                        >
                            <PiPlusDuotone className="text-2xl" />
                        </Button>
                    </div>
                )}

            {/* Delete Confirmation Dialog */}
            <Dialog
                isOpen={deleteDialog.open}
                onClose={() => setDeleteDialog({ open: false })}
            >
                <h5 className="mb-4">Confirm Delete</h5>
                <p className="mb-6">
                    Are you sure you want to delete user{' '}
                    <strong>
                        {deleteDialog.user?.firstName}{' '}
                        {deleteDialog.user?.lastName}
                    </strong>
                    ? This action cannot be undone.
                </p>
                <div className="flex gap-3 justify-end">
                    <Button
                        variant="plain"
                        onClick={() => setDeleteDialog({ open: false })}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="solid"
                        color="red"
                        onClick={handleDelete}
                        loading={deleteUser.isMutating}
                    >
                        Delete User
                    </Button>
                </div>
            </Dialog>
        </Container>
    )
}
