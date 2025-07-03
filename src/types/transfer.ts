import { Cylinder } from './cylinder'
import { Outlet } from './outlet'
import { User } from './user'

export interface Transfer {
  id: number
  cylinderId: number
  fromOutletId: number
  toOutletId: number
  transferredById: number // Primary field from DB
  initiatedById: number // Virtual field, same as transferredById
  acceptedById?: number
  status: 'pending' | 'completed' | 'rejected'
  transferDate: string
  notes?: string
  reason?: string
  rejectionReason?: string
  acceptedAt?: string
  rejectedAt?: string
  createdAt: string
  updatedAt: string
  // Relations
  cylinder?: Cylinder
  fromOutlet?: Outlet
  toOutlet?: Outlet
  transferredBy?: User // Primary relation
  initiatedBy?: User // Alias for transferredBy
  acceptedBy?: User
}

export interface TransferFormData {
  cylinderId: number
  toOutletId: number
  notes?: string
}

export interface TransferFilters {
  fromDate?: string
  toDate?: string
  fromOutletId?: number
  toOutletId?: number
  cylinderCode?: string
  status?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
}

export interface TransferStatistics {
  totalTransfers: number
  pendingTransfers: number
  completedTransfers: number
  rejectedTransfers: number
  transfersByDay: Array<{
    date: string
    count: number
  }>
  topCylinders: Array<{
    cylinderCode: string
    cylinderId: number
    transferCount: number
  }>
  transfersByOutlet: Array<{
    outletId: number
    outletName: string
    sentCount: number
    receivedCount: number
  }>
}

export interface TransferListResponse {
  transfers: Transfer[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface TransferExportParams {
  fromDate?: string
  toDate?: string
  fromOutletId?: number
  toOutletId?: number
  cylinderCode?: string
  status?: string
  format?: 'csv' | 'excel'
}