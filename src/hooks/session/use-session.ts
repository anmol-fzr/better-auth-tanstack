import { type AnyUseQueryOptions, useQuery } from "@tanstack/react-query"
import { useContext } from "react"

import { AuthQueryContext } from "../../lib/auth-query-provider"
import type { AuthClient, MultiSessionAuthClient } from "../../types/auth-client"

export function useSession<TAuthClient extends AuthClient>(
    authClient: TAuthClient,
    options?: Partial<AnyUseQueryOptions>
) {
    type SessionData = TAuthClient["$Infer"]["Session"]
    type User = TAuthClient["$Infer"]["Session"]
    type Session = TAuthClient["$Infer"]["Session"]

    const { sessionQueryOptions, sessionKey: queryKey, queryOptions } = useContext(AuthQueryContext)
    const mergedOptions = { ...queryOptions, ...sessionQueryOptions, ...options }

    const result = useQuery<SessionData>({
        queryKey,
        queryFn: () =>
            (authClient as MultiSessionAuthClient).getSession({ fetchOptions: { throw: true } }),
        ...mergedOptions
    })

    return {
        ...result,
        session: result.data?.session as Session | undefined,
        user: result.data?.user as User | undefined
    }
}
