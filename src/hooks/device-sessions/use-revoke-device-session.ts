import { useContext } from "react"
import { AuthQueryContext, type AuthQueryOptions } from "../../lib/auth-query-provider"
import type { MultiSessionAuthClient } from "../../types/auth-client"
import { useAuthMutation } from "../shared/use-auth-mutation"

export function useRevokeDeviceSession<TAuthClient extends MultiSessionAuthClient>(
    authClient: TAuthClient,
    options?: Partial<AuthQueryOptions>
) {
    type SessionData = TAuthClient["$Infer"]["Session"]

    const { listDeviceSessionsKey: queryKey } = useContext(AuthQueryContext)

    return useAuthMutation({
        queryKey,
        mutationFn: authClient.multiSession.revoke,
        optimisticData: ({ sessionToken }, previousSessionDatas: SessionData[]) =>
            previousSessionDatas.filter(
                (sessionData) => sessionData.session.token !== sessionToken
            ),
        options
    })
}
