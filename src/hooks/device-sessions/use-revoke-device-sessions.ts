import { useContext } from "react"
import { AuthQueryContext, type AuthQueryOptions } from "../../lib/auth-query-provider"
import type { MultiSessionAuthClient } from "../../types/auth-client"
import { useAuthMutation } from "../shared/use-auth-mutation"

export function useRevokeDeviceSessions<TAuthClient extends MultiSessionAuthClient>(
    authClient: TAuthClient,
    options?: AuthQueryOptions
) {
    type SessionData = TAuthClient["$Infer"]["Session"]
    type RevokeDeviceSessionsParams = Parameters<TAuthClient["multiSession"]["revoke"]>[0]

    const { listDeviceSessionsKey: queryKey } = useContext(AuthQueryContext)

    const mutation = useAuthMutation<RevokeDeviceSessionsParams, SessionData[]>({
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
