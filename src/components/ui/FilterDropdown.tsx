'use client'

import React from 'react'
import { ChevronDown } from 'lucide-react'

export interface FilterOption {
  value: string
  label: string
  count?: number
}

interface FilterDropdownProps {
  label: string
  options: FilterOption[]
  value: string | string[]
  onChange: (value: string | string[]) => void
  multiple?: boolean
  className?: string
}

export function FilterDropdown({
  label,
  options,
  value,
  onChange,
  multiple = false,
  className = '',
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (optionValue: string) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : []
      if (currentValues.includes(optionValue)) {
        onChange(currentValues.filter(v => v !== optionValue))
      } else {
        onChange([...currentValues, optionValue])
      }
    } else {
      onChange(optionValue)
      setIsOpen(false)
    }
  }

  const getDisplayText = () => {
    if (multiple && Array.isArray(value) && value.length > 0) {
      if (value.length === 1) {
        return options.find(opt => opt.value === value[0])?.label || label
      }
      return `${value.length} selected`
    } else if (!multiple && value) {
      return options.find(opt => opt.value === value)?.label || label
    }
    return label
  }

  const isSelected = (optionValue: string) => {
    if (multiple && Array.isArray(value)) {
      return value.includes(optionValue)
    }
    return value === optionValue
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex justify-between items-center w-full px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <span>{getDisplayText()}</span>
        <ChevronDown
          className={`ml-2 h-5 w-5 transition-transform ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          {options.length === 0 ? (
            <div className="px-4 py-2 text-gray-500">No options available</div>
          ) : (
            options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center justify-between ${
                  isSelected(option.value) ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                }`}
              >
                <span className="flex items-center">
                  {multiple && (
                    <input
                      type="checkbox"
                      checked={isSelected(option.value)}
                      onChange={() => {}}
                      className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  )}
                  {option.label}
                </span>
                {option.count !== undefined && (
                  <span className="text-gray-400 text-xs">({option.count})</span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}