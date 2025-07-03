export interface Transaction {
  id: number
  customerId: number
  leaseId?: number
  refillId?: number
  type: 'DEBIT' | 'CREDIT'
  amount: number
  description: string
  paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'MOBILE_MONEY' | 'CARD'
  referenceNumber?: string
  transactionDate: string
  createdAt: string
  updatedAt: string
}

export interface TransactionFilters {
  customerId?: number
  type?: 'DEBIT' | 'CREDIT'
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}