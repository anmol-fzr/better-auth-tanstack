import type { AnyUseQueryOptions } from "@tanstack/react-query"
import { useQueryClient } from "@tanstack/react-query"
import type { createAuthClient } from "better-auth/react"
import { useContext } from "react"

import { useListAccounts } from "../hooks/accounts/use-list-accounts"
import { useListDeviceSessions } from "../hooks/device-sessions/use-list-device-sessions"
import { useSession } from "../hooks/session/use-session"
import { useListSessions } from "../hooks/sessions/use-list-sessions"
import { useToken } from "../hooks/token/use-token"

import { useUpdateUser } from "../hooks/session/use-update-user"
import { AuthQueryContext } from "./auth-query-provider"
import { prefetchSession } from "./prefetch-session"

export function createAuthHooks<
    TAuthClient extends Omit<ReturnType<typeof createAuthClient>, "signUp">
>(authClient: TAuthClient) {
    return {
        useSession: (
            options?: Omit<AnyUseQueryOptions, "queryKey" | "queryFn">
        ) => {
            return useSession<TAuthClient>(authClient, options)
        },
        useUpdateUser: () => {
            return useUpdateUser<TAuthClient>(authClient)
        },
        usePrefetchSession: (
            options?: Omit<AnyUseQueryOptions, "queryKey" | "queryFn">
        ) => {
            const queryClient = useQueryClient()
            const queryOptions = useContext(AuthQueryContext)
            return {
                prefetch: () => {
                    return prefetchSession<TAuthClient>(
                        authClient,
                        queryClient,
                        queryOptions,
                        options
                    )
                }
            }
        },
        useToken: (
            options?: Omit<AnyUseQueryOptions, "queryKey" | "queryFn">
        ) => {
            return useToken<TAuthClient>(authClient, options)
        },
        useListAccounts: (
            options?: Omit<AnyUseQueryOptions, "queryKey" | "queryFn">
        ) => {
            return useListAccounts<TAuthClient>(authClient, options)
        },
        useListSessions: (
            options?: Omit<AnyUseQueryOptions, "queryKey" | "queryFn">
        ) => {
            return useListSessions<TAuthClient>(authClient, options)
        },
        useListDeviceSessions: (
            options?: Omit<AnyUseQueryOptions, "queryKey" | "queryFn">
        ) => {
            return useListDeviceSessions<TAuthClient>(authClient, options)
        }
    }
}
