import type { AnyUseQueryOptions, QueryClient } from "@tanstack/react-query"

import type { AuthClient, MultiSessionAuthClient } from "../types/auth-client"
import type { AuthQueryOptions } from "./auth-query-provider"

export async function prefetchSession<TAuthClient extends AuthClient>(
    authClient: TAuthClient,
    queryClient: QueryClient,
    queryOptions?: AuthQueryOptions,
    options?: Partial<AnyUseQueryOptions>
) {
    const { error, data } = await (authClient as MultiSessionAuthClient).getSession()

    const mergedOptions = {
        ...queryOptions?.queryOptions,
        ...queryOptions?.sessionQueryOptions,
        ...options
    }

    await queryClient.prefetchQuery({
        ...mergedOptions,
        queryKey: queryOptions?.sessionKey,
        queryFn: () => data as SessionData
    })

    type SessionData = TAuthClient["$Infer"]["Session"]
    type User = TAuthClient["$Infer"]["Session"]["user"]
    type Session = TAuthClient["$Infer"]["Session"]["session"]

    return {
        error,
        data: data,
        session: data?.session as Session | undefined,
        user: data?.user as User | undefined
    }
}
