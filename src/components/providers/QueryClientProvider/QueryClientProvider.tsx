'use client'

import { QueryClient, QueryClientProvider as TanstackQueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

type QueryClientProviderProps = {
    children: React.ReactNode
}

const QueryClientProvider = ({ children }: QueryClientProviderProps) => {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 5 * 60 * 1000, // 5 minutes
                        gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
                        retry: 2,
                        refetchOnWindowFocus: false,
                        refetchOnMount: true,
                        refetchOnReconnect: 'always',
                    },
                    mutations: {
                        retry: 1,
                    },
                },
            })
    )

    return (
        <TanstackQueryClientProvider client={queryClient}>
            {children}
        </TanstackQueryClientProvider>
    )
}

export default QueryClientProvider