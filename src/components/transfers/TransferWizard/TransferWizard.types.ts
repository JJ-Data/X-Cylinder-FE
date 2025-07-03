
export type TransferType = 'single' | 'bulk'

export type TransferReason =
    | 'balancing'
    | 'request'
    | 'maintenance'
    | 'emergency'
    | 'closure'
    | 'other'

export interface TransferFormData {
    transferType: TransferType
    cylinderCode?: string
    cylinderIds?: number[]
    sourceOutletId?: number
    destinationOutletId: number
    reason: TransferReason
    customReason?: string
    notes?: string
}

export interface TransferWizardProps {
    preselectedCylinderId?: number
}

export interface TransferReasonOption {
    value: TransferReason
    label: string
    icon: React.ReactNode
}

export interface TransferStep {
    label: string
    icon: React.ReactNode
}

export interface SelectOption {
    value: number | string
    label: string
}