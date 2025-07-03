export interface Customer {
  id: number
  userId: number
  address: string
  city: string
  state: string
  status: 'active' | 'inactive' | 'blocked'
  activeLeases: number
  totalLeases: number
  totalSpent: number
  createdAt: string
  updatedAt: string
  user: {
    id: number
    firstName: string
    lastName: string
    email: string
    phone: string
    isActive: boolean
    createdAt: string
    updatedAt: string
  }
}