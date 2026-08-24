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

// Max gas capacity (kg) implied by each type string, e.g. '15kg' -> 15.
// Used to auto-fill/cap the max gas volume field so a 15kg cylinder can't be
// entered with a 50kg max volume.
export const CYLINDER_TYPE_CAPACITY_KG: Record<string, number> =
    Object.fromEntries(
        CYLINDER_TYPES.map((value) => [value, parseInt(value, 10)]),
    )
