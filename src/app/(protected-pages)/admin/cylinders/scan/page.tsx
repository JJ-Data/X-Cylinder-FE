'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import QRScanner from '@/components/shared/QRScanner'
import { toast } from 'react-hot-toast'

export default function AdminScanCylinderPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const action = searchParams.get('action')

    const handleScan = async (scannedData: string) => {
        let code = scannedData

        // Try to parse as JSON to extract the code
        try {
            const parsedData = JSON.parse(scannedData)
            if (parsedData.code) {
                code = parsedData.code
            }
        } catch (e) {
            // If parsing fails, assume it's already a plain code
            code = scannedData
        }

        toast.success(`Scanned: ${code}`)

        // Try to find the cylinder
        try {
            const response = await fetch(`/api/proxy/cylinders/code/${code}`)

            if (response.ok) {
                const data = await response.json()
                const cylinder = data.data

                // Navigate based on action
                if (action === 'transfer') {
                    router.push(
                        `/admin/cylinders/transfer?cylinderId=${cylinder.id}`,
                    )
                } else {
                    // Default to cylinder details
                    router.push(`/admin/cylinders/${cylinder.id}`)
                }
            } else {
                toast.error('Cylinder not found')
                router.back()
            }
        } catch (error) {
            toast.error('Error processing scan')
            router.back()
        }
    }

    const handleClose = () => {
        router.back()
    }

    return (
        <QRScanner
            isOpen={true}
            onScan={handleScan}
            onClose={handleClose}
            title={
                action === 'transfer'
                    ? 'Scan Cylinder for Transfer'
                    : 'Scan Cylinder QR Code'
            }
            description="Position the cylinder's QR code within the camera view to scan"
        />
    )
}
