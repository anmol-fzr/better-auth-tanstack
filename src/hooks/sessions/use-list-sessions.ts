import type { AnyUseQueryOptions } from "@tanstack/react-query"

import { useAuthQueryContext } from "../../lib/auth-query-provider"
import type { AnyAuthClient } from "../../types/any-auth-client"
import { useAuthQuery } from "../shared/use-auth-query"

export function useListSessions<TAuthClient extends AnyAuthClient>(
    authClient: TAuthClient,
    options?: Partial<AnyUseQueryOptions>
) {
    const { listSessionsKey: queryKey } = useAuthQueryContext()
    return useAuthQuery({ authClient, queryKey, queryFn: authClient.listSessions, options })
}
