'use client'

import Card from '@/components/ui/Card'
import Tag from '@/components/ui/Tag'
import Button from '@/components/ui/Button'
import Dropdown from '@/components/ui/Dropdown'
import {
  PiEyeDuotone,
  PiPencilDuotone,
  PiTrashDuotone,
  PiDotsThreeVerticalDuotone,
  PiCheckCircleDuotone,
  PiXCircleDuotone,
  PiEnvelopeDuotone,
  PiPhoneDuotone,
  PiCalendarDuotone,
  PiCrownDuotone,
  PiUserGearDuotone,
  PiGasPumpDuotone,
  PiUserDuotone,
} from 'react-icons/pi'
import { UserRole, type User } from '@/types/user'
import { format } from 'date-fns'

interface UserCardProps {
  user: User
  onView?: () => void
  onEdit?: () => void
  onStatusToggle?: () => void
  onDelete?: () => void
  hasDeletePermission?: boolean
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
      return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' }
    case UserRole.STAFF:
      return { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' }
    case UserRole.REFILL_OPERATOR:
      return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' }
    case UserRole.CUSTOMER:
      return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' }
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' }
  }
}

export default function UserCard({
  user,
  onView,
  onEdit,
  onStatusToggle,
  onDelete,
  hasDeletePermission = false,
}: UserCardProps) {
  const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
  const roleStyle = getRoleColor(user.role)
  const statusStyle = user.isActive
    ? { icon: <PiCheckCircleDuotone />, color: 'text-green-600', bg: 'bg-green-100' }
    : { icon: <PiXCircleDuotone />, color: 'text-red-600', bg: 'bg-red-100' }

  return (
    <Card className="hover:shadow-md transition-shadow duration-200 p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${roleStyle.bg} ${roleStyle.text}`}>
            {initials}
          </div>
          <div>
            <p className="font-semibold text-gray-900">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
              <PiEnvelopeDuotone className="text-sm" />
              {user.email}
            </p>
          </div>
        </div>
        <Tag className={`${statusStyle.bg} ${statusStyle.color} text-xs`}>
          <span className="flex items-center gap-1">
            {statusStyle.icon}
            {user.isActive ? 'Active' : 'Inactive'}
          </span>
        </Tag>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getRoleIcon(user.role)}
            <Tag className={`${roleStyle.bg} ${roleStyle.text} ${roleStyle.border} border text-xs capitalize`}>
              {user.role.replace('_', ' ').toLowerCase()}
            </Tag>
          </div>
          {user.outletId && (
            <span className="text-gray-500">Outlet #{user.outletId}</span>
          )}
        </div>
        
        {user.phoneNumber && (
          <div className="flex items-center gap-2 text-gray-600">
            <PiPhoneDuotone className="text-sm" />
            <span>{user.phoneNumber}</span>
          </div>
        )}
        
        <div className="flex items-center gap-2 text-gray-500">
          <PiCalendarDuotone className="text-sm" />
          <span>Joined {format(new Date(user.createdAt), 'MMM d, yyyy')}</span>
        </div>
      </div>

      <div className="flex gap-2 mt-4 pt-3 border-t">
        <Button
          size="sm"
          variant="plain"
          icon={<PiEyeDuotone />}
          onClick={onView}
          className="flex-1"
        >
          View Details
        </Button>
        <Dropdown
          renderTitle={
            <Button
              size="sm"
              variant="plain"
              icon={<PiDotsThreeVerticalDuotone />}
            />
          }
        >
            <Dropdown.Item eventKey="edit" onClick={onEdit}>
              <PiPencilDuotone className="mr-2" />
              Edit User
            </Dropdown.Item>
            <Dropdown.Item eventKey="status" onClick={onStatusToggle}>
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
            {hasDeletePermission && (
              <Dropdown.Item
                eventKey="delete"
                onClick={onDelete}
                className="text-red-600"
              >
                <PiTrashDuotone className="mr-2" />
                Delete User
              </Dropdown.Item>
            )}
        </Dropdown>
      </div>
    </Card>
  )
}