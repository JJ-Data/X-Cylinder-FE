'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { format } from 'date-fns'
import {
    PiArrowLeftDuotone,
    PiPencilDuotone,
    PiEnvelopeDuotone,
    PiPhoneDuotone,
    PiMapPinDuotone,
    PiHouseDuotone,
    PiCalendarDuotone,
    PiCurrencyCircleDollarDuotone,
    PiCheckCircleDuotone,
    PiXCircleDuotone,
    PiLockDuotone,
    PiClockDuotone,
    PiChartLineDuotone,
    PiUserDuotone,
    PiUserGearDuotone,
    PiGasPumpDuotone,
    PiCrownDuotone,
    PiInfoDuotone,
    PiIdentificationCardDuotone,
    PiCreditCardDuotone,
} from 'react-icons/pi'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Tag from '@/components/ui/Tag'
import Tabs from '@/components/ui/Tabs'
import Skeleton from '@/components/ui/Skeleton'
import Dialog from '@/components/ui/Dialog'
import Input from '@/components/ui/Input'
import Alert from '@/components/ui/Alert'
import {
    useUser,
    useUserMutations,
    useCustomerMutations,
} from '@/hooks/useUsers'
import { UserRole, PaymentStatus } from '@/types/user'
import { useSession } from 'next-auth/react'
import {} from '@/types/user'
import { toast } from 'react-hot-toast'
import useWindowSize from '@/components/ui/hooks/useWindowSize'

