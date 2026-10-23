'use client'

import { useState } from 'react'
import { useCylinders } from '@/hooks/useCylinders'
import { Skeleton } from '@/components/ui/Skeleton'
import { Alert } from '@/components/ui/Alert'
import { CYLINDER_TYPE_OPTIONS } from '@/constants/cylinder.constant'

export default function LeaseNewCylinderPage() {
    const [typeFilter, setTypeFilter] = useState('')

    const { data, error, isLoading } = useCylinders({
        status: 'available',
        type: typeFilter || undefined,
        limit: 50,
    })

    const cylinders = data?.data || []

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Lease New Cylinder
                </h1>
                <p className="text-gray-600">
                    Browse cylinders currently available across our outlets
                </p>
            </div>

            <Alert type="info" className="mb-6">
                To lease a cylinder, visit the outlet holding it with a valid
                ID - our staff will process the deposit and handover there.
            </Alert>

            {error && (
                <Alert type="danger" className="mb-6">
                    Failed to load available cylinders. Please try again
                    later.
                </Alert>
            )}

            <div className="mb-6 flex flex-wrap gap-2">
                <button
                    onClick={() => setTypeFilter('')}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        typeFilter === ''
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                    All Types
                </button>
                {CYLINDER_TYPE_OPTIONS.map((opt) => (
                    <button
                        key={opt.value}
                        onClick={() => setTypeFilter(opt.value)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                            typeFilter === opt.value
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                </div>
            ) : cylinders.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <p className="text-gray-500">
                        No available cylinders match this filter right now.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {cylinders.map((cylinder) => (
                        <div
                            key={cylinder.id}
                            className="bg-white rounded-lg shadow-md p-5"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-gray-900">
                                    {cylinder.cylinderCode}
                                </span>
                                <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded">
                                    Available
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">
                                Type: {cylinder.type}
                            </p>
                            <p className="text-sm text-gray-600">
                                Outlet:{' '}
                                {cylinder.currentOutlet?.name || 'Unknown'}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
