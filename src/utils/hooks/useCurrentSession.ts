import { useSession } from 'next-auth/react'

const useCurrentSession = () => {
    const { data: session, status } = useSession()

    return {
        session,
        status,
        isLoading: status === 'loading',
        isAuthenticated: status === 'authenticated',
    }
}

export default useCurrentSession
