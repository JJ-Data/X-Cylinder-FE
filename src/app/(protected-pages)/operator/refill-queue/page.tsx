'use client'

import { useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { 
    PiPackageDuotone, 
    PiClockDuotone, 
    PiCheckCircleDuotone, 
    PiWarningCircleDuotone,
    PiDotsSixVerticalDuotone,
    PiStarDuotone,
    PiUserDuotone,
    PiCalendarDuotone,
    PiTimerDuotone,
    PiArrowUpDuotone,
    PiArrowDownDuotone,
    PiFunnelDuotone,
    PiSortAscendingDuotone,
    PiPlayDuotone,
    PiXDuotone
} from 'react-icons/pi'
import { useCylinders } from '@/hooks/useCylinders'
import { useRefillMutations } from '@/hooks/useRefills'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { formatCurrency, formatDate } from '@/utils/format'
import { CylinderStatus } from '@/types/cylinder'
import type { Cylinder } from '@/types/cylinder'
import { useSession } from 'next-auth/react'

type Priority = 'high' | 'medium' | 'low'
type SortOption = 'priority' | 'time' | 'customer' | 'type'

interface QueueItem extends Cylinder {
    priority: Priority
    waitingTime: number
    estimatedDuration: number
    queuePosition: number
}

export default function RefillQueuePage() {
    const _router = useRouter()
    const { data: session } = useSession()
    const [selectedCylinder, setSelectedCylinder] = useState<QueueItem | null>(null)
    const [volume, setVolume] = useState(0)
    const [isProcessing, setIsProcessing] = useState(false)
    const [sortBy, setSortBy] = useState<SortOption>('priority')
    const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all')
    const [draggedItem, setDraggedItem] = useState<QueueItem | null>(null)
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

    const outletId = session?.user?.outletId
        ? parseInt(session.user.outletId)
        : undefined

    // Get cylinders in refill queue
    const {
        data,
        error: _error,
        isLoading,
        mutate,
    } = useCylinders({
        status: CylinderStatus.IN_REFILL,
        outletId,
        limit: 50,
    })

    const { createRefill } = useRefillMutations()

    // Transform cylinders into queue items with priority and timing
    const queueItems = useMemo<QueueItem[]>(() => {
        if (!data?.data) return []
        
        return data.data.map((cylinder, index) => {
            const hasCustomer = !!cylinder.currentLease
            const waitingTime = Math.floor(Math.random() * 120) + 30 // Mock waiting time
            
            // Determine priority based on customer status and waiting time
            let priority: Priority = 'medium'
            if (hasCustomer && waitingTime > 90) priority = 'high'
            else if (hasCustomer) priority = 'medium'
            else if (waitingTime > 60) priority = 'medium'
            else priority = 'low'
            
            const defaultDurations: Record<string, number> = {
                SMALL: 15,
                MEDIUM: 25,
                LARGE: 35,
                INDUSTRIAL: 45,
            }
            
            return {
                ...cylinder,
                priority,
                waitingTime,
                estimatedDuration: defaultDurations[cylinder.type] || 25,
                queuePosition: index + 1,
            }
        })
    }, [data?.data])

    // Filtered and sorted queue items
    const filteredAndSortedItems = useMemo(() => {
        let filtered = queueItems
        
        if (filterPriority !== 'all') {
            filtered = filtered.filter(item => item.priority === filterPriority)
        }
        
        return filtered.sort((a, b) => {
            switch (sortBy) {
                case 'priority':
                    const priorityOrder = { high: 3, medium: 2, low: 1 }
                    return priorityOrder[b.priority] - priorityOrder[a.priority]
                case 'time':
                    return b.waitingTime - a.waitingTime
                case 'customer':
                    return (b.currentLease ? 1 : 0) - (a.currentLease ? 1 : 0)
                case 'type':
                    return a.type.localeCompare(b.type)
                default:
                    return 0
            }
        })
    }, [queueItems, sortBy, filterPriority])

    const getPriorityColor = useCallback((priority: Priority) => {
        switch (priority) {
            case 'high': return 'from-red-50 to-red-100 border-red-200'
            case 'medium': return 'from-yellow-50 to-yellow-100 border-yellow-200'
            case 'low': return 'from-green-50 to-green-100 border-green-200'
        }
    }, [])

    const getPriorityIcon = useCallback((priority: Priority) => {
        switch (priority) {
            case 'high': return <PiStarDuotone className="h-4 w-4 text-red-600" />
            case 'medium': return <PiStarDuotone className="h-4 w-4 text-yellow-600" />
            case 'low': return <PiStarDuotone className="h-4 w-4 text-green-600" />
        }
    }, [])

    // Drag and drop handlers
    const handleDragStart = useCallback((e: React.DragEvent, item: QueueItem) => {
        setDraggedItem(item)
        e.dataTransfer.effectAllowed = 'move'
    }, [])

    const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
        setDragOverIndex(index)
    }, [])

    const handleDragLeave = useCallback(() => {
        setDragOverIndex(null)
    }, [])

    const handleDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
        e.preventDefault()
        if (!draggedItem) return
        
        // Here you would update the queue order in your backend
        console.log(`Moving ${draggedItem.cylinderCode} to position ${dropIndex + 1}`)
        
        setDraggedItem(null)
        setDragOverIndex(null)
    }, [draggedItem])

    const handleRefillStart = (cylinder: QueueItem) => {
        setSelectedCylinder(cylinder)
        // Set default volume based on cylinder type
        const defaultVolumes: Record<string, number> = {
            SMALL: 10,
            MEDIUM: 25,
            LARGE: 35,
            INDUSTRIAL: 50,
        }
        setVolume(defaultVolumes[cylinder.type] || 25)
    }

    const handleRefillComplete = async () => {
        if (!selectedCylinder || volume <= 0) return

        setIsProcessing(true)
        try {
            await createRefill({
                cylinderId: selectedCylinder.id,
                volume,
                cost: calculateCost(volume),
                paymentMethod: 'CASH',
                notes: `Refilled from queue - Priority: ${selectedCylinder.priority}`,
            })

            // Refresh the queue
            mutate()

            // Reset selection
            setSelectedCylinder(null)
            setVolume(0)

            // Show success
            alert('Refill completed successfully!')
        } catch (err) {
            console.error('Failed to complete refill:', err)
            alert('Failed to complete refill')
        } finally {
            setIsProcessing(false)
        }
    }

    const calculateCost = (volume: number) => {
        return volume * 50 // ₦50 per liter
    }

    const getWaitingTimeColor = (minutes: number) => {
        if (minutes > 90) return 'text-red-600 bg-red-100'
        if (minutes > 60) return 'text-yellow-600 bg-yellow-100'
        return 'text-green-600 bg-green-100'
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Intelligent Refill Queue
                        </h1>
                        <p className="text-gray-600">
                            Priority-based queue management with drag & drop reordering
                        </p>
                    </div>
                    <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        {filteredAndSortedItems.length} items in queue
                    </div>
                </div>
            </div>

            {/* Enhanced Queue Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-orange-600 rounded-lg">
                            <PiPackageDuotone className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-orange-900">
                            {queueItems.length}
                        </span>
                    </div>
                    <div className="text-sm font-medium text-orange-700">Total in Queue</div>
                    <div className="text-xs text-orange-600 mt-1">Across all priorities</div>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-red-600 rounded-lg">
                            <PiStarDuotone className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-red-900">
                            {queueItems.filter(item => item.priority === 'high').length}
                        </span>
                    </div>
                    <div className="text-sm font-medium text-red-700">High Priority</div>
                    <div className="text-xs text-red-600 mt-1">Needs immediate attention</div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-blue-600 rounded-lg">
                            <PiUserDuotone className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-blue-900">
                            {queueItems.filter(item => item.currentLease).length}
                        </span>
                    </div>
                    <div className="text-sm font-medium text-blue-700">Customer Waiting</div>
                    <div className="text-xs text-blue-600 mt-1">With active lease</div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-green-600 rounded-lg">
                            <PiTimerDuotone className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-green-900">
                            {Math.round(queueItems.reduce((sum, item) => sum + item.estimatedDuration, 0) / queueItems.length) || 0}
                        </span>
                    </div>
                    <div className="text-sm font-medium text-green-700">Avg Duration</div>
                    <div className="text-xs text-green-600 mt-1">Minutes per refill</div>
                </div>
            </div>

            {/* Controls */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <PiSortAscendingDuotone className="h-5 w-5 text-gray-400" />
                            <label className="text-sm font-medium text-gray-700">Sort by:</label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as SortOption)}
                                className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="priority">Priority</option>
                                <option value="time">Waiting Time</option>
                                <option value="customer">Customer Status</option>
                                <option value="type">Cylinder Type</option>
                            </select>
                        </div>

                        <div className="flex items-center space-x-2">
                            <PiFunnelDuotone className="h-5 w-5 text-gray-400" />
                            <label className="text-sm font-medium text-gray-700">Filter:</label>
                            <select
                                value={filterPriority}
                                onChange={(e) => setFilterPriority(e.target.value as Priority | 'all')}
                                className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Priorities</option>
                                <option value="high">High Priority</option>
                                <option value="medium">Medium Priority</option>
                                <option value="low">Low Priority</option>
                            </select>
                        </div>
                    </div>

                    <div className="text-sm text-gray-600 bg-blue-50 px-3 py-2 rounded-lg">
                        <span className="font-medium">💡 Tip:</span> Drag items to reorder the queue
                    </div>
                </div>
            </div>

            {/* Enhanced Queue List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">Refill Queue</h2>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <PiDotsSixVerticalDuotone className="h-4 w-4" />
                            <span>Drag to reorder</span>
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="p-12 text-center">
                        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-gray-500">Loading queue...</p>
                    </div>
                ) : filteredAndSortedItems.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <PiPackageDuotone className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Queue is Empty</h3>
                        <p className="text-gray-500">No cylinders waiting for refill</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {filteredAndSortedItems.map((item, index) => (
                            <div
                                key={item.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, item)}
                                onDragOver={(e) => handleDragOver(e, index)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, index)}
                                className={`relative p-6 transition-all duration-200 cursor-move hover:bg-gray-50 ${
                                    dragOverIndex === index ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                                } ${draggedItem?.id === item.id ? 'opacity-50' : ''}`}
                            >
                                <div className={`bg-gradient-to-r ${getPriorityColor(item.priority)} rounded-xl p-4 border`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="flex items-center space-x-2">
                                                <PiDotsSixVerticalDuotone className="h-5 w-5 text-gray-400" />
                                                <div className="flex items-center space-x-2">
                                                    {getPriorityIcon(item.priority)}
                                                    <span className="text-sm font-medium text-gray-600">
                                                        #{item.queuePosition}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <Button
                                            variant="solid"
                                            size="sm"
                                            onClick={() => handleRefillStart(item)}
                                            className="bg-blue-600 hover:bg-blue-700"
                                        >
                                            <PiPlayDuotone className="h-4 w-4 mr-2" />
                                            Start Refill
                                        </Button>
                                    </div>

                                    <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
                                        {/* Cylinder Info */}
                                        <div>
                                            <h3 className="font-semibold text-gray-900 text-lg mb-2">
                                                {item.cylinderCode || item.code}
                                            </h3>
                                            <div className="space-y-1">
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <PiPackageDuotone className="h-4 w-4 mr-2" />
                                                    <span>{item.type} Cylinder</span>
                                                </div>
                                                <div className="flex items-center text-sm">
                                                    <PiTimerDuotone className="h-4 w-4 mr-2 text-gray-400" />
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getWaitingTimeColor(item.waitingTime)}`}>
                                                        {item.waitingTime}min waiting
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Customer Info */}
                                        <div>
                                            {item.currentLease ? (
                                                <div className="bg-white bg-opacity-70 rounded-lg p-3">
                                                    <div className="flex items-center text-sm font-medium text-blue-800 mb-2">
                                                        <PiUserDuotone className="h-4 w-4 mr-2" />
                                                        Customer Waiting
                                                    </div>
                                                    <div className="text-sm text-gray-700">
                                                        <div className="font-medium">
                                                            {item.currentLease.customer?.firstName} {item.currentLease.customer?.lastName}
                                                        </div>
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            {item.currentLease.customer?.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-sm text-gray-500 italic">
                                                    No customer assigned
                                                </div>
                                            )}
                                        </div>

                                        {/* Timing Info */}
                                        <div className="text-right">
                                            <div className="text-sm text-gray-600 mb-2">
                                                <div className="flex items-center justify-end">
                                                    <PiCalendarDuotone className="h-4 w-4 mr-2" />
                                                    <span>Est. {item.estimatedDuration}min</span>
                                                </div>
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                Priority: <span className="font-medium capitalize">{item.priority}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Enhanced Refill Modal */}
            {selectedCylinder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <PiPlayDuotone className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900">
                                        Start Refill Process
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        {selectedCylinder.cylinderCode || selectedCylinder.code}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setSelectedCylinder(null)
                                    setVolume(0)
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <PiXDuotone className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 space-y-6">
                            {/* Cylinder Details */}
                            <div className={`bg-gradient-to-r ${getPriorityColor(selectedCylinder.priority)} rounded-lg p-4 border`}>
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center space-x-2">
                                        {getPriorityIcon(selectedCylinder.priority)}
                                        <span className="font-semibold text-gray-900 capitalize">
                                            {selectedCylinder.priority} Priority
                                        </span>
                                    </div>
                                    <span className="text-sm text-gray-600">
                                        Type: {selectedCylinder.type}
                                    </span>
                                </div>
                                
                                {selectedCylinder.currentLease && (
                                    <div className="bg-white bg-opacity-70 rounded-lg p-3">
                                        <div className="flex items-center text-sm text-blue-800 mb-1">
                                            <PiUserDuotone className="h-4 w-4 mr-2" />
                                            <span className="font-medium">Customer waiting</span>
                                        </div>
                                        <div className="text-sm text-gray-700">
                                            {selectedCylinder.currentLease.customer?.firstName} {selectedCylinder.currentLease.customer?.lastName}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Volume Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Refill Volume (Liters)
                                </label>
                                <input
                                    type="number"
                                    value={volume}
                                    onChange={(e) => setVolume(Number(e.target.value))}
                                    min="0"
                                    max="50"
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                                    placeholder="Enter volume"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Recommended: {selectedCylinder.type === 'SMALL' ? '10L' : selectedCylinder.type === 'MEDIUM' ? '25L' : selectedCylinder.type === 'LARGE' ? '35L' : '50L'}
                                </p>
                            </div>

                            {/* Cost Summary */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-gray-600">Volume:</span>
                                    <span className="font-medium">{volume}L</span>
                                </div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-gray-600">Rate:</span>
                                    <span className="font-medium">₦50 per liter</span>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                                    <span className="font-semibold text-gray-900">Total Cost:</span>
                                    <span className="text-xl font-bold text-green-600">
                                        {formatCurrency(calculateCost(volume))}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Modal Actions */}
                        <div className="flex gap-4 p-6 bg-gray-50 rounded-b-xl">
                            <Button
                                variant="plain"
                                onClick={() => {
                                    setSelectedCylinder(null)
                                    setVolume(0)
                                }}
                                className="flex-1 h-12"
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="solid"
                                onClick={handleRefillComplete}
                                loading={isProcessing}
                                disabled={volume <= 0}
                                className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-lg font-semibold"
                            >
                                {isProcessing ? 'Processing...' : 'Complete Refill'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
