import React from 'react'
import { Gauge } from 'lucide-react'

interface VolumeGaugeProps {
    current: number
    max: number
    label?: string
    showPercentage?: boolean
    colorScheme?: 'blue' | 'green' | 'orange' | 'red'
    size?: 'sm' | 'md' | 'lg'
    className?: string
}

export function VolumeGauge({
    current,
    max,
    label,
    showPercentage = true,
    colorScheme = 'blue',
    size = 'md',
    className = '',
}: VolumeGaugeProps) {
    const percentage = max > 0 ? (current / max) * 100 : 0
    const safePercentage = Math.min(100, Math.max(0, percentage))

    const sizeClasses = {
        sm: 'h-32 w-32',
        md: 'h-48 w-48',
        lg: 'h-64 w-64',
    }

    const textSizes = {
        sm: 'text-lg',
        md: 'text-2xl',
        lg: 'text-3xl',
    }

    const labelSizes = {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
    }

    const colors = {
        blue: {
            track: 'stroke-blue-200',
            fill: 'stroke-blue-500',
            text: 'text-blue-600',
        },
        green: {
            track: 'stroke-green-200',
            fill: 'stroke-green-500',
            text: 'text-green-600',
        },
        orange: {
            track: 'stroke-orange-200',
            fill: 'stroke-orange-500',
            text: 'text-orange-600',
        },
        red: {
            track: 'stroke-red-200',
            fill: 'stroke-red-500',
            text: 'text-red-600',
        },
    }

    const color = colors[colorScheme]

    // Calculate stroke dasharray for circular progress
    const radius = 45
    const circumference = 2 * Math.PI * radius
    const strokeDasharray = `${(safePercentage / 100) * circumference} ${circumference}`

    return (
        <div
            className={`relative inline-flex flex-col items-center ${className}`}
        >
            <div className={`relative ${sizeClasses[size]}`}>
                <svg
                    className="transform -rotate-90"
                    width="100%"
                    height="100%"
                    viewBox="0 0 100 100"
                >
                    {/* Background circle */}
                    <circle
                        cx="50"
                        cy="50"
                        r={radius}
                        fill="none"
                        className={color.track}
                        strokeWidth="8"
                    />

                    {/* Progress circle */}
                    <circle
                        cx="50"
                        cy="50"
                        r={radius}
                        fill="none"
                        className={`${color.fill} transition-all duration-500 ease-out`}
                        strokeWidth="8"
                        strokeDasharray={strokeDasharray}
                        strokeLinecap="round"
                    />
                </svg>

                {/* Center content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Gauge className={`h-6 w-6 ${color.text} mb-1`} />
                    <div
                        className={`font-bold ${textSizes[size]} ${color.text}`}
                    >
                        {current.toFixed(1)}
                    </div>
                    <div className={`${labelSizes[size]} text-gray-600`}>
                        / {max} kg
                    </div>
                    {showPercentage && (
                        <div
                            className={`${labelSizes[size]} text-gray-500 mt-1`}
                        >
                            {safePercentage.toFixed(0)}%
                        </div>
                    )}
                </div>
            </div>

            {label && (
                <div
                    className={`mt-2 text-center ${labelSizes[size]} text-gray-700`}
                >
                    {label}
                </div>
            )}
        </div>
    )
}

// Mini version for inline use
export function VolumeGaugeMini({
    current,
    max,
    className = '',
}: {
    current: number
    max: number
    className?: string
}) {
    const percentage = max > 0 ? (current / max) * 100 : 0
    const safePercentage = Math.min(100, Math.max(0, percentage))

    const getColor = () => {
        if (safePercentage >= 75) return 'bg-green-500'
        if (safePercentage >= 50) return 'bg-blue-500'
        if (safePercentage >= 25) return 'bg-yellow-500'
        return 'bg-red-500'
    }

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <Gauge className="h-4 w-4 text-gray-400" />
            <div className="flex-1">
                <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium">{current.toFixed(1)} kg</span>
                    <span className="text-gray-500">/ {max} kg</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className={`h-full ${getColor()} transition-all duration-300`}
                        style={{ width: `${safePercentage}%` }}
                    />
                </div>
            </div>
        </div>
    )
}
