import type { AnyUseQueryOptions, QueryKey } from "@tanstack/react-query"
import { useQueryClient } from "@tanstack/react-query"
import { useContext } from "react"

import { useListAccounts } from "../hooks/accounts/use-list-accounts"
import { useUnlinkAccount } from "../hooks/accounts/use-unlink-account"
import { useListDeviceSessions } from "../hooks/device-sessions/use-list-device-sessions"
import { useRevokeDeviceSession } from "../hooks/device-sessions/use-revoke-device-session"
import { useSetActiveSession } from "../hooks/device-sessions/use-set-active-session"
import { useDeletePasskey } from "../hooks/passkeys/use-delete-passkey"
import { useListPasskeys } from "../hooks/passkeys/use-list-passkeys"
import { useSession } from "../hooks/session/use-session"
import { useUpdateUser } from "../hooks/session/use-update-user"
import { useListSessions } from "../hooks/sessions/use-list-sessions"
import { useRevokeOtherSessions } from "../hooks/sessions/use-revoke-other-sessions"
import { useRevokeSession } from "../hooks/sessions/use-revoke-session"
import { useRevokeSessions } from "../hooks/sessions/use-revoke-sessions"
import { useAuthMutation } from "../hooks/shared/use-auth-mutation"
import { type BetterFetchRequest, useAuthQuery } from "../hooks/shared/use-auth-query"
import { useToken } from "../hooks/token/use-token"
import type { AnyAuthClient } from "../types/any-auth-client"
import type { AuthClient } from "../types/auth-client"
import { AuthQueryContext, type AuthQueryOptions } from "./auth-query-provider"
import { prefetchSession } from "./prefetch-session"

export function createAuthHooks<TAuthClient extends AnyAuthClient>(authClient: TAuthClient) {
    return {
        useSession: (options?: Partial<AnyUseQueryOptions>) => useSession(authClient, options),
        usePrefetchSession: (options?: Partial<AnyUseQueryOptions>) => {
            const queryClient = useQueryClient()
            const queryOptions = useContext(AuthQueryContext)

            return {
                prefetch: () => prefetchSession(authClient, queryClient, queryOptions, options)
            }
        },
        useUpdateUser: (options?: Partial<AuthQueryOptions>) => useUpdateUser(authClient, options),
        useToken: (options?: Partial<AnyUseQueryOptions>) => useToken(authClient, options),
        useAuthQuery: <TData>({
            queryKey,
            queryFn,
            options
        }: {
            queryKey: QueryKey
            queryFn: BetterFetchRequest<TData>
            options?: Partial<AnyUseQueryOptions>
        }) => useAuthQuery({ authClient, queryKey, queryFn, options }),
        useListAccounts: (options?: Partial<AnyUseQueryOptions>) =>
            useListAccounts(authClient, options),
        useUnlinkAccount: () => useUnlinkAccount(authClient),
        useListSessions: (options?: Partial<AnyUseQueryOptions>) =>
            useListSessions(authClient, options),
        useRevokeSession: (options?: Partial<AuthQueryOptions>) =>
            useRevokeSession(authClient, options),
        useRevokeSessions: (options?: Partial<AuthQueryOptions>) =>
            useRevokeSessions(authClient, options),
        useRevokeOtherSessions: (options?: Partial<AuthQueryOptions>) =>
            useRevokeOtherSessions(authClient, options),
        useListDeviceSessions: (options?: Partial<AnyUseQueryOptions>) =>
            useListDeviceSessions(authClient as AuthClient, options),
        useRevokeDeviceSession: (options?: Partial<AuthQueryOptions>) =>
            useRevokeDeviceSession(authClient as AuthClient, options),
        useSetActiveSession: (options?: Partial<AuthQueryOptions>) =>
            useSetActiveSession(authClient as AuthClient, options),
        useListPasskeys: (options?: Partial<AnyUseQueryOptions>) =>
            useListPasskeys(authClient as AuthClient, options),
        useDeletePasskey: (options?: Partial<AuthQueryOptions>) =>
            useDeletePasskey(authClient as AuthClient, options),
        useAuthMutation: useAuthMutation
    }
}
