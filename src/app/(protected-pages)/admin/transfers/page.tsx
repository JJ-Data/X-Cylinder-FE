'use client'

import { useState } from 'react'
import { useTransferHistory } from '@/hooks/useTransferHistory'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Loading from '@/components/shared/Loading'
import Table from '@/components/ui/Table'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { 
  PiArrowsLeftRightDuotone, 
  PiEyeDuotone, 
  PiDownloadDuotone,
  PiFunnelDuotone 
} from 'react-icons/pi'
import TransferHistoryFilters from '@/components/transfers/TransferHistoryFilters'
import TransferDetailsModal from '@/components/transfers/TransferDetailsModal'
import { formatDate } from '@/utils/formatDate'
import { toast } from 'react-hot-toast'
import { transferService } from '@/services/api/transfer.service'
import type { Transfer, TransferFilters } from '@/types/transfer'

const { Tr, Th, Td, THead, TBody, Sorter } = Table

export default function TransferHistoryPage() {
  const [filters, setFilters] = useState<TransferFilters>({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'DESC'
  })
  const [showFilters, setShowFilters] = useState(false)
  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const { data, isLoading, error, mutate } = useTransferHistory(filters)

  const handleSort = (sortBy: string) => {
    setFilters(prev => ({
      ...prev,
      sortBy,
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'ASC' ? 'DESC' : 'ASC',
      page: 1
    }))
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }

  const handleFilterChange = (newFilters: Partial<TransferFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }))
  }

  const handleViewDetails = (transfer: Transfer) => {
    setSelectedTransfer(transfer)
    setShowDetailsModal(true)
  }

  const handleExport = async (format: 'csv' | 'excel' = 'csv') => {
    setDownloading(true)
    try {
      const blob = await transferService.exportTransfers({
        ...filters,
        format
      })
      const filename = `transfers-${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'csv'}`
      transferService.downloadTransfers(blob, filename)
      toast.success(`Transfers exported as ${format.toUpperCase()}`)
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export transfers')
    } finally {
      setDownloading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-500', text: 'Pending' },
      completed: { color: 'bg-emerald-500', text: 'Completed' },
      rejected: { color: 'bg-red-500', text: 'Rejected' }
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    
    return (
      <Badge content={config.text} innerClass={`${config.color} text-white`} />
    )
  }

  return (
    <Container>
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
              Transfer History
            </h3>
            <p className="text-sm text-gray-500">
              View and manage cylinder transfers between outlets
            </p>
          </div>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <Button
          variant="plain"
          icon={<PiFunnelDuotone />}
          onClick={() => setShowFilters(!showFilters)}
        >
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </Button>
        
        <Button
          variant="solid"
          icon={<PiDownloadDuotone />}
          onClick={() => handleExport('csv')}
          loading={downloading}
          disabled={downloading || !data?.transfers?.length}
        >
          Export CSV
        </Button>
      </div>

      {showFilters && (
        <div className="mb-6">
          <TransferHistoryFilters
            filters={filters}
            onFilterChange={handleFilterChange}
          />
        </div>
      )}

      <AdaptiveCard>
        <Loading loading={isLoading}>
          {error ? (
            <div className="text-center py-8">
              <p className="text-red-500">Failed to load transfers</p>
              <Button
                variant="plain"
                onClick={() => mutate()}
                className="mt-4"
              >
                Retry
              </Button>
            </div>
          ) : !data?.transfers?.length ? (
            <div className="text-center py-8">
              <PiArrowsLeftRightDuotone className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No transfers found</p>
            </div>
          ) : (
            <>
              <Table>
                <THead>
                  <Tr>
                    <Th
                      className="cursor-pointer"
                      onClick={() => handleSort('createdAt')}
                    >
                      Date
                      <Sorter
                        sort={filters.sortOrder === 'ASC' ? 'asc' : 'desc'}
                      />
                    </Th>
                    <Th>Cylinder</Th>
                    <Th>From Outlet</Th>
                    <Th>To Outlet</Th>
                    <Th>Initiated By</Th>
                    <Th>Status</Th>
                    <Th>Actions</Th>
                  </Tr>
                </THead>
                <TBody>
                  {data.transfers.map((transfer) => (
                    <Tr key={transfer.id}>
                      <Td>{formatDate(transfer.createdAt)}</Td>
                      <Td>
                        <span className="font-medium">
                          {transfer.cylinder?.cylinderCode || `ID: ${transfer.cylinderId}`}
                        </span>
                      </Td>
                      <Td>{transfer.fromOutlet?.name || `ID: ${transfer.fromOutletId}`}</Td>
                      <Td>{transfer.toOutlet?.name || `ID: ${transfer.toOutletId}`}</Td>
                      <Td>
                        {(transfer.initiatedBy || transfer.transferredBy)
                          ? `${(transfer.initiatedBy || transfer.transferredBy)?.firstName} ${(transfer.initiatedBy || transfer.transferredBy)?.lastName}`
                          : `ID: ${transfer.initiatedById || transfer.transferredById}`
                        }
                      </Td>
                      <Td>{getStatusBadge(transfer.status)}</Td>
                      <Td>
                        <Button
                          size="sm"
                          variant="plain"
                          icon={<PiEyeDuotone />}
                          onClick={() => handleViewDetails(transfer)}
                        >
                          View
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </TBody>
              </Table>

              {data.pagination && data.pagination.totalPages > 1 && (
                <div className="mt-4 flex justify-center">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="plain"
                      disabled={data.pagination.page === 1}
                      onClick={() => handlePageChange(data.pagination.page - 1)}
                    >
                      Previous
                    </Button>
                    <span className="flex items-center px-3 text-sm">
                      Page {data.pagination.page} of {data.pagination.totalPages}
                    </span>
                    <Button
                      size="sm"
                      variant="plain"
                      disabled={data.pagination.page === data.pagination.totalPages}
                      onClick={() => handlePageChange(data.pagination.page + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </Loading>
      </AdaptiveCard>

      {selectedTransfer && (
        <TransferDetailsModal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false)
            setSelectedTransfer(null)
          }}
          transfer={selectedTransfer}
          onUpdate={() => mutate()}
        />
      )}
    </Container>
  )
}