import {
    PiHouseLineDuotone,
    PiArrowsInDuotone,
    PiBookOpenUserDuotone,
    PiBookBookmarkDuotone,
    PiAcornDuotone,
    PiBagSimpleDuotone,
    PiChartBarDuotone,
    PiStorefrontDuotone,
    PiUsersThreeDuotone,
    PiCylinderDuotone,
    PiTruckDuotone,
    PiGearSixDuotone,
    PiFileTextDuotone,
    PiUserCircleDuotone,
    PiPackageDuotone,
    PiClockCountdownDuotone,
    PiClipboardTextDuotone,
    PiQrCodeDuotone,
    PiUploadDuotone,
    PiWarningCircleDuotone,
    PiArrowsLeftRightDuotone,
    PiArrowsCounterClockwiseDuotone,
    PiUserPlusDuotone,
} from 'react-icons/pi'
import type { JSX } from 'react'

export type NavigationIcons = Record<string, JSX.Element>

const navigationIcon: NavigationIcons = {
    // Original icons
    home: <PiHouseLineDuotone />,
    singleMenu: <PiAcornDuotone />,
    collapseMenu: <PiArrowsInDuotone />,
    groupSingleMenu: <PiBookOpenUserDuotone />,
    groupCollapseMenu: <PiBookBookmarkDuotone />,
    groupMenu: <PiBagSimpleDuotone />,
    
    // CylinderX icons
    dashboard: <PiHouseLineDuotone />,
    analytics: <PiChartBarDuotone />,
    outlets: <PiStorefrontDuotone />,
    users: <PiUsersThreeDuotone />,
    cylinders: <PiCylinderDuotone />,
    swaps: <PiArrowsCounterClockwiseDuotone />,
    transfers: <PiArrowsLeftRightDuotone />,
    settings: <PiGearSixDuotone />,
    reports: <PiFileTextDuotone />,
    profile: <PiUserCircleDuotone />,
    
    // Customer specific
    myCylinders: <PiCylinderDuotone />,
    leaseNew: <PiPackageDuotone />,
    transactions: <PiClockCountdownDuotone />,
    
    // Staff specific
    customers: <PiUsersThreeDuotone />,
    customerAdd: <PiUserPlusDuotone />,
    leasing: <PiFileTextDuotone />,
    inventory: <PiClipboardTextDuotone />,
    
    // Operator specific
    refillQueue: <PiClipboardTextDuotone />,
    qrScanner: <PiQrCodeDuotone />,
    bulkRefill: <PiUploadDuotone />,
    refillHistory: <PiClockCountdownDuotone />,
    cylinderStatus: <PiCylinderDuotone />,
    maintenance: <PiWarningCircleDuotone />,
    myPerformance: <PiChartBarDuotone />,
}

export default navigationIcon
