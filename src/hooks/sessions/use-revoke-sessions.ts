import { useContext } from "react"
import { AuthQueryContext, type AuthQueryOptions } from "../../lib/auth-query-provider"
import type { AuthClient } from "../../types/auth-client"
import { useAuthMutation } from "../shared/use-auth-mutation"

export function useRevokeSessions<TAuthClient extends AuthClient>(
    authClient: TAuthClient,
    options?: Partial<AuthQueryOptions>
) {
    type Session = TAuthClient["$Infer"]["Session"]["session"]
    type RevokeSessionsParams = Parameters<TAuthClient["revokeSessions"]>[0]

    const { listSessionsKey: queryKey } = useContext(AuthQueryContext)

    const mutation = useAuthMutation<RevokeSessionsParams, Session[]>({
        queryKey,
        mutationFn: ({ fetchOptions = { throw: true }, ...params }) =>
            authClient.revokeSessions({ fetchOptions, ...params }),
        optimisticData: () => [],
        options
    })

    const {
        mutate: revokeSessions,
        mutateAsync: revokeSessionsAsync,
        isPending: revokeSessionsPending,
        error: revokeSessionsError
    } = mutation

    return {
        ...mutation,
        revokeSessions,
        revokeSessionsAsync,
        revokeSessionsPending,
        revokeSessionsError
    }
}
