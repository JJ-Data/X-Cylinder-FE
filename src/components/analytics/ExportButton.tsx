'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import Dropdown from '@/components/ui/Dropdown'
import { 
  PiDownloadDuotone,
  PiFileCsvDuotone,
  PiFileXlsDuotone,
  PiFilePdfDuotone
} from 'react-icons/pi'
import { toast } from 'react-hot-toast'

export type ExportFormat = 'csv' | 'excel' | 'pdf'

interface ExportButtonProps {
  onExport: (format: ExportFormat) => Promise<void>
  formats?: ExportFormat[]
  loading?: boolean
  disabled?: boolean
  size?: 'xs' | 'sm' | 'md' | 'lg'
}

const formatIcons: Record<ExportFormat, React.ReactNode> = {
  csv: <PiFileCsvDuotone />,
  excel: <PiFileXlsDuotone />,
  pdf: <PiFilePdfDuotone />
}

const formatLabels: Record<ExportFormat, string> = {
  csv: 'Export as CSV',
  excel: 'Export as Excel',
  pdf: 'Export as PDF'
}

export default function ExportButton({
  onExport,
  formats = ['csv', 'excel'],
  loading = false,
  disabled = false,
  size = 'sm'
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async (format: ExportFormat) => {
    try {
      setIsExporting(true)
      await onExport(format)
      toast.success(`Successfully exported as ${format.toUpperCase()}`)
    } catch (error) {
      toast.error('Failed to export data')
      console.error('Export error:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const isLoading = loading || isExporting

  if (formats.length === 1) {
    return (
      <Button
        variant="plain"
        size={size}
        icon={<PiDownloadDuotone />}
        loading={isLoading}
        disabled={disabled || isLoading}
        onClick={() => handleExport(formats[0])}
      >
        Export
      </Button>
    )
  }

  return (
    <Dropdown
      renderTitle={
        <Button
          variant="plain"
          size={size}
          icon={<PiDownloadDuotone />}
          loading={isLoading}
          disabled={disabled || isLoading}
        >
          Export
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
            {formatLabels[format]}
          </span>
        </Dropdown.Item>
      ))}
    </Dropdown>
  )
}