// Canonical set of cylinder types the backend accepts.
// Keep this the single source of truth - it previously drifted into four
// different hardcoded lists across the app (one of which offered "25kg",
// which the backend doesn't recognize as a valid type).
export const CYLINDER_TYPES = ['5kg', '10kg', '15kg', '20kg', '50kg'] as const

export type CylinderTypeValue = (typeof CYLINDER_TYPES)[number]

export const CYLINDER_TYPE_OPTIONS = CYLINDER_TYPES.map((value) => ({
    value,
    label: value,
}))
