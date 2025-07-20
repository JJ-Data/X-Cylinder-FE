export function validateEnvironmentVariables() {
    const requiredEnvVars = {
        BACKEND_API_URL: process.env.BACKEND_API_URL,
        NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    }
    
    const missingVars: string[] = []
    const warnings: string[] = []
    
    // Check for required environment variables
    if (!requiredEnvVars.BACKEND_API_URL && !requiredEnvVars.NEXT_PUBLIC_API_BASE_URL) {
        missingVars.push('BACKEND_API_URL or NEXT_PUBLIC_API_BASE_URL')
    }
    
    // Validate URL format
    const apiUrl = requiredEnvVars.BACKEND_API_URL || requiredEnvVars.NEXT_PUBLIC_API_BASE_URL
    if (apiUrl) {
        try {
            new URL(apiUrl)
        } catch (error) {
            warnings.push(`Invalid API URL format: ${apiUrl}`)
        }
        
        // Check if URL ends with /api/v1
        if (!apiUrl.endsWith('/api/v1')) {
            warnings.push(`API URL should end with '/api/v1', got: ${apiUrl}`)
        }
    }
    
    // Log validation results
    if (missingVars.length > 0 || warnings.length > 0) {
        console.warn('[Environment Validation]', {
            missingVars,
            warnings,
            currentValues: {
                BACKEND_API_URL: requiredEnvVars.BACKEND_API_URL || 'Not set',
                NEXT_PUBLIC_API_BASE_URL: requiredEnvVars.NEXT_PUBLIC_API_BASE_URL || 'Not set',
            }
        })
    }
    
    return {
        isValid: missingVars.length === 0,
        missingVars,
        warnings,
        apiUrl: apiUrl || 'http://localhost:3000/api/v1'
    }
}