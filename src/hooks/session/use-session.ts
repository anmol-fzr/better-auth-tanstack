import { type AnyUseQueryOptions, useQuery } from "@tanstack/react-query"
import { useContext, useEffect, useState } from "react"

import { AuthQueryContext } from "../../lib/auth-query-provider"
import type { AuthClient } from "../../types/auth-client"
import { useUpdateUser } from "./use-update-user"

export function useSession<TAuthClient extends AuthClient>(
    authClient: TAuthClient,
    options?: Partial<AnyUseQueryOptions>
) {
    type SessionData = TAuthClient["$Infer"]["Session"]
    type User = SessionData["user"]
    type Session = SessionData["session"]

    const { sessionQueryOptions, sessionKey: queryKey, queryOptions } = useContext(AuthQueryContext)
    const mergedOptions = { ...queryOptions, ...sessionQueryOptions, ...options }

    const [refetchEnabled, setRefetchEnabled] = useState(false)

    const queryResult = useQuery<SessionData>({
        refetchOnWindowFocus: refetchEnabled,
        refetchOnReconnect: refetchEnabled,
        staleTime: 60 * 1000,
        queryKey,
        queryFn: () => authClient.getSession({ fetchOptions: { throw: true } }),
        ...mergedOptions
    })

    const { updateUser, updateUserAsync, updateUserError, updateUserPending } =
        useUpdateUser(authClient)

    const { data, refetch } = queryResult

    useEffect(() => {
        setRefetchEnabled(!!data)
        if (!data) return

        const expiresAt = new Date(data.session.expiresAt).getTime()
        const expiresIn = expiresAt - Date.now()

        const timeout = setTimeout(() => refetch(), expiresIn)

        return () => clearTimeout(timeout)
    }, [data, refetch])

    const session = data?.session as Session | undefined
    const user = data?.user as User | undefined

    return {
        ...queryResult,
        session,
        user,
        updateUser,
        updateUserAsync,
        updateUserPending,
        updateUserError
    }
}
