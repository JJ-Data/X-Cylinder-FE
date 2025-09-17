import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { format } from 'date-fns'

// Types for export configurations
export interface ExportColumn {
  key: string
  header: string
  width?: number
  formatter?: (value: any) => string
}

export interface CSVExportConfig {
  data: any[]
  columns: ExportColumn[]
  filename?: string
}

export interface PDFExportConfig {
  data: any[]
  columns: ExportColumn[]
  filename?: string
  title?: string
  orientation?: 'portrait' | 'landscape'
  fontSize?: number
  pageSize?: 'a4' | 'letter' | 'legal'
}

// Utility functions for data formatting
export const formatters = {
  date: (value: any) => {
    if (!value) return '-'
    try {
      return format(new Date(value), 'dd MMM yyyy')
    } catch {
      return value
    }
  },
  
  dateTime: (value: any) => {
    if (!value) return '-'
    try {
      return format(new Date(value), 'dd MMM yyyy HH:mm')
    } catch {
      return value
    }
  },
  
  currency: (value: any, symbol = '₦') => {
    if (value === null || value === undefined) return '-'
    const num = parseFloat(value)
    if (isNaN(num)) return value
    return `${symbol}${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  },
  
  number: (value: any) => {
    if (value === null || value === undefined) return '-'
    const num = parseFloat(value)
    if (isNaN(num)) return value
    return num.toLocaleString('en-US')
  },
  
  percentage: (value: any) => {
    if (value === null || value === undefined) return '-'
    const num = parseFloat(value)
    if (isNaN(num)) return value
    return `${num.toFixed(1)}%`
  },
  
  boolean: (value: any) => {
    if (value === null || value === undefined) return '-'
    return value ? 'Yes' : 'No'
  },
  
  status: (value: any) => {
    if (!value) return '-'
    return value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, ' ')
  },
  
  phone: (value: any) => {
    if (!value) return '-'
    // Format Nigerian phone numbers
    const cleaned = value.toString().replace(/\D/g, '')
    if (cleaned.length === 11 && cleaned.startsWith('0')) {
      return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
    }
    if (cleaned.length === 10) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    }
    return value
  },
  
  email: (value: any) => {
    return value || '-'
  },
  
  default: (value: any) => {
    if (value === null || value === undefined || value === '') return '-'
    if (typeof value === 'object') {
      // Handle nested objects (e.g., user.name)
      if (value.name) return value.name
      if (value.title) return value.title
      if (value.label) return value.label
      return JSON.stringify(value)
    }
    return value.toString()
  }
}

// Generate filename with timestamp
export const generateFilename = (prefix: string, extension: string): string => {
  const timestamp = format(new Date(), 'yyyy-MM-dd-HHmmss')
  return `${prefix}-${timestamp}.${extension}`
}

// Extract value from nested object path (e.g., 'user.name')
const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

// Format data for export
const formatDataForExport = (data: any[], columns: ExportColumn[]): any[][] => {
  return data.map(row => 
    columns.map(col => {
      const value = getNestedValue(row, col.key)
      const formatter = col.formatter || formatters.default
      return formatter(value)
    })
  )
}

// CSV Export Function
export const exportToCSV = (config: CSVExportConfig): void => {
  const {
    data,
    columns,
    filename = generateFilename('export', 'csv')
  } = config

  if (!data || data.length === 0) {
    throw new Error('No data to export')
  }

  // Prepare CSV content
  const headers = columns.map(col => col.header).join(',')
  const rows = formatDataForExport(data, columns)
    .map(row => row.map(cell => {
      // Escape and quote cells containing commas, quotes, or newlines
      const cellStr = cell.toString()
      if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
        return `"${cellStr.replace(/"/g, '""')}"`
      }
      return cellStr
    }).join(','))
    .join('\n')
  
  const csvContent = `${headers}\n${rows}`
  
  // Create blob and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  // Clean up
  URL.revokeObjectURL(url)
}

