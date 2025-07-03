import { z } from 'zod'
import type { ZodType } from 'zod'
import type { TransferFormData } from './TransferWizard.types'

export const transferSchema: ZodType<TransferFormData> = z
    .object({
        transferType: z.enum(['single', 'bulk']),
        cylinderCode: z.string().optional(),
        cylinderIds: z.array(z.number()).optional(),
        sourceOutletId: z.number().optional(),
        destinationOutletId: z
            .number()
            .min(1, 'Destination outlet is required'),
        reason: z.enum([
            'balancing',
            'request',
            'maintenance',
            'emergency',
            'closure',
            'other',
        ]),
        customReason: z.string().optional(),
        notes: z.string().optional(),
    })
    .refine(
        (data) => {
            // Validate based on transfer type
            if (data.transferType === 'single') {
                return !!data.cylinderCode
            } else {
                return data.cylinderIds && data.cylinderIds.length > 0
            }
        },
        {
            message: 'Please select cylinders to transfer',
            path: ['cylinderIds'],
        },
    )