'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import Dropdown from '@/components/ui/Dropdown'
import { 
  PiDownloadDuotone,
  PiFileCsvDuotone,
  PiFilePdfDuotone
} from 'react-icons/pi'
import { toast } from 'react-hot-toast'
import { exportTable, ExportColumn, ExportFormat } from '@/utils/export.utils'

export interface TableExportButtonProps {
  data: any[]
  columns: ExportColumn[]
  filename?: string
  title?: string
  formats?: ExportFormat[]
  loading?: boolean
  disabled?: boolean
  size?: 'xs' | 'sm' | 'md' | 'lg'
  variant?: 'solid' | 'plain' | 'default'
  className?: string
  orientation?: 'portrait' | 'landscape'
  buttonText?: string
  onExportStart?: () => void
  onExportComplete?: () => void
  onExportError?: (error: Error) => void
}

const formatIcons: Record<ExportFormat, React.ReactNode> = {
  csv: <PiFileCsvDuotone className="text-green-600" />,
  pdf: <PiFilePdfDuotone className="text-red-600" />
}

const formatLabels: Record<ExportFormat, string> = {
  csv: 'Export as CSV',
  pdf: 'Export as PDF'
}

export default function TableExportButton({
  data,
  columns,
  filename,
  title = 'Export Report',
  formats = ['csv', 'pdf'],
  loading = false,
  disabled = false,
  size = 'sm',
  variant = 'plain',
  className = '',
  orientation = 'landscape',
  buttonText = 'Export',
  onExportStart,
  onExportComplete,
  onExportError
}: TableExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async (format: ExportFormat) => {
    // Check if there's data to export
    if (!data || data.length === 0) {
      toast.error('No data available to export')
      return
    }

    try {
      setIsExporting(true)
      onExportStart?.()
      
      // Perform export
      exportTable({
        data,
        columns,
        format,
        filename,
        title,
        orientation: format === 'pdf' ? orientation : undefined
      })
      
      toast.success(`Successfully exported ${data.length} records as ${format.toUpperCase()}`)
      onExportComplete?.()
    } catch (error) {
      const err = error as Error
      toast.error(err.message || 'Failed to export data')
      console.error('Export error:', error)
      onExportError?.(err)
    } finally {
      setIsExporting(false)
    }
  }

  const isLoading = loading || isExporting
  const isDisabled = disabled || isLoading || !data || data.length === 0

  // If only one format is available, render a simple button
  if (formats.length === 1) {
    return (
      <Button
        variant={variant}
        size={size}
        icon={<PiDownloadDuotone />}
        loading={isLoading}
        disabled={isDisabled}
        onClick={() => handleExport(formats[0])}
        className={className}
      >
        {buttonText}
      </Button>
    )
  }

  // Multiple formats - render dropdown
  return (
    <Dropdown
      renderTitle={
        <Button
          variant={variant}
          size={size}
          icon={<PiDownloadDuotone />}
          loading={isLoading}
          disabled={isDisabled}
          className={className}
        >
          {buttonText}
        </Button>
      }
    >
      {formats.map((format) => (
        <Dropdown.Item
          key={format}
          eventKey={format}
          onClick={() => handleExport(format)}
          disabled={isLoading}
        >
          <span className="flex items-center gap-2">
            {formatIcons[format]}
            <span>{formatLabels[format]}</span>
          </span>
        </Dropdown.Item>
      ))}
    </Dropdown>
  )
}