import { useContext } from "react"
import { AuthQueryContext, type AuthQueryOptions } from "../../lib/auth-query-provider"
import type { AuthClient } from "../../types/auth-client"
import { useAuthMutation } from "../shared/use-auth-mutation"

export function useRevokeSession<TAuthClient extends AuthClient>(
    authClient: TAuthClient,
    options?: Partial<AuthQueryOptions>
) {
    type Session = TAuthClient["$Infer"]["Session"]["session"]
    type RevokeSessionParams = Parameters<TAuthClient["revokeSession"]>[0]

    const { listSessionsKey: queryKey } = useContext(AuthQueryContext)

    const mutation = useAuthMutation<RevokeSessionParams, Session[]>({
        queryKey,
        mutationFn: ({ fetchOptions = { throw: true }, ...params }) =>
            authClient.revokeSession({ fetchOptions, ...params }),
        optimisticData: ({ token }, previousSessions) =>
            previousSessions.filter((session) => session.token !== token),
        options
    })

    const {
        mutate: revokeSession,
        mutateAsync: revokeSessionAsync,
        isPending: revokeSessionPending,
        error: revokeSessionError
    } = mutation

    return {
        ...mutation,
        revokeSession,
        revokeSessionAsync,
        revokeSessionPending,
        revokeSessionError
    }
}
