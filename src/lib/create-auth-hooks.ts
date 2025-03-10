import type { AnyUseQueryOptions } from "@tanstack/react-query"
import { useQueryClient } from "@tanstack/react-query"
import { useContext } from "react"

import { useListAccounts } from "../hooks/accounts/use-list-accounts"
import { useListDeviceSessions } from "../hooks/device-sessions/use-list-device-sessions"
import { useSession } from "../hooks/session/use-session"
import { useListSessions } from "../hooks/sessions/use-list-sessions"
import { useToken } from "../hooks/token/use-token"

import { useUnlinkAccount } from "../hooks/accounts/use-unlink-account"
import { useUpdateUser } from "../hooks/session/use-update-user"
import type { AuthClient } from "../types/auth-client"
import { AuthQueryContext } from "./auth-query-provider"
import { prefetchSession } from "./prefetch-session"

export function createAuthHooks<TAuthClient extends AuthClient>(authClient: TAuthClient) {
    return {
        useSession: (options?: AnyUseQueryOptions) => useSession(authClient, options),
        usePrefetchSession: (options?: AnyUseQueryOptions) => {
            const queryClient = useQueryClient()
            const queryOptions = useContext(AuthQueryContext)

            return {
                prefetch: () => prefetchSession(authClient, queryClient, queryOptions, options)
            }
        },
        useUpdateUser: () => useUpdateUser(authClient),
        useToken: (options?: AnyUseQueryOptions) => useToken(authClient, options),
        useListAccounts: (options?: AnyUseQueryOptions) => useListAccounts(authClient, options),
        useUnlinkAccount: () => useUnlinkAccount(authClient),
        useListSessions: (options?: AnyUseQueryOptions) => useListSessions(authClient, options),
        useListDeviceSessions: (options?: AnyUseQueryOptions) =>
            useListDeviceSessions(authClient, options)
    }
}
