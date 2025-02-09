import type { AnyUseQueryOptions } from "@tanstack/react-query"
import { useQueryClient } from "@tanstack/react-query"
import { createAuthClient } from "better-auth/react"
import { useContext } from "react"

import { useListAccounts } from "../hooks/use-list-accounts"
import { useListSessions } from "../hooks/use-list-sessions"
import { useSession } from "../hooks/use-session"
import { useToken } from "../hooks/use-token"

import { AuthQueryContext } from "./auth-query-provider"
import { prefetchSession } from "./prefetch-session"

export function createAuthHooks<
    TAuthClient extends Omit<ReturnType<typeof createAuthClient>, "signUp">
>(
    authClient: TAuthClient
) {
    return {
        useSession: (options?: Omit<AnyUseQueryOptions, "queryKey" | "queryFn">) => {
            return useSession<TAuthClient>(authClient, options)
        },
        usePrefetchSession: (options?: Omit<AnyUseQueryOptions, "queryKey" | "queryFn">) => {
            const queryClient = useQueryClient()
            const queryOptions = useContext(AuthQueryContext)
            return {
                prefetch: () => {
                    return prefetchSession<TAuthClient>(authClient, queryClient, queryOptions, options)
                }
            }
        },
        useToken: (options?: Omit<AnyUseQueryOptions, "queryKey" | "queryFn">) => {
            return useToken<TAuthClient>(authClient, options)
        },
        useListAccounts: (options?: Omit<AnyUseQueryOptions, "queryKey" | "queryFn">) => {
            return useListAccounts<TAuthClient>(authClient, options)
        },
        useListSessions: (options?: Omit<AnyUseQueryOptions, "queryKey" | "queryFn">) => {
            return useListSessions<TAuthClient>(authClient, options)
        }
    }
}
