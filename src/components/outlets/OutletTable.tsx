'use client'

import { useMemo } from 'react'
import Tag from '@/components/ui/Tag'
import Tooltip from '@/components/ui/Tooltip'
import DataTable from '@/components/shared/DataTable'
import { useOutletStore } from '@/stores/useOutletStore'
import useAppendQueryParams from '@/utils/hooks/useAppendQueryParams'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PiPencilDuotone, PiEyeDuotone, PiProhibitDuotone } from 'react-icons/pi'
import type { OnSortParam, ColumnDef } from '@/components/shared/DataTable'
import type { Outlet } from '@/types/outlet'

type OutletTableProps = {
    outletsTotal: number
    pageIndex?: number
    pageSize?: number
}

const statusColor: Record<string, string> = {
    active: 'bg-emerald-200 dark:bg-emerald-200 text-gray-900 dark:text-gray-900',
    inactive: 'bg-red-200 dark:bg-red-200 text-gray-900 dark:text-gray-900'
}

const NameColumn = ({ row }: { row: Outlet }) => {
    return (
        <div className="flex items-center">
            <Link
                className={`hover:text-primary font-semibold text-gray-900 dark:text-gray-100`}
                href={`/admin/outlets/${row.id}`}
            >
                {row.name}
            </Link>
        </div>
    )
}

const ActionColumn = ({
    row,
    onEdit,
    onViewDetail,
    onDeactivate
}: {
    row: Outlet
    onEdit: () => void
    onViewDetail: () => void
    onDeactivate: () => void
}) => {
    return (
        <div className="flex items-center gap-3">
            <Tooltip title="View Details">
                <div
                    className={`text-xl cursor-pointer select-none font-semibold`}
                    role="button"
                    onClick={onViewDetail}
                >
                    <PiEyeDuotone />
                </div>
            </Tooltip>
            <Tooltip title="Edit">
                <div
                    className={`text-xl cursor-pointer select-none font-semibold`}
                    role="button"
                    onClick={onEdit}
                >
                    <PiPencilDuotone />
                </div>
            </Tooltip>
            {row.status === 'active' && (
                <Tooltip title="Deactivate">
                    <div
                        className={`text-xl cursor-pointer select-none font-semibold text-red-600`}
                        role="button"
                        onClick={onDeactivate}
                    >
                        <PiProhibitDuotone />
                    </div>
                </Tooltip>
            )}
        </div>
    )
}

const OutletTable = ({
    outletsTotal,
    pageIndex = 1,
    pageSize = 10
}: OutletTableProps) => {
    const router = useRouter()

    const outlets = useOutletStore((state) => state.outlets || [])
    console.log('Outlets:', outlets)
    const isInitialLoading = useOutletStore((state) => state.isInitialLoading)
    const deactivateOutlet = useOutletStore((state) => state.deactivateOutlet)

    const { onAppendQueryParams } = useAppendQueryParams()

    const handleEdit = (outlet: Outlet) => {
        router.push(`/admin/outlets/${outlet.id}/edit`)
    }

    const handleViewDetails = (outlet: Outlet) => {
        router.push(`/admin/outlets/${outlet.id}`)
    }

    const handleDeactivate = async (outlet: Outlet) => {
        if (
            window.confirm(
                `Are you sure you want to deactivate ${outlet.name}?`,
            )
        ) {
            try {
                await deactivateOutlet(outlet.id)
            } catch (error) {
                console.error('Failed to deactivate outlet:', error)
            }
        }
    }

    const columns: ColumnDef<Outlet>[] = useMemo(
        () => [
            {
                header: 'Name',
                accessorKey: 'name',
                cell: (props) => {
                    const row = props.row.original
                    return <NameColumn row={row} />
                }
            },
            {
                header: 'Location',
                accessorKey: 'location'
            },
            {
                header: 'Contact Phone',
                accessorKey: 'contactPhone'
            },
            {
                header: 'Contact Email',
                accessorKey: 'contactEmail'
            },
            {
                header: 'Manager',
                accessorKey: 'manager',
                cell: (props) => {
                    const manager = props.row.original.manager
                    return manager ? (
                        <span>{`${manager.firstName} ${manager.lastName}`}</span>
                    ) : (
                        <span className="text-gray-400">
                            No manager assigned
                        </span>
                    )
                }
            },
            {
                header: 'Status',
                accessorKey: 'status',
                cell: (props) => {
                    const row = props.row.original
                    return (
                        <div className="flex items-center">
                            <Tag className={statusColor[row.status]}>
                                <span className="capitalize">{row.status}</span>
                            </Tag>
                        </div>
                    )
                }
            },
            {
                header: '',
                id: 'action',
                cell: (props) => (
                    <ActionColumn
                        row={props.row.original}
                        onEdit={() => handleEdit(props.row.original)}
                        onViewDetail={() =>
                            handleViewDetails(props.row.original)
                        }
                        onDeactivate={() =>
                            handleDeactivate(props.row.original)
                        }
                    />
                )
            },
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    )

    const handlePaginationChange = (page: number) => {
        onAppendQueryParams({
            pageIndex: String(page)
        })
    }

    const handleSelectChange = (value: number) => {
        onAppendQueryParams({
            pageSize: String(value),
            pageIndex: '1'
        })
    }

    const handleSort = (sort: OnSortParam) => {
        onAppendQueryParams({
            order: sort.order,
            sortKey: sort.key
        })
    }

    return (
        <DataTable
            columns={columns}
            data={outlets}
            noData={!outlets || outlets.length === 0}
            loading={isInitialLoading}
            pagingData={{
                total: outletsTotal,
                pageIndex,
                pageSize
            }}
            onPaginationChange={handlePaginationChange}
            onSelectChange={handleSelectChange}
            onSort={handleSort}
        />
    )
}

export default OutletTable
