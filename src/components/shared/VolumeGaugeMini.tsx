import React from 'react'
import classNames from '@/components/ui/utils/classNames'

interface VolumeGaugeMiniProps {
    currentVolume: number | string
    maxVolume: number | string
    size?: 'xs' | 'sm' | 'md'
    className?: string
}

const VolumeGaugeMini: React.FC<VolumeGaugeMiniProps> = ({
    currentVolume,
    maxVolume,
    size = 'sm',
    className,
}) => {
    const current =
        typeof currentVolume === 'string'
            ? parseFloat(currentVolume)
            : currentVolume
    const max =
        typeof maxVolume === 'string' ? parseFloat(maxVolume) : maxVolume
    const percentage = max > 0 ? (current / max) * 100 : 0

    // Determine color based on percentage
    const getColor = () => {
        if (percentage >= 70) return 'bg-emerald-500'
        if (percentage >= 40) return 'bg-yellow-500'
        if (percentage >= 20) return 'bg-orange-500'
        return 'bg-red-500'
    }

    const sizeClasses = {
        xs: 'w-8 h-8',
        sm: 'w-12 h-12',
        md: 'w-16 h-16',
    }

    const textSizeClasses = {
        xs: 'text-xs',
        sm: 'text-sm',
        md: 'text-base',
    }

    return (
        <div className={classNames('relative', sizeClasses[size], className)}>
            {/* Background circle */}
            <svg className="w-full h-full transform -rotate-90">
                <circle
                    cx="50%"
                    cy="50%"
                    r="45%"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8%"
                    className="text-gray-200"
                />
                {/* Filled arc */}
                <circle
                    cx="50%"
                    cy="50%"
                    r="45%"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8%"
                    strokeDasharray={`${percentage * 2.83} 283`}
                    strokeLinecap="round"
                    className={classNames(
                        'transition-all duration-300',
                        getColor(),
                    )}
                />
            </svg>
            {/* Percentage text */}
            <div className="absolute inset-0 flex items-center justify-center">
                <span
                    className={classNames('font-medium', textSizeClasses[size])}
                >
                    {Math.round(percentage)}%
                </span>
            </div>
        </div>
    )
}

export default VolumeGaugeMini
