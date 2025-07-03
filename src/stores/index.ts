// Export all stores from a central location
export { useAuthStore } from './useAuthStore'
export { useNavigationStore, useOfflineDetection } from './useNavigationStore'
export { useOutletStore } from './useOutletStore'
export { useCylinderStore, validateQRData } from './useCylinderStore'

// Export types
export type { UserRole, User } from './useAuthStore'
export type { BreadcrumbItem } from './useNavigationStore'
// export type { Outlet, Cylinder, Lease } from './useOutletStore'
export type { QRScanResult, BulkOperation } from './useCylinderStore'
