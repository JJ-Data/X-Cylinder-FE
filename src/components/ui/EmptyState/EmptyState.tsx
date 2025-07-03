import React from 'react'
import classNames from '../utils/classNames'

export interface EmptyStateProps {
  /** The title or main message to display */
  title: string
  /** Optional description or additional details */
  description?: string
  /** Optional icon to display */
  icon?: React.ReactNode
  /** Optional action button or link */
  action?: React.ReactNode
  /** Additional CSS classes */
  className?: string
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
  className
}) => {
  return (
    <div 
      className={classNames(
        'flex flex-col items-center justify-center p-8 text-center',
        className
      )}
    >
      {icon && (
        <div className="mb-4 text-gray-400">
          {icon}
        </div>
      )}
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      
      {description && (
        <p className="text-sm text-gray-600 max-w-md mb-4">
          {description}
        </p>
      )}
      
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  )
}

export default EmptyState