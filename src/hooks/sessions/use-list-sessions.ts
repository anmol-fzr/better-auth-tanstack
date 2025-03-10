import { skipToken } from "@tanstack/query-core"
import { type AnyUseQueryOptions, useQuery } from "@tanstack/react-query"
import { useContext } from "react"

import { AuthQueryContext } from "../../lib/auth-query-provider"
import type { AuthClient } from "../../types/auth-client"
import { useSession } from "../session/use-session"
import { useRevokeOtherSessions } from "./use-revoke-other-sessions"
import { useRevokeSession } from "./use-revoke-session"
import { useRevokeSessions } from "./use-revoke-sessions"

export function useListSessions<TAuthClient extends AuthClient>(
    authClient: TAuthClient,
    options?: AnyUseQueryOptions
) {
    type Session = TAuthClient["$Infer"]["Session"]["session"]

    const { session } = useSession(authClient)
    const { listSessionsKey: queryKey, queryOptions } = useContext(AuthQueryContext)
    const mergedOptions = { ...queryOptions, ...options }

    const queryResult = useQuery<Session[]>({
        queryKey,
        queryFn: session
            ? () => authClient.listSessions({ fetchOptions: { throw: true } })
            : skipToken,
        ...mergedOptions
    })

    const { revokeSession, revokeSessionAsync, revokeSessionPending, revokeSessionError } =
        useRevokeSession(authClient)

    const { revokeSessions, revokeSessionsAsync, revokeSessionsPending, revokeSessionsError } =
        useRevokeSessions(authClient)

    const {
        revokeOtherSessions,
        revokeOtherSessionsAsync,
        revokeOtherSessionsPending,
        revokeOtherSessionsError
    } = useRevokeOtherSessions(authClient)

    return {
        ...queryResult,
        sessions: queryResult.data,
        revokeSession,
        revokeSessionAsync,
        revokeSessionPending,
        revokeSessionError,
        revokeSessions,
        revokeSessionsAsync,
        revokeSessionsPending,
        revokeSessionsError,
        revokeOtherSessions,
        revokeOtherSessionsAsync,
        revokeOtherSessionsPending,
        revokeOtherSessionsError
    }
}
