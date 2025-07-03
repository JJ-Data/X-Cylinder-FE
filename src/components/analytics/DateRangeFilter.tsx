'use client'

import { useState } from 'react'
import DatePicker from '@/components/ui/DatePicker'
import Button from '@/components/ui/Button'
import Dropdown from '@/components/ui/Dropdown'
import { 
  PiCalendarDuotone,
  PiCaretDownDuotone 
} from 'react-icons/pi'
import { format, subDays, startOfWeek, startOfMonth, startOfYear } from 'date-fns'

export interface DateRange {
  startDate: Date | null
  endDate: Date | null
}

interface DateRangeFilterProps {
  value: DateRange
  onChange: (range: DateRange) => void
  showPresets?: boolean
}

const presetRanges = [
  { label: 'Today', getValue: () => ({ startDate: new Date(), endDate: new Date() }) },
  { label: 'Yesterday', getValue: () => ({ startDate: subDays(new Date(), 1), endDate: subDays(new Date(), 1) }) },
  { label: 'Last 7 days', getValue: () => ({ startDate: subDays(new Date(), 6), endDate: new Date() }) },
  { label: 'Last 30 days', getValue: () => ({ startDate: subDays(new Date(), 29), endDate: new Date() }) },
  { label: 'This week', getValue: () => ({ startDate: startOfWeek(new Date()), endDate: new Date() }) },
  { label: 'This month', getValue: () => ({ startDate: startOfMonth(new Date()), endDate: new Date() }) },
  { label: 'This year', getValue: () => ({ startDate: startOfYear(new Date()), endDate: new Date() }) },
]

export default function DateRangeFilter({
  value,
  onChange,
  showPresets = true
}: DateRangeFilterProps) {
  const [localRange, setLocalRange] = useState<[Date | null, Date | null]>([
    value.startDate,
    value.endDate
  ])

  const handleRangeChange = (dates: [Date | null, Date | null]) => {
    setLocalRange(dates)
    if (dates[0] && dates[1]) {
      onChange({ startDate: dates[0], endDate: dates[1] })
    }
  }

  const handlePresetSelect = (preset: typeof presetRanges[0]) => {
    const range = preset.getValue()
    setLocalRange([range.startDate, range.endDate])
    onChange(range)
  }

  const formatDateRange = () => {
    if (!value.startDate || !value.endDate) {
      return 'Select date range'
    }
    
    if (format(value.startDate, 'yyyy-MM-dd') === format(value.endDate, 'yyyy-MM-dd')) {
      return format(value.startDate, 'MMM dd, yyyy')
    }
    
    return `${format(value.startDate, 'MMM dd')} - ${format(value.endDate, 'MMM dd, yyyy')}`
  }

  return (
    <div className="flex items-center gap-2">
      {showPresets && (
        <Dropdown
          renderTitle={
            <Button
              variant="plain"
              size="sm"
              icon={<PiCaretDownDuotone />}
            >
              Quick Select
            </Button>
          }
        >
          {presetRanges.map((preset) => (
            <Dropdown.Item
              key={preset.label}
              eventKey={preset.label}
              onClick={() => handlePresetSelect(preset)}
            >
              {preset.label}
            </Dropdown.Item>
          ))}
        </Dropdown>
      )}
      
      <DatePicker.DatePickerRange
        placeholder="Select date range"
        value={localRange}
        onChange={handleRangeChange}
        inputPrefix={<PiCalendarDuotone className="text-gray-400" />}
        inputSuffix={
          <span className="text-sm text-gray-600">
            {formatDateRange()}
          </span>
        }
      />
    </div>
  )
}