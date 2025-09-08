'use client'

import { useRouter } from 'next/navigation'
import QRScanner from '@/components/shared/QRScanner'
import { toast } from 'react-hot-toast'

export default function ScanCylinderPage() {
    const router = useRouter()

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

                // Navigate to cylinder details
                router.push(`/staff/cylinders/${cylinder.id}`)
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
            title="Scan Cylinder QR Code"
            description="Position the cylinder's QR code within the camera view to scan"
        />
    )
}
