'use client'

// Import from refactored files
import type { TransferWizardProps } from './TransferWizard.types'

// Import the original file components temporarily
import TransferWizardOriginal from '../TransferWizardOriginal'

export function TransferWizard({ preselectedCylinderId }: TransferWizardProps) {
    // For now, use the original component while we refactor
    return <TransferWizardOriginal preselectedCylinderId={preselectedCylinderId} />
}

export default TransferWizard