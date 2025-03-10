import type { AnyUseQueryOptions } from "@tanstack/react-query"
import { useQueryClient } from "@tanstack/react-query"
import { useContext } from "react"

import { useListAccounts } from "../hooks/accounts/use-list-accounts"
import { useListDeviceSessions } from "../hooks/device-sessions/use-list-device-sessions"
import { useSession } from "../hooks/session/use-session"
import { useListSessions } from "../hooks/sessions/use-list-sessions"
import { useToken } from "../hooks/token/use-token"

import { useUnlinkAccount } from "../hooks/accounts/use-unlink-account"
import { useRevokeDeviceSession } from "../hooks/device-sessions/use-revoke-device-session"
import { useSetActiveSession } from "../hooks/device-sessions/use-set-active-session"
import { useDeletePasskey } from "../hooks/passkeys/use-delete-passkey"
import { useListPasskeys } from "../hooks/passkeys/use-list-passkeys"
import { useUpdateUser } from "../hooks/session/use-update-user"
import { useRevokeOtherSessions } from "../hooks/sessions/use-revoke-other-sessions"
import { useRevokeSession } from "../hooks/sessions/use-revoke-session"
import { useRevokeSessions } from "../hooks/sessions/use-revoke-sessions"
import type { AuthClient, MultiSessionAuthClient, PasskeyAuthClient } from "../types/auth-client"
import { AuthQueryContext, type AuthQueryOptions } from "./auth-query-provider"
import { prefetchSession } from "./prefetch-session"

export function createAuthHooks<TAuthClient extends AuthClient>(authClient: TAuthClient) {
    return {
        useSession: (options?: Partial<AnyUseQueryOptions>) => useSession(authClient, options),
        usePrefetchSession: (options?: Partial<AnyUseQueryOptions>) => {
            const queryClient = useQueryClient()
            const queryOptions = useContext(AuthQueryContext)

            return {
                prefetch: () => prefetchSession(authClient, queryClient, queryOptions, options)
            }
        },
        useUpdateUser: (options?: AuthQueryOptions) => useUpdateUser(authClient, options),
        useToken: (options?: Partial<AnyUseQueryOptions>) => useToken(authClient, options),
        useListAccounts: (options?: Partial<AnyUseQueryOptions>) =>
            useListAccounts(authClient, options),
        useUnlinkAccount: () => useUnlinkAccount(authClient),
        useListSessions: (options?: Partial<AnyUseQueryOptions>) =>
            useListSessions(authClient, options),
        useRevokeSession: (options?: AuthQueryOptions) => useRevokeSession(authClient, options),
        useRevokeSessions: (options?: AuthQueryOptions) => useRevokeSessions(authClient, options),
        useRevokeOtherSessions: (options?: AuthQueryOptions) =>
            useRevokeOtherSessions(authClient, options),
        useListDeviceSessions: (options?: Partial<AnyUseQueryOptions>) =>
            useListDeviceSessions(authClient as MultiSessionAuthClient, options),
        useRevokeDeviceSession: (options?: AuthQueryOptions) =>
            useRevokeDeviceSession(authClient as MultiSessionAuthClient, options),
        useSetActiveSession: (options?: AuthQueryOptions) =>
            useSetActiveSession(authClient as MultiSessionAuthClient, options),
        useListPasskeys: (options?: Partial<AnyUseQueryOptions>) =>
            useListPasskeys(authClient as PasskeyAuthClient, options),
        useDeletePasskey: (options?: AuthQueryOptions) =>
            useDeletePasskey(authClient as PasskeyAuthClient, options)
    }
}
