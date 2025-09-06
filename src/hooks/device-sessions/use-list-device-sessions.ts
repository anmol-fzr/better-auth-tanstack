import type { AnyUseQueryOptions } from "@tanstack/react-query"

import { useAuthQueryContext } from "../../lib/auth-query-provider"

import type { AuthClient } from "../../types/auth-client"
import { useAuthQuery } from "../shared/use-auth-query"

export function useListDeviceSessions<TAuthClient extends AuthClient>(
    authClient: TAuthClient,
    options?: Partial<AnyUseQueryOptions>
) {
    const { listDeviceSessionsKey: queryKey } = useAuthQueryContext()

    return useAuthQuery({
        authClient,
        queryKey,
        queryFn: authClient.multiSession.listDeviceSessions,
        options
    })
}
