import LeaseReceiptPage from '@/components/leases/LeaseReceiptPage'

export default async function StaffLeaseReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const leaseId = parseInt(id, 10)
  
  if (isNaN(leaseId)) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Invalid Lease ID</h1>
          <p className="text-gray-600">The lease ID provided is not valid.</p>
        </div>
      </div>
    )
  }
  
  return <LeaseReceiptPage leaseId={leaseId} />
}