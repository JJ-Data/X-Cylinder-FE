export type AppConfig = {
    apiPrefix: string
    authenticatedEntryPath: string
    unAuthenticatedEntryPath: string
    locale: string
    activeNavTranslation: boolean
}

const appConfig: AppConfig = {
    apiPrefix:
        process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1',
    authenticatedEntryPath: '/admin/dashboard', // Default authenticated path
    unAuthenticatedEntryPath: '/sign-in',
    locale: 'en',
    activeNavTranslation: false,
}

// Role-based entry paths
export const roleBasedPaths = {
    customer: '/customer/dashboard',
    staff: '/staff/dashboard',
    operator: '/operator/dashboard',
    admin: '/admin/dashboard',
} as const

// Role aliases to handle backend role variations
export const roleAliases: Record<string, keyof typeof roleBasedPaths> = {
    // Customer variations
    'customer': 'customer',
    'user': 'customer',
    'client': 'customer',
    
    // Staff variations
    'staff': 'staff',
    'employee': 'staff',
    'worker': 'staff',
    
    // Backend operator role - maps refill_operator to operator dashboard
    'refill_operator': 'operator',
    'operator': 'operator',
    'operator_admin': 'operator',
    'refill-operator': 'operator',
    'operator-admin': 'operator',
    'gas_operator': 'operator',
    'gas-operator': 'operator',
    'cylinder_operator': 'operator',
    'cylinder-operator': 'operator',
    
    // Admin variations
    'admin': 'admin',
    'administrator': 'admin',
    'super_admin': 'admin',
    'super-admin': 'admin',
    'superadmin': 'admin',
    'system_admin': 'admin',
    'system-admin': 'admin',
}

export const getRoleBasedPath = (role: string): string => {
    console.log('[getRoleBasedPath] ===== ROLE PROCESSING START =====')
    console.log('[getRoleBasedPath] Processing role:', {
        originalRole: role,
        roleType: typeof role,
        roleLength: role?.length,
        timestamp: new Date().toISOString()
    })
    
    if (!role) {
        console.error('[getRoleBasedPath] ❌ CRITICAL: No role provided, using default admin dashboard!')
        console.log('[getRoleBasedPath] This will cause redirect to /admin/dashboard')
        return appConfig.authenticatedEntryPath
    }
    
    // Normalize the role (lowercase, trim, remove special characters)
    const normalizedRole = role.toLowerCase().trim()
    
    // First, try direct lookup in role aliases
    console.log('[getRoleBasedPath] Checking role aliases:', {
        normalizedRole,
        hasMatch: normalizedRole in roleAliases,
        availableAliases: Object.keys(roleAliases)
    })
    
    if (roleAliases[normalizedRole]) {
        const mappedRole = roleAliases[normalizedRole]
        const path = roleBasedPaths[mappedRole]
        console.log('[getRoleBasedPath] ✅ Direct alias match found:', {
            originalRole: role,
            normalizedRole,
            mappedRole,
            path
        })
        console.log('[getRoleBasedPath] ===== ROLE PROCESSING SUCCESS =====')
        return path
    }
    
    // If no direct match, try intelligent matching based on role content
    console.log('[getRoleBasedPath] ⚠️ No direct alias match, trying intelligent matching...')
    const intelligentMatch = getIntelligentRoleMatch(normalizedRole)
    if (intelligentMatch) {
        const path = roleBasedPaths[intelligentMatch]
        console.log('[getRoleBasedPath] ✅ Intelligent match found:', {
            originalRole: role,
            normalizedRole,
            intelligentMatch,
            path
        })
        console.log('[getRoleBasedPath] ===== ROLE PROCESSING SUCCESS =====')
        return path
    }
    
    // Fallback to default
    console.error('[getRoleBasedPath] ❌ CRITICAL: No match found, using fallback!')
    console.log('[getRoleBasedPath] This will cause redirect to /admin/dashboard:', {
        originalRole: role,
        normalizedRole,
        fallbackPath: appConfig.authenticatedEntryPath,
        issue: 'Role not found in aliases or intelligent matching'
    })
    console.log('[getRoleBasedPath] ===== ROLE PROCESSING FAILED =====')
    
    return appConfig.authenticatedEntryPath
}

// Intelligent role matching based on role content
function getIntelligentRoleMatch(normalizedRole: string): keyof typeof roleBasedPaths | null {
    // Check if role contains operator-related keywords
    if (normalizedRole.includes('operator') || normalizedRole.includes('refill') || normalizedRole.includes('gas')) {
        return 'operator'
    }
    
    // Check if role contains admin-related keywords
    if (normalizedRole.includes('admin') || normalizedRole.includes('administrator') || normalizedRole.includes('super')) {
        return 'admin'
    }
    
    // Check if role contains staff-related keywords
    if (normalizedRole.includes('staff') || normalizedRole.includes('employee') || normalizedRole.includes('worker')) {
        return 'staff'
    }
    
    // Check if role contains customer-related keywords
    if (normalizedRole.includes('customer') || normalizedRole.includes('user') || normalizedRole.includes('client')) {
        return 'customer'
    }
    
    return null
}

export default appConfig
