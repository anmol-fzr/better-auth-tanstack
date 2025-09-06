import { useAuthQueryContext, type AuthQueryOptions } from "../../lib/auth-query-provider"
import type { AuthClient } from "../../types/auth-client"
import { useAuthMutation } from "../shared/use-auth-mutation"

export function useRevokeDeviceSessions<TAuthClient extends AuthClient>(
    authClient: TAuthClient,
    options?: AuthQueryOptions
) {
    const { listDeviceSessionsKey: queryKey } = useAuthQueryContext()

    return useAuthMutation({
        queryKey,
        mutationFn: authClient.revokeSessions,
        options
    })
}
