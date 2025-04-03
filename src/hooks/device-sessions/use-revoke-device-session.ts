import { useContext } from "react"
import { AuthQueryContext, type AuthQueryOptions } from "../../lib/auth-query-provider"
import type { MultiSessionAuthClient } from "../../types/auth-client"
import { useAuthMutation } from "../shared/use-auth-mutation"

export function useRevokeDeviceSession<TAuthClient extends MultiSessionAuthClient>(
    authClient: TAuthClient,
    options?: Partial<AuthQueryOptions>
) {
    type SessionData = TAuthClient["$Infer"]["Session"]
    type RevokeDeviceSessionParams = Parameters<TAuthClient["multiSession"]["revoke"]>[0]

    const { listDeviceSessionsKey: queryKey } = useContext(AuthQueryContext)

    const mutation = useAuthMutation<RevokeDeviceSessionParams, SessionData[]>({
        queryKey,
        mutationFn: ({ fetchOptions = { throw: true }, ...params }) =>
            authClient.multiSession.revoke({ fetchOptions, ...params }),
        optimisticData: ({ sessionToken }, previousSessionDatas) =>
            previousSessionDatas.filter(
                (sessionData) => sessionData.session.token !== sessionToken
            ),
        options
    })

    const {
        mutate: revokeDeviceSession,
        mutateAsync: revokeDeviceSessionAsync,
        isPending: revokeDeviceSessionPending,
        error: revokeDeviceSessionError
    } = mutation

    return {
        ...mutation,
        revokeDeviceSession,
        revokeDeviceSessionAsync,
        revokeDeviceSessionPending,
        revokeDeviceSessionError
    }
}
