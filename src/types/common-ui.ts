// Common UI type definitions to replace 'any' types

// Select option type
export interface SelectOption<T = string> {
  value: T
  label: string
  disabled?: boolean
}

// Event handler types
export type SelectChangeHandler<T = string> = (option: SelectOption<T> | null) => void

// Form field change event
export type FieldChangeEvent = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>

// Generic error type for catch blocks
export interface ApiError {
  message: string
  code?: string
  status?: number
  [key: string]: unknown
}

// Table row type
export interface TableRow<T = unknown> {
  original: T
  [key: string]: unknown
}

// Generic mutation callback
export type MutationCallback<TData = unknown, TVariables = unknown> = (
  variables: TVariables
) => Promise<TData>