import { AnyUseQueryOptions, useQuery } from "@tanstack/react-query"
import { createAuthClient } from "better-auth/react"
import { useContext, useEffect, useState } from "react"

import { AuthQueryContext } from "../lib/auth-query-provider"

export function useSession<
    TAuthClient extends ReturnType<typeof createAuthClient>
>(
    authClient: TAuthClient,
    options?: Omit<AnyUseQueryOptions, "queryKey" | "queryFn">
) {
    type SessionData = TAuthClient["$Infer"]["Session"]
    type User = TAuthClient["$Infer"]["Session"]["user"]
    type Session = TAuthClient["$Infer"]["Session"]["session"]

    const { queryOptions, sessionQueryOptions, sessionKey } = useContext(AuthQueryContext)

    const [refetchEnabled, setRefetchEnabled] = useState(false)

    const queryResult = useQuery<SessionData>({
        refetchOnWindowFocus: refetchEnabled,
        refetchOnReconnect: refetchEnabled,
        staleTime: 30 * 1000,
        ...queryOptions,
        ...sessionQueryOptions,
        ...options,
        queryKey: sessionKey || ["session"],
        queryFn: async () => {
            const session = await authClient.getSession({
                fetchOptions: {
                    throw: true
                }
            })

            return session as SessionData
        }
    })

    const { data, refetch } = queryResult

    useEffect(() => {
        setRefetchEnabled(!!data)

        if (!data) return

        const expiresAt = new Date(data.session.expiresAt).getTime()
        const now = new Date().getTime()
        const timeUntilExpiry = expiresAt - now

        const timeout = setTimeout(() => {
            refetch()
        }, timeUntilExpiry)

        return () => clearTimeout(timeout)
    }, [data, refetch])

    const isSessionExpired = () => {
        if (!data) return true

        const expiresAt = new Date(data.session.expiresAt).getTime()
        const now = Date.now()

        return expiresAt < now
    }

    const sessionData: SessionData | undefined = isSessionExpired() ? undefined : data
    const session = sessionData?.session as Session | undefined
    const user = sessionData?.user as User | undefined

    return { ...queryResult, data: sessionData, session, user }
}