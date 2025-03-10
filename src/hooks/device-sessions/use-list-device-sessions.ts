import { skipToken } from "@tanstack/query-core"
import { type AnyUseQueryOptions, useQuery } from "@tanstack/react-query"
import { useContext } from "react"

import { AuthQueryContext } from "../../lib/auth-query-provider"

import type { MultiSessionAuthClient } from "../../types/auth-client"
import { useSession } from "../session/use-session"
import { useRevokeDeviceSession } from "./use-revoke-device-session"
import { useSetActiveSession } from "./use-set-active-session"

export function useListDeviceSessions<TAuthClient extends MultiSessionAuthClient>(
    authClient: TAuthClient,
    options?: Partial<AnyUseQueryOptions>
) {
    type SessionData = TAuthClient["$Infer"]["Session"]
    type User = TAuthClient["$Infer"]["Session"]["user"]
    type Session = TAuthClient["$Infer"]["Session"]["session"]

    const { session } = useSession(authClient)
    const { queryOptions, listDeviceSessionsKey: queryKey } = useContext(AuthQueryContext)

    const mergedOptions = { ...queryOptions, ...options }

    const queryResult = useQuery<SessionData[]>({
        ...mergedOptions,
        queryKey,
        queryFn: session
            ? () => authClient.multiSession.listDeviceSessions({ fetchOptions: { throw: true } })
            : skipToken
    })

    const { data: deviceSessions } = queryResult

    const {
        revokeDeviceSession,
        revokeDeviceSessionAsync,
        revokeDeviceSessionPending,
        revokeDeviceSessionError
    } = useRevokeDeviceSession(authClient)

    const {
        setActiveSession,
        setActiveSessionAsync,
        setActiveSessionPending,
        setActiveSessionError
    } = useSetActiveSession(authClient)

    return {
        ...queryResult,
        deviceSessions,
        revokeDeviceSession,
        revokeDeviceSessionAsync,
        revokeDeviceSessionPending,
        revokeDeviceSessionError,
        setActiveSession,
        setActiveSessionAsync,
        setActiveSessionPending,
        setActiveSessionError
    }
}
