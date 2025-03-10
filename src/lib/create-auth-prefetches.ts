import type { AnyUseQueryOptions, QueryClient } from "@tanstack/react-query"

import type { AuthClient } from "../types/auth-client"
import { type AuthQueryOptions, defaultAuthQueryOptions } from "./auth-query-provider"
import { prefetchSession } from "./prefetch-session"

export function createAuthPrefetches<TAuthClient extends AuthClient>(
    authClient: TAuthClient,
    queryOptions?: AuthQueryOptions
) {
    return {
        prefetchSession: (queryClient: QueryClient, options?: AnyUseQueryOptions) => {
            return prefetchSession(
                authClient,
                queryClient,
                { ...defaultAuthQueryOptions, ...queryOptions },
                options
            )
        }
    }
}
