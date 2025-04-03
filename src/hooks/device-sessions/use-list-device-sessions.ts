import type { AnyUseQueryOptions } from "@tanstack/react-query"
import { useContext } from "react"

import { AuthQueryContext } from "../../lib/auth-query-provider"

import type { MultiSessionAuthClient } from "../../types/auth-client"
import { useAuthQuery } from "../shared/use-auth-query"

export function useListDeviceSessions<TAuthClient extends MultiSessionAuthClient>(
    authClient: TAuthClient,
    options?: Partial<AnyUseQueryOptions>
) {
    const { listDeviceSessionsKey: queryKey } = useContext(AuthQueryContext)

    return useAuthQuery({
        authClient,
        queryKey,
        queryFn: authClient.multiSession.listDeviceSessions,
        options
    })
}
