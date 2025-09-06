import type { AnyUseQueryOptions } from "@tanstack/react-query"

import { useAuthQueryContext } from "../../lib/auth-query-provider"

import type { AuthClient } from "../../types/auth-client"
import { useAuthQuery } from "../shared/use-auth-query"

export function useListApiKeys<TAuthClient extends AuthClient>(
    authClient: TAuthClient,
    options?: Partial<AnyUseQueryOptions>
) {
    const { listApiKeysKey: queryKey } = useAuthQueryContext()

    return useAuthQuery({
        authClient,
        queryKey,
        queryFn: authClient.apiKey.list,
        options
    })
}