// PDF Export Function
export const exportToPDF = (config: PDFExportConfig): void => {
  const {
    data,
    columns,
    filename = generateFilename('export', 'pdf'),
    title = 'Export Report',
    orientation = 'landscape',
    fontSize = 10,
    pageSize = 'a4'
  } = config

  if (!data || data.length === 0) {
    throw new Error('No data to export')
  }

  // Create PDF document
  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format: pageSize
  })

  // Add title
  doc.setFontSize(16)
  doc.text(title, 14, 15)
  
  // Add export date
  doc.setFontSize(10)
  doc.text(`Generated: ${format(new Date(), 'dd MMM yyyy HH:mm')}`, 14, 22)

  // Prepare table data
  const headers = columns.map(col => col.header)
  const rows = formatDataForExport(data, columns)

  // Calculate column widths based on orientation and page size
  const pageWidth = orientation === 'landscape' ? 
    (pageSize === 'a4' ? 297 : pageSize === 'letter' ? 279 : 356) :
    (pageSize === 'a4' ? 210 : pageSize === 'letter' ? 216 : 216)
  
  const marginTotal = 28 // 14mm on each side
  const availableWidth = pageWidth - marginTotal
  
  // Auto-calculate column widths if not specified
  const columnWidths = columns.map(col => {
    if (col.width) return col.width
    // Distribute remaining width equally
    return availableWidth / columns.length
  })

  // Add table using autoTable
  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 28,
    theme: 'grid',
    styles: {
      fontSize,
      cellPadding: 2,
      overflow: 'linebreak',
      halign: 'left'
    },
    headStyles: {
      fillColor: [66, 139, 202],
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    columnStyles: columns.reduce((styles, col, index) => {
      styles[index] = {
        cellWidth: columnWidths[index]
      }
      return styles
    }, {} as any),
    margin: { top: 28, left: 14, right: 14 },
    didDrawPage: (data) => {
      // Add page number
      const pageCount = doc.getNumberOfPages()
      doc.setFontSize(10)
      doc.text(
        `Page ${data.pageNumber} of ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      )
    }
  })

  // Save the PDF
  doc.save(filename)
}

// Combined export function for easy use
export type ExportFormat = 'csv' | 'pdf'

export interface TableExportConfig {
  data: any[]
  columns: ExportColumn[]
  format: ExportFormat
  filename?: string
  title?: string
  orientation?: 'portrait' | 'landscape'
}

export const exportTable = (config: TableExportConfig): void => {
  const { format, ...rest } = config
  
  if (format === 'csv') {
    exportToCSV(rest)
  } else if (format === 'pdf') {
    exportToPDF(rest)
  } else {
    throw new Error(`Unsupported export format: ${format}`)
  }
}

// Helper function to create column definitions
export const createColumn = (
  key: string,
  header: string,
  formatter?: (value: any) => string,
  width?: number
): ExportColumn => ({
  key,
  header,
  formatter,
  width
})

// Predefined column sets for common entities
export const columnSets = {
  outlets: [
    createColumn('name', 'Outlet Name'),
    createColumn('location', 'Location'),
    createColumn('contactPhone', 'Phone', formatters.phone),
    createColumn('contactEmail', 'Email', formatters.email),
    createColumn('manager.firstName', 'Manager First Name'),
    createColumn('manager.lastName', 'Manager Last Name'),
    createColumn('status', 'Status', formatters.status),
    createColumn('createdAt', 'Created Date', formatters.date)
  ],
  
  users: [
    createColumn('firstName', 'First Name'),
    createColumn('lastName', 'Last Name'),
    createColumn('email', 'Email', formatters.email),
    createColumn('role', 'Role', formatters.status),
    createColumn('outlet.name', 'Outlet'),
    createColumn('isActive', 'Active', formatters.boolean),
    createColumn('createdAt', 'Created Date', formatters.date)
  ],
  
  cylinders: [
    createColumn('cylinderCode', 'Cylinder Code'),
    createColumn('type', 'Type', formatters.status),
    createColumn('volume', 'Volume (kg)', formatters.number),
    createColumn('weight', 'Weight (kg)', formatters.number),
    createColumn('currentOutlet.name', 'Current Outlet'),
    createColumn('currentHolder.firstName', 'Holder First Name'),
    createColumn('currentHolder.lastName', 'Holder Last Name'),
    createColumn('status', 'Status', formatters.status),
    createColumn('lastRefillDate', 'Last Refill', formatters.date)
  ],
  
  leases: [
    createColumn('id', 'Lease ID'),
    createColumn('customer.firstName', 'Customer First Name'),
    createColumn('customer.lastName', 'Customer Last Name'),
    createColumn('cylinder.cylinderCode', 'Cylinder Code'),
    createColumn('outlet.name', 'Outlet'),
    createColumn('startDate', 'Start Date', formatters.date),
    createColumn('endDate', 'End Date', formatters.date),
    createColumn('status', 'Status', formatters.status),
    createColumn('depositAmount', 'Deposit', formatters.currency),
    createColumn('leaseFee', 'Lease Fee', formatters.currency)
  ],
  
  refills: [
    createColumn('id', 'Refill ID'),
    createColumn('cylinder.cylinderCode', 'Cylinder Code'),
    createColumn('customer.firstName', 'Customer First Name'),
    createColumn('customer.lastName', 'Customer Last Name'),
    createColumn('outlet.name', 'Outlet'),
    createColumn('refillDate', 'Date', formatters.dateTime),
    createColumn('volumeBefore', 'Pre-Volume (kg)', formatters.number),
    createColumn('volumeAfter', 'Post-Volume (kg)', formatters.number),
    createColumn('refillCost', 'Amount', formatters.currency),
    createColumn('paymentStatus', 'Payment Status', formatters.status)
  ],
  
  transfers: [
    createColumn('id', 'Transfer ID'),
    createColumn('fromOutlet.name', 'From Outlet'),
    createColumn('toOutlet.name', 'To Outlet'),
    createColumn('cylinder.cylinderCode', 'Cylinder Code'),
    createColumn('transferDate', 'Transfer Date', formatters.dateTime),
    createColumn('status', 'Status', formatters.status),
    createColumn('notes', 'Notes')
  ]
}