export default function UserDetailPage() {
    const router = useRouter()
    const params = useParams()
    const userId = parseInt(params.id as string)
    const { data: _session } = useSession()
    const { width } = useWindowSize()
    const isMobile = width ? width < 768 : false

    const [activeTab, setActiveTab] = useState('details')
    const [changePasswordDialog, setChangePasswordDialog] = useState(false)
    const [newPassword, setNewPassword] = useState('')
    const [paymentDialog, setPaymentDialog] = useState(false)
    const [paymentAmount, setPaymentAmount] = useState('')

    const { data: user, isLoading } = useUser(userId)
    const { toggleUserStatus, changePassword } = useUserMutations()
    const { simulatePayment, activateCustomer } = useCustomerMutations()

    const handleStatusToggle = async () => {
        try {
            await toggleUserStatus.trigger(userId)
        } catch (error) {
            console.error('Failed to toggle user status:', error)
        }
    }

    const handlePasswordChange = async () => {
        if (!newPassword || newPassword.length < 6) {
            toast.error('Password must be at least 6 characters')
            return
        }

        try {
            await changePassword.trigger({ id: userId, newPassword })
            setChangePasswordDialog(false)
            setNewPassword('')
            toast.success('Password changed successfully')
        } catch (error) {
            console.error('Failed to change password:', error)
        }
    }

    const handlePaymentSimulation = async () => {
        const amount = parseFloat(paymentAmount)
        if (!amount || amount <= 0) {
            toast.error('Please enter a valid amount')
            return
        }

        try {
            await simulatePayment.trigger({ userId, amount })
            setPaymentDialog(false)
            setPaymentAmount('')
            toast.success('Payment simulated successfully')
        } catch (error) {
            console.error('Failed to simulate payment:', error)
        }
    }

    const handleActivateCustomer = async () => {
        try {
            await activateCustomer.trigger({
                userId,
                paymentAmount: 5000, // Default activation fee
                paymentMethod: 'cash',
                paymentReference: `ACT-${Date.now()}`,
            })
            toast.success('Customer activated successfully')
        } catch (error) {
            console.error('Failed to activate customer:', error)
        }
    }

    if (isLoading) {
        return (
            <Container>
                <div className="space-y-4">
                    <Skeleton className="h-8 w-64" />
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <Skeleton key={i} className="h-32" />
                        ))}
                    </div>
                    <Skeleton className="h-96" />
                </div>
            </Container>
        )
    }

    if (!user) {
        return (
            <Container>
                <Alert type="danger">User not found</Alert>
            </Container>
        )
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
                return {
                    bg: 'bg-red-100',
                    text: 'text-red-700',
                    border: 'border-red-200',
                }
            case UserRole.STAFF:
                return {
                    bg: 'bg-blue-100',
                    text: 'text-blue-700',
                    border: 'border-blue-200',
                }
            case UserRole.REFILL_OPERATOR:
                return {
                    bg: 'bg-green-100',
                    text: 'text-green-700',
                    border: 'border-green-200',
                }
            case UserRole.CUSTOMER:
                return {
                    bg: 'bg-gray-100',
                    text: 'text-gray-700',
                    border: 'border-gray-200',
                }
            default:
                return {
                    bg: 'bg-gray-100',
                    text: 'text-gray-700',
                    border: 'border-gray-200',
                }
        }
    }

    const roleStyle = getRoleColor(user.role)
    const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    const accountAge = Math.floor(
        (new Date().getTime() - new Date(user.createdAt).getTime()) /
            (1000 * 60 * 60 * 24),
    )

    return (
        <Container>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="plain"
                                size="sm"
                                icon={<PiArrowLeftDuotone />}
                                onClick={() => router.push('/admin/users')}
                            >
                                Back to Users
                            </Button>
                            <div className="hidden md:block">
                                <nav className="flex items-center gap-2 text-sm">
                                    <span className="text-gray-500">Users</span>
                                    <span className="text-gray-400">/</span>
                                    <span className="font-medium">
                                        {user.firstName} {user.lastName}
                                    </span>
                                </nav>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="plain"
                                size="sm"
                                icon={<PiLockDuotone />}
                                onClick={() => setChangePasswordDialog(true)}
                            >
                                {isMobile ? '' : 'Change Password'}
                            </Button>
                            <Button
                                variant="solid"
                                size="sm"
                                icon={<PiPencilDuotone />}
                                onClick={() =>
                                    router.push(`/admin/users/${userId}/edit`)
                                }
                            >
                                {isMobile ? '' : 'Edit User'}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* User Header Card */}
                <AdaptiveCard className="mb-6">
                    <div className="p-6">
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                            <div
                                className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold ${roleStyle.bg} ${roleStyle.text}`}
                            >
                                {initials}
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {user.firstName} {user.lastName}
                                </h2>
                                <p className="text-gray-500 flex items-center justify-center md:justify-start gap-2 mt-1">
                                    <PiEnvelopeDuotone />
                                    {user.email}
                                </p>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-3">
                                    <div className="flex items-center gap-1">
                                        {getRoleIcon(user.role)}
                                        <Tag
                                            className={`${roleStyle.bg} ${roleStyle.text} ${roleStyle.border} border capitalize`}
                                        >
                                            {user.role
                                                .replace('_', ' ')
                                                .toLowerCase()}
                                        </Tag>
                                    </div>
                                    <Tag
                                        className={`${user.isActive ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'} border`}
                                    >
                                        <span className="flex items-center gap-1">
                                            {user.isActive ? (
                                                <PiCheckCircleDuotone />
                                            ) : (
                                                <PiXCircleDuotone />
                                            )}
                                            {user.isActive
                                                ? 'Active'
                                                : 'Inactive'}
                                        </span>
                                    </Tag>
                                    {user.outletId && (
                                        <Tag className="bg-gray-100 text-gray-700 border-gray-200 border">
                                            <PiHouseDuotone className="mr-1" />
                                            Outlet #{user.outletId}
                                        </Tag>
                                    )}
                                </div>
                            </div>
                            <Button
                                variant={user.isActive ? 'plain' : 'solid'}
                                color={user.isActive ? 'red' : 'green'}
                                onClick={handleStatusToggle}
                                loading={toggleUserStatus.isMutating}
                            >
                                {user.isActive ? 'Deactivate' : 'Activate'}
                            </Button>
                        </div>
                    </div>
                </AdaptiveCard>

                {/* Statistics Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
                    <AdaptiveCard className="hover:shadow-lg transition-shadow duration-200">
                        <div className="p-4 md:p-5">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-xs md:text-sm font-medium text-gray-600">
                                    Account Status
                                </p>
                                <div
                                    className={`p-2 ${user.isActive ? 'bg-green-50' : 'bg-red-50'} rounded-lg`}
                                >
                                    {user.isActive ? (
                                        <PiCheckCircleDuotone className="text-lg md:text-xl text-green-600" />
                                    ) : (
                                        <PiXCircleDuotone className="text-lg md:text-xl text-red-600" />
                                    )}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-lg md:text-xl font-bold text-gray-900">
                                    {user.isActive ? 'Active' : 'Inactive'}
                                </p>
                                <p className="text-xs text-gray-500">
                                    Can {user.isActive ? '' : 'not '}access
                                    system
                                </p>
                            </div>
                        </div>
                    </AdaptiveCard>

                    <AdaptiveCard className="hover:shadow-lg transition-shadow duration-200">
                        <div className="p-4 md:p-5">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-xs md:text-sm font-medium text-gray-600">
                                    Last Login
                                </p>
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    <PiClockDuotone className="text-lg md:text-xl text-blue-600" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-lg md:text-xl font-bold text-gray-900">
                                    {user.lastLoginAt
                                        ? format(
                                              new Date(user.lastLoginAt),
                                              'MMM d',
                                          )
                                        : 'Never'}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {user.lastLoginAt
                                        ? format(
                                              new Date(user.lastLoginAt),
                                              'h:mm a',
                                          )
                                        : 'No login record'}
                                </p>
                            </div>
                        </div>
                    </AdaptiveCard>

                    <AdaptiveCard className="hover:shadow-lg transition-shadow duration-200">
                        <div className="p-4 md:p-5">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-xs md:text-sm font-medium text-gray-600">
                                    Total Activity
                                </p>
                                <div className="p-2 bg-purple-50 rounded-lg">
                                    <PiChartLineDuotone className="text-lg md:text-xl text-purple-600" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-lg md:text-xl font-bold text-gray-900">
                                    --
                                </p>
                                <p className="text-xs text-gray-500">
                                    Coming soon
                                </p>
                            </div>
                        </div>
                    </AdaptiveCard>

                    <AdaptiveCard className="hover:shadow-lg transition-shadow duration-200">
                        <div className="p-4 md:p-5">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-xs md:text-sm font-medium text-gray-600">
                                    Account Age
                                </p>
                                <div className="p-2 bg-indigo-50 rounded-lg">
                                    <PiCalendarDuotone className="text-lg md:text-xl text-indigo-600" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-lg md:text-xl font-bold text-gray-900">
                                    {accountAge} days
                                </p>
                                <p className="text-xs text-gray-500">
                                    Since{' '}
                                    {format(
                                        new Date(user.createdAt),
                                        'MMM d, yyyy',
                                    )}
                                </p>
                            </div>
                        </div>
                    </AdaptiveCard>
                </div>

                {/* Main Content Tabs */}
                <AdaptiveCard>
                    <Tabs
                        defaultValue="details"
                        value={activeTab}
                        onChange={setActiveTab}
                    >
                        <Tabs.TabList className="border-b px-4 md:px-6">
                            <Tabs.TabNav value="details">
                                <PiIdentificationCardDuotone className="mr-2" />
                                Details
                            </Tabs.TabNav>
                            {user.role === UserRole.CUSTOMER && (
                                <>
                                    <Tabs.TabNav value="customer">
                                        <PiUserDuotone className="mr-2" />
                                        Customer Info
                                    </Tabs.TabNav>
                                    <Tabs.TabNav value="payments">
                                        <PiCreditCardDuotone className="mr-2" />
                                        Payments
                                    </Tabs.TabNav>
                                </>
                            )}
                            <Tabs.TabNav value="activity">
                                <PiChartLineDuotone className="mr-2" />
                                Activity
                            </Tabs.TabNav>
                        </Tabs.TabList>

                        <div className="p-4 md:p-6">
                            <Tabs.TabContent value="details">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Personal Information */}
                                    <Card>
                                        <div className="p-4 md:p-6">
                                            <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                                <PiUserDuotone className="text-xl" />
                                                Personal Information
                                            </h4>
                                            <div className="space-y-4">
                                                <div>
                                                    <p className="text-sm text-gray-500">
                                                        Full Name
                                                    </p>
                                                    <p className="font-medium">
                                                        {user.firstName}{' '}
                                                        {user.lastName}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">
                                                        Email Address
                                                    </p>
                                                    <p className="font-medium flex items-center gap-2">
                                                        <PiEnvelopeDuotone className="text-gray-400" />
                                                        {user.email}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">
                                                        Phone Number
                                                    </p>
                                                    <p className="font-medium flex items-center gap-2">
                                                        <PiPhoneDuotone className="text-gray-400" />
                                                        {user.phoneNumber ||
                                                            'Not provided'}
                                                    </p>
                                                </div>
                                                {user.alternatePhone && (
                                                    <div>
                                                        <p className="text-sm text-gray-500">
                                                            Alternate Phone
                                                        </p>
                                                        <p className="font-medium flex items-center gap-2">
                                                            <PiPhoneDuotone className="text-gray-400" />
                                                            {
                                                                user.alternatePhone
                                                            }
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Card>

                                    {/* Account Information */}
                                    <Card>
                                        <div className="p-4 md:p-6">
                                            <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                                <PiInfoDuotone className="text-xl" />
                                                Account Information
                                            </h4>
                                            <div className="space-y-4">
                                                <div>
                                                    <p className="text-sm text-gray-500">
                                                        User ID
                                                    </p>
                                                    <p className="font-medium font-mono">
                                                        #{user.id}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">
                                                        Role
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        {getRoleIcon(user.role)}
                                                        <span className="font-medium capitalize">
                                                            {user.role
                                                                .replace(
                                                                    '_',
                                                                    ' ',
                                                                )
                                                                .toLowerCase()}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">
                                                        Registered On
                                                    </p>
                                                    <p className="font-medium">
                                                        {format(
                                                            new Date(
                                                                user.createdAt,
                                                            ),
                                                            'MMMM d, yyyy',
                                                        )}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">
                                                        Last Updated
                                                    </p>
                                                    <p className="font-medium">
                                                        {format(
                                                            new Date(
                                                                user.updatedAt,
                                                            ),
                                                            'MMMM d, yyyy',
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>

                                    {/* Location Information */}
                                    {(user.address ||
                                        user.city ||
                                        user.state) && (
                                        <Card className="md:col-span-2">
                                            <div className="p-4 md:p-6">
                                                <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                                    <PiMapPinDuotone className="text-xl" />
                                                    Location Information
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-sm text-gray-500">
                                                            Address
                                                        </p>
                                                        <p className="font-medium">
                                                            {user.address ||
                                                                'Not provided'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500">
                                                            City
                                                        </p>
                                                        <p className="font-medium">
                                                            {user.city ||
                                                                'Not provided'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500">
                                                            State
                                                        </p>
                                                        <p className="font-medium">
                                                            {user.state ||
                                                                'Not provided'}
                                                        </p>
                                                    </div>
                                                    {user.postalCode && (
                                                        <div>
                                                            <p className="text-sm text-gray-500">
                                                                Postal Code
                                                            </p>
                                                            <p className="font-medium">
                                                                {
                                                                    user.postalCode
                                                                }
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </Card>
                                    )}
                                </div>
                            </Tabs.TabContent>

                            <Tabs.TabContent value="customer">
                                {user.role === UserRole.CUSTOMER &&
                                user.customer ? (
                                    <div className="space-y-6">
                                        <Card>
                                            <div className="p-4 md:p-6">
                                                <h4 className="text-lg font-semibold mb-4">
                                                    Customer Status
                                                </h4>
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm text-gray-500">
                                                            Payment Status
                                                        </p>
                                                        <Tag
                                                            className={`mt-1 ${
                                                                user.customer
                                                                    .paymentStatus ===
                                                                PaymentStatus.PAID
                                                                    ? 'bg-green-100 text-green-700'
                                                                    : 'bg-yellow-100 text-yellow-700'
                                                            }`}
                                                        >
                                                            {
                                                                user.customer
                                                                    .paymentStatus
                                                            }
                                                        </Tag>
                                                    </div>
                                                    <div className="space-y-2">
                                                        {user.customer
                                                            .paymentStatus ===
                                                            PaymentStatus.PENDING && (
                                                            <>
                                                                <Button
                                                                    size="sm"
                                                                    variant="solid"
                                                                    onClick={() =>
                                                                        setPaymentDialog(
                                                                            true,
                                                                        )
                                                                    }
                                                                >
                                                                    Simulate
                                                                    Payment
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="plain"
                                                                    onClick={
                                                                        handleActivateCustomer
                                                                    }
                                                                    loading={
                                                                        activateCustomer.isMutating
                                                                    }
                                                                >
                                                                    Activate
                                                                    Customer
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-gray-500">
                                        <PiUserDuotone className="text-6xl text-gray-300 mx-auto mb-4" />
                                        <p>No customer information available</p>
                                    </div>
                                )}
                            </Tabs.TabContent>

                            <Tabs.TabContent value="payments">
                                <div className="text-center py-12 text-gray-500">
                                    <PiCreditCardDuotone className="text-6xl text-gray-300 mx-auto mb-4" />
                                    <p>Payment history coming soon</p>
                                </div>
                            </Tabs.TabContent>

                            <Tabs.TabContent value="activity">
                                <div className="text-center py-12 text-gray-500">
                                    <PiChartLineDuotone className="text-6xl text-gray-300 mx-auto mb-4" />
                                    <p>Activity tracking coming soon</p>
                                </div>
                            </Tabs.TabContent>
                        </div>
                    </Tabs>
                </AdaptiveCard>

                {/* Password Change Dialog */}
                <Dialog
                    isOpen={changePasswordDialog}
                    onClose={() => {
                        setChangePasswordDialog(false)
                        setNewPassword('')
                    }}
                >
                    <h5 className="mb-4">Change Password</h5>
                    <p className="mb-4 text-sm text-gray-600">
                        Enter a new password for {user.firstName}{' '}
                        {user.lastName}
                    </p>
                    <Input
                        type="password"
                        placeholder="New password (min 6 characters)"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        prefix={<PiLockDuotone className="text-gray-400" />}
                    />
                    <div className="flex gap-3 justify-end mt-6">
                        <Button
                            variant="plain"
                            onClick={() => {
                                setChangePasswordDialog(false)
                                setNewPassword('')
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="solid"
                            onClick={handlePasswordChange}
                            loading={changePassword.isMutating}
                        >
                            Change Password
                        </Button>
                    </div>
                </Dialog>

                {/* Payment Simulation Dialog */}
                <Dialog
                    isOpen={paymentDialog}
                    onClose={() => {
                        setPaymentDialog(false)
                        setPaymentAmount('')
                    }}
                >
                    <h5 className="mb-4">Simulate Payment</h5>
                    <p className="mb-4 text-sm text-gray-600">
                        Enter the payment amount to simulate for this customer
                    </p>
                    <Input
                        type="number"
                        placeholder="Payment amount"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        prefix={
                            <PiCurrencyCircleDollarDuotone className="text-gray-400" />
                        }
                    />
                    <div className="flex gap-3 justify-end mt-6">
                        <Button
                            variant="plain"
                            onClick={() => {
                                setPaymentDialog(false)
                                setPaymentAmount('')
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="solid"
                            onClick={handlePaymentSimulation}
                            loading={simulatePayment.isMutating}
                        >
                            Simulate Payment
                        </Button>
                    </div>
                </Dialog>
            </div>
        </Container>
    )
}
