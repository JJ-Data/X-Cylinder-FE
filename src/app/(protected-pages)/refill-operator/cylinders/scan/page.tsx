'use client'

import { useRouter } from 'next/navigation'
import QRScanner from '@/components/shared/QRScanner'
import { toast } from 'react-hot-toast'

export default function RefillOperatorScanPage() {
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

        // Navigate back to refill page with the scanned code
        router.push(
            `/refill-operator/refills/new?code=${encodeURIComponent(code)}`,
        )
    }

    const handleClose = () => {
        router.back()
    }

    return (
        <QRScanner
            isOpen={true}
            onScan={handleScan}
            onClose={handleClose}
            title="Scan Cylinder for Refill"
            description="Position the cylinder's QR code within the camera view to start refilling"
        />
    )
}
