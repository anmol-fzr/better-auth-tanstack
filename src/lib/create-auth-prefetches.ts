import type { AnyUseQueryOptions, QueryClient } from "@tanstack/react-query"
import { createAuthClient } from "better-auth/react"

import { type AuthQueryOptions, defaultAuthQueryOptions } from "./auth-query-provider"
import { prefetchSession } from "./prefetch-session"

export function createAuthPrefetches<
    TAuthClient extends Omit<ReturnType<typeof createAuthClient>, "signUp">,
>(
    authClient: TAuthClient,
    queryOptions?: AuthQueryOptions
) {
    return {
        prefetchSession: (queryClient: QueryClient, options?: Omit<AnyUseQueryOptions, "queryKey" | "queryFn">) => {
            return prefetchSession<TAuthClient>(authClient, queryClient, { ...defaultAuthQueryOptions, ...queryOptions }, options)
        }
    }
}