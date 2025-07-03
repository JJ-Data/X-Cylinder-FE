import AxiosBase from '@/services/axios/AxiosBase'

const apiClient = AxiosBase

export interface QRCodeData {
  qrData: string
  dataURL: string
  cylinder: {
    id: number
    cylinderCode: string
    type: string
    qrCode: string
  }
}

export interface BulkQRCodeDto {
  cylinderIds: number[]
}

export interface ValidateQRDto {
  qrData: string
}

class QRService {
  private baseURL = '/qr'

  // Get QR code data for a cylinder
  async getCylinderQRCode(cylinderId: number): Promise<QRCodeData> {
    const response = await apiClient.get(`${this.baseURL}/cylinder/${cylinderId}`)
    return response.data.data
  }

  // Download QR code as image
  async downloadCylinderQRCode(
    cylinderId: number,
    format: 'png' | 'svg' = 'png'
  ): Promise<Blob> {
    const response = await apiClient.get(
      `${this.baseURL}/cylinder/${cylinderId}/download?format=${format}`,
      { responseType: 'blob' }
    )
    return response.data
  }

  // Generate QR codes for multiple cylinders
  async generateBulkQRCodes(data: BulkQRCodeDto): Promise<any> {
    const response = await apiClient.post(`${this.baseURL}/bulk`, data)
    return response.data.data
  }

  // Validate a QR code
  async validateQRCode(data: ValidateQRDto): Promise<any> {
    const response = await apiClient.post(`${this.baseURL}/validate`, data)
    return response.data.data
  }

  // Helper method to trigger download
  downloadQRImage(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }
}

export const qrService = new QRService()
export default qrService