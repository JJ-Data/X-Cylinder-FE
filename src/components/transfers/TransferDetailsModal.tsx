'use client'

import { useState } from 'react'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Input from '@/components/ui/Input'
import Loading from '@/components/shared/Loading'
import {
  PiXDuotone,
  PiCheckCircleDuotone,
  PiXCircleDuotone,
  PiCubeDuotone,
  PiBuildingsDuotone,
  PiUserDuotone,
  PiCalendarDuotone,
  PiClockDuotone,
  PiNoteDuotone
} from 'react-icons/pi'
import { formatDate } from '@/utils/formatDate'
import { toast } from 'react-hot-toast'
import { transferService } from '@/services/api/transfer.service'
import type { Transfer } from '@/types/transfer'

interface TransferDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  transfer: Transfer
  onUpdate?: () => void
}

export default function TransferDetailsModal({
  isOpen,
  onClose,
  transfer,
  onUpdate
}: TransferDetailsModalProps) {
  const [accepting, setAccepting] = useState(false)
  const [rejecting, setRejecting] = useState(false)
  const [acceptNotes, setAcceptNotes] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [showAcceptForm, setShowAcceptForm] = useState(false)
  const [showRejectForm, setShowRejectForm] = useState(false)

  const handleAccept = async () => {
    if (!acceptNotes.trim()) {
      toast.error('Please add notes for acceptance')
      return
    }

    setAccepting(true)
    try {
      await transferService.acceptTransfer(transfer.id, acceptNotes)
      toast.success('Transfer accepted successfully')
      onUpdate?.()
      onClose()
    } catch (error: any) {
      console.error('Accept error:', error)
      const errorMessage = error.response?.data?.error || 'Failed to accept transfer'
      toast.error(errorMessage)
    } finally {
      setAccepting(false)
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason')
      return
    }

    setRejecting(true)
    try {
      await transferService.rejectTransfer(transfer.id, rejectionReason)
      toast.success('Transfer rejected')
      onUpdate?.()
      onClose()
    } catch (error: any) {
      console.error('Reject error:', error)
      const errorMessage = error.response?.data?.error || 'Failed to reject transfer'
      toast.error(errorMessage)
    } finally {
      setRejecting(false)
    }
  }

  const getStatusBadge = () => {
    const statusConfig = {
      pending: { color: 'bg-yellow-500', icon: <PiClockDuotone />, text: 'Pending' },
      completed: { color: 'bg-emerald-500', icon: <PiCheckCircleDuotone />, text: 'Completed' },
      rejected: { color: 'bg-red-500', icon: <PiXCircleDuotone />, text: 'Rejected' }
    }
    const config = statusConfig[transfer.status as keyof typeof statusConfig]
    
    return (
      <div className="flex items-center gap-2">
        <span className={`${config.color.replace('bg-', 'text-')}`}>
          {config.icon}
        </span>
        <Badge 
          content={config.text} 
          innerClass={`${config.color} text-white`} 
        />
      </div>
    )
  }

  return (
    <Dialog isOpen={isOpen} onClose={onClose} width={600}>
      <div className="flex items-center justify-between mb-4">
        <h4>Transfer Details</h4>
        <Button
          size="sm"
          variant="plain"
          shape="circle"
          icon={<PiXDuotone />}
          onClick={onClose}
        />
      </div>

      <Loading loading={false}>
        <div className="space-y-4">
          {/* Status Card */}
          <Card className="bg-gray-50">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Status</span>
              {getStatusBadge()}
            </div>
          </Card>

          {/* Transfer Information */}
          <Card>
            <h5 className="mb-3">Transfer Information</h5>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Transfer ID</p>
                  <p className="font-medium">#{transfer.id}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Created Date</p>
                  <p className="flex items-center gap-1">
                    <PiCalendarDuotone className="text-gray-400" />
                    {formatDate(transfer.createdAt)}
                  </p>
                </div>
                {transfer.acceptedAt && (
                  <div>
                    <p className="text-xs text-gray-500">Accepted Date</p>
                    <p className="flex items-center gap-1">
                      <PiCalendarDuotone className="text-gray-400" />
                      {formatDate(transfer.acceptedAt)}
                    </p>
                  </div>
                )}
                {transfer.rejectedAt && (
                  <div>
                    <p className="text-xs text-gray-500">Rejected Date</p>
                    <p className="flex items-center gap-1">
                      <PiCalendarDuotone className="text-gray-400" />
                      {formatDate(transfer.rejectedAt)}
                    </p>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Cylinder</p>
                  <p className="flex items-center gap-1">
                    <PiCubeDuotone className="text-gray-400" />
                    {transfer.cylinder?.cylinderCode || `ID: ${transfer.cylinderId}`}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Initiated By</p>
                  <p className="flex items-center gap-1">
                    <PiUserDuotone className="text-gray-400" />
                    {(transfer.initiatedBy || transfer.transferredBy)
                      ? `${(transfer.initiatedBy || transfer.transferredBy)?.firstName} ${(transfer.initiatedBy || transfer.transferredBy)?.lastName}`
                      : `User ID: ${transfer.initiatedById || transfer.transferredById}`
                    }
                  </p>
                </div>
                {transfer.acceptedBy && (
                  <div>
                    <p className="text-xs text-gray-500">Accepted By</p>
                    <p className="flex items-center gap-1">
                      <PiUserDuotone className="text-gray-400" />
                      {`${transfer.acceptedBy.firstName} ${transfer.acceptedBy.lastName}`}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Outlet Information */}
          <Card>
            <h5 className="mb-3">Outlet Information</h5>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">From Outlet</p>
                <div className="flex items-center gap-2">
                  <PiBuildingsDuotone className="text-gray-400" />
                  <div>
                    <p className="font-medium">{transfer.fromOutlet?.name || `ID: ${transfer.fromOutletId}`}</p>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">To Outlet</p>
                <div className="flex items-center gap-2">
                  <PiBuildingsDuotone className="text-gray-400" />
                  <div>
                    <p className="font-medium">{transfer.toOutlet?.name || `ID: ${transfer.toOutletId}`}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Notes */}
          {(transfer.notes || transfer.rejectionReason) && (
            <Card>
              <h5 className="mb-3">Notes</h5>
              {transfer.notes && (
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-1">Transfer Notes</p>
                  <p className="text-sm">{transfer.notes}</p>
                </div>
              )}
              {transfer.rejectionReason && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Rejection Reason</p>
                  <p className="text-sm text-red-600">{transfer.rejectionReason}</p>
                </div>
              )}
            </Card>
          )}

          {/* Action Forms */}
          {transfer.status === 'pending' && (
            <>
              {showAcceptForm && (
                <Card className="border-emerald-200">
                  <h5 className="mb-3">Accept Transfer</h5>
                  <Input
                    textArea
                    value={acceptNotes}
                    onChange={(e) => setAcceptNotes(e.target.value)}
                    placeholder="Add notes for acceptance..."
                    rows={3}
                    className="mb-3"
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="solid"
                      color="emerald"
                      onClick={handleAccept}
                      loading={accepting}
                      disabled={accepting || !acceptNotes.trim()}
                    >
                      Confirm Accept
                    </Button>
                    <Button
                      variant="plain"
                      onClick={() => {
                        setShowAcceptForm(false)
                        setAcceptNotes('')
                      }}
                      disabled={accepting}
                    >
                      Cancel
                    </Button>
                  </div>
                </Card>
              )}

              {showRejectForm && (
                <Card className="border-red-200">
                  <h5 className="mb-3">Reject Transfer</h5>
                  <Input
                    textArea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Provide reason for rejection..."
                    rows={3}
                    className="mb-3"
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="solid"
                      color="red"
                      onClick={handleReject}
                      loading={rejecting}
                      disabled={rejecting || !rejectionReason.trim()}
                    >
                      Confirm Reject
                    </Button>
                    <Button
                      variant="plain"
                      onClick={() => {
                        setShowRejectForm(false)
                        setRejectionReason('')
                      }}
                      disabled={rejecting}
                    >
                      Cancel
                    </Button>
                  </div>
                </Card>
              )}
            </>
          )}

          {/* Action Buttons */}
          {transfer.status === 'pending' && !showAcceptForm && !showRejectForm && (
            <div className="flex gap-3">
              <Button
                variant="solid"
                color="emerald"
                icon={<PiCheckCircleDuotone />}
                onClick={() => setShowAcceptForm(true)}
                className="flex-1"
              >
                Accept Transfer
              </Button>
              <Button
                variant="solid"
                color="red"
                icon={<PiXCircleDuotone />}
                onClick={() => setShowRejectForm(true)}
                className="flex-1"
              >
                Reject Transfer
              </Button>
            </div>
          )}
        </div>
      </Loading>
    </Dialog>
  )
}