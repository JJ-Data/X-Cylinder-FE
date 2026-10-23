import useCurrentSession from '@/utils/hooks/useCurrentSession'
import appConfig, { getRoleBasedPath } from '@/configs/app.config'

const useDashboardPath = () => {
    const { session } = useCurrentSession()
    const role = (session?.user as any)?.backendRole || session?.user?.role
    return role ? getRoleBasedPath(role) : appConfig.authenticatedEntryPath
}

export default useDashboardPath
