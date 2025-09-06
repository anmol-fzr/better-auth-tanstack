import { useAuthQueryContext, type AuthQueryOptions } from "../../lib/auth-query-provider"
import type { AnyAuthClient } from "../../types/any-auth-client"
import { useAuthMutation } from "../shared/use-auth-mutation"

export function useRevokeSessions<TAuthClient extends AnyAuthClient>(
    authClient: TAuthClient,
    options?: Partial<AuthQueryOptions>
) {
    const { listSessionsKey: queryKey } = useAuthQueryContext()

    return useAuthMutation({
        queryKey,
        mutationFn: authClient.revokeSessions,
        options
    })
}
