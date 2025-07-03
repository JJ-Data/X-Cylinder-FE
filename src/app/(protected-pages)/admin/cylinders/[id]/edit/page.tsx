'use client'

import { useParams } from 'next/navigation'
import CylinderForm from '@/components/cylinders/CylinderForm'

export default function EditCylinderPage() {
  const params = useParams()
  const cylinderId = Number(params.id)
  
  return <CylinderForm cylinderId={cylinderId} />
}