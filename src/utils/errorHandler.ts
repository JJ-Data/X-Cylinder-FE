import type { AxiosError } from 'axios'
import type { FieldPath, UseFormSetError } from 'react-hook-form'

/**
 * Backend error response structure
 */
interface BackendErrorResponse {
  success: false
  error: string
  errors?: Record<string, string[]>
}

/**
 * Parse and handle backend validation errors
 * @param error - The error object from axios
 * @param setError - The setError function from react-hook-form
 * @returns The main error message to display
 */
export function handleBackendValidationErrors<TFieldValues extends Record<string, any>>(
  error: unknown,
  setError?: UseFormSetError<TFieldValues>
): string {
  console.log('[ErrorHandler] Processing error:', error)
  
  // Check if it's an Axios error with response data
  if (isAxiosError(error) && error.response?.data) {
    const errorData = error.response.data as BackendErrorResponse
    console.log('[ErrorHandler] Axios error data:', errorData)
    
    // Handle field-specific validation errors
    if (errorData.errors && setError) {
      Object.entries(errorData.errors).forEach(([field, messages]) => {
        // Set the first error message for each field
        const cleanedMessage = cleanErrorMessage(messages[0])
        console.log(`[ErrorHandler] Setting field error for ${field}:`, cleanedMessage)
        setError(field as FieldPath<TFieldValues>, {
          type: 'manual',
          message: cleanedMessage
        })
      })
    }
    
    // Return the main error message
    const mainError = errorData.error || 'Validation failed. Please check the form fields.'
    console.log('[ErrorHandler] Main error message:', mainError)
    return mainError
  }
  
  // Also check if error has response-like structure even if not marked as axios error
  if ((error as any)?.response?.data) {
    console.log('[ErrorHandler] Non-axios error with response structure')
    const errorData = (error as any).response.data as BackendErrorResponse
    
    if (errorData.errors && setError) {
      Object.entries(errorData.errors).forEach(([field, messages]) => {
        const cleanedMessage = cleanErrorMessage(messages[0])
        setError(field as FieldPath<TFieldValues>, {
          type: 'manual',
          message: cleanedMessage
        })
      })
    }
    
    return errorData.error || 'Validation failed. Please check the form fields.'
  }
  
  // Handle generic errors
  if (error instanceof Error) {
    console.log('[ErrorHandler] Generic error:', error.message)
    return error.message
  }
  
  console.log('[ErrorHandler] Unknown error type')
  return 'An unexpected error occurred'
}

/**
 * Type guard to check if error is an AxiosError
 */
function isAxiosError(error: unknown): error is AxiosError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    'config' in error &&
    'isAxiosError' in error
  )
}

/**
 * Clean backend error messages
 * Removes quotes and field names from Joi validation messages
 * Example: "\"alternatePhone\" is not allowed to be empty" -> "This field is not allowed to be empty"
 */
function cleanErrorMessage(message: string): string {
  // Remove field name in quotes at the beginning
  let cleaned = message.replace(/^"[^"]*"\s*/g, '')
  
  // Capitalize first letter
  cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
  
  // Replace common Joi messages with more user-friendly ones
  const replacements: Record<string, string> = {
    'Is not allowed to be empty': 'This field cannot be empty',
    'Must be a valid email': 'Please enter a valid email address',
    'Length must be at least': 'Must be at least',
    'Is required': 'This field is required'
  }
  
  for (const [pattern, replacement] of Object.entries(replacements)) {
    if (cleaned.toLowerCase().includes(pattern.toLowerCase())) {
      cleaned = cleaned.replace(new RegExp(pattern, 'i'), replacement)
    }
  }
  
  return cleaned
}

/**
 * Format multiple error messages for display
 */
export function formatErrorMessages(errors: string[]): string {
  if (errors.length === 0) return ''
  if (errors.length === 1) return cleanErrorMessage(errors[0])
  
  return errors.map(cleanErrorMessage).join('. ')
}

/**
 * Extract error message from various error types
 */
export function getErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as any
    if (data?.error) return data.error
    if (data?.message) return data.message
    if (error.response?.status === 404) return 'Resource not found'
    if (error.response?.status === 401) return 'Unauthorized access'
    if (error.response?.status === 403) return 'Permission denied'
    if (error.response?.status === 500) return 'Server error occurred'
  }
  
  if (error instanceof Error) {
    return error.message
  }
  
  return 'An unexpected error occurred'
}