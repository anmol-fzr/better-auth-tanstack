import { useAuthQueryContext, type AuthQueryOptions } from "../../lib/auth-query-provider"
import type { AuthClient } from "../../types/auth-client"
import { useAuthMutation } from "../shared/use-auth-mutation"

export function useRevokeDeviceSession<TAuthClient extends AuthClient>(
    authClient: TAuthClient,
    options?: Partial<AuthQueryOptions>
) {
    const { listDeviceSessionsKey: queryKey } = useAuthQueryContext()

    return useAuthMutation({
        queryKey,
        mutationFn: authClient.multiSession.revoke,
        options
    })
}
