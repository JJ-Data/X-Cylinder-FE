'use client'

import { useState } from 'react'
import Avatar from '@/components/ui/Avatar'
import Dropdown from '@/components/ui/Dropdown'
import withHeaderItem from '@/utils/hoc/withHeaderItem'
import Link from 'next/link'
import signOut from '@/server/actions/auth/handleSignOut'
import useCurrentSession from '@/utils/hooks/useCurrentSession'
import ChangePasswordDialog from '@/components/auth/ChangePasswordDialog'
import { PiUserDuotone, PiSignOutDuotone, PiLockDuotone } from 'react-icons/pi'

import type { JSX } from 'react'

type DropdownList = {
    label: string
    path: string
    icon: JSX.Element
}

const dropdownItemList: DropdownList[] = []

const _UserDropdown = () => {
    const { session, isLoading, isAuthenticated } = useCurrentSession()
    const [showPasswordDialog, setShowPasswordDialog] = useState(false)

    const handleSignOut = async () => {
        await signOut()
    }

    const user = session?.user
    const avatarProps = {
        ...(user?.image
            ? { src: user.image }
            : { icon: <PiUserDuotone /> }),
    }
    
    // Show loading state
    if (isLoading) {
        return (
            <div className="cursor-pointer flex items-center">
                <Avatar size={32} icon={<PiUserDuotone />} />
            </div>
        )
    }

    return (
        <>
            <Dropdown
                className="flex"
                toggleClassName="flex items-center"
                renderTitle={
                    <div className="cursor-pointer flex items-center">
                        <Avatar size={32} {...avatarProps} />
                    </div>
                }
                placement="bottom-end"
            >
            <Dropdown.Item variant="header">
                <div className="py-2 px-3 flex items-center gap-3">
                    <Avatar {...avatarProps} />
                    <div>
                        <div className="font-bold text-gray-900 dark:text-gray-100">
                            {user?.name || 'Anonymous'}
                        </div>
                        <div className="text-xs">
                            {user?.email || 'No email available'}
                        </div>
                    </div>
                </div>
            </Dropdown.Item>
            <Dropdown.Item variant="divider" />
            {dropdownItemList.map((item) => (
                <Dropdown.Item
                    key={item.label}
                    eventKey={item.label}
                    className="px-0"
                >
                    <Link className="flex h-full w-full px-2" href={item.path}>
                        <span className="flex gap-2 items-center w-full">
                            <span className="text-xl">{item.icon}</span>
                            <span>{item.label}</span>
                        </span>
                    </Link>
                </Dropdown.Item>
            ))}
            <Dropdown.Item
                eventKey="Change Password"
                className="gap-2"
                onClick={() => setShowPasswordDialog(true)}
            >
                <span className="text-xl">
                    <PiLockDuotone />
                </span>
                <span>Change Password</span>
            </Dropdown.Item>
            <Dropdown.Item variant="divider" />
            <Dropdown.Item
                eventKey="Sign Out"
                className="gap-2"
                onClick={handleSignOut}
            >
                <span className="text-xl">
                    <PiSignOutDuotone />
                </span>
                <span>Sign Out</span>
            </Dropdown.Item>
            </Dropdown>
            
            <ChangePasswordDialog 
                isOpen={showPasswordDialog}
                onClose={() => setShowPasswordDialog(false)}
            />
        </>
    )
}

const UserDropdown = withHeaderItem(_UserDropdown)

export default UserDropdown
