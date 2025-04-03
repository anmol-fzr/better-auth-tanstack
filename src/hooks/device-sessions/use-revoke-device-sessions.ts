import { useContext } from "react"
import { AuthQueryContext, type AuthQueryOptions } from "../../lib/auth-query-provider"
import type { MultiSessionAuthClient } from "../../types/auth-client"
import { useAuthMutation } from "../shared/use-auth-mutation"

export function useRevokeDeviceSessions<TAuthClient extends MultiSessionAuthClient>(
    authClient: TAuthClient,
    options?: AuthQueryOptions
) {
    const { listDeviceSessionsKey: queryKey } = useContext(AuthQueryContext)

    return useAuthMutation({
        queryKey,
        mutationFn: authClient.revokeSessions,
        options
    })
}
