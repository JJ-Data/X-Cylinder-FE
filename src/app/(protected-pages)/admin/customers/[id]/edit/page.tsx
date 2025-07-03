'use client'

import { useParams } from 'next/navigation'
import CustomerForm from '@/components/customers/CustomerForm'

export default function EditCustomerPage() {
  const params = useParams()
  const customerId = Number(params.id)
  
  return <CustomerForm customerId={customerId} />
}