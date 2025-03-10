import { useContext } from "react"
import { AuthQueryContext, type AuthQueryOptions } from "../../lib/auth-query-provider"
import type { AuthClient } from "../../types/auth-client"
import { useSession } from "../session/use-session"
import { useAuthMutation } from "../shared/use-auth-mutation"

export function useRevokeOtherSessions<TAuthClient extends AuthClient>(
    authClient: TAuthClient,
    options?: AuthQueryOptions
) {
    type Session = TAuthClient["$Infer"]["Session"]["session"]
    type RevokeOtherSessionsParams = Parameters<TAuthClient["revokeOtherSessions"]>[0]

    const { listSessionsKey: queryKey } = useContext(AuthQueryContext)
    const { session } = useSession(authClient)

    const mutation = useAuthMutation<RevokeOtherSessionsParams, Session[]>({
        queryKey,
        mutationFn: ({ fetchOptions = { throw: true }, ...params }) =>
            authClient.revokeOtherSessions({ fetchOptions, ...params }),
        optimisticData: (_, previousSessions) =>
            previousSessions.filter((previousSession) => previousSession.token !== session?.token),
        options
    })

    const {
        mutate: revokeOtherSessions,
        mutateAsync: revokeOtherSessionsAsync,
        isPending: revokeOtherSessionsPending,
        error: revokeOtherSessionsError
    } = mutation

    return {
        ...mutation,
        revokeOtherSessions,
        revokeOtherSessionsAsync,
        revokeOtherSessionsPending,
        revokeOtherSessionsError
    }
}
