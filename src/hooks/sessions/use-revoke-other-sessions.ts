import { useAuthQueryContext, type AuthQueryOptions } from "../../lib/auth-query-provider"
import type { AnyAuthClient } from "../../types/any-auth-client"
import { useSession } from "../session/use-session"
import { useAuthMutation } from "../shared/use-auth-mutation"

export function useRevokeOtherSessions<TAuthClient extends AnyAuthClient>(
    authClient: TAuthClient,
    options?: Partial<AuthQueryOptions>
) {
    type Session = TAuthClient["$Infer"]["Session"]["session"]

    const { listSessionsKey: queryKey } = useAuthQueryContext()
    const { data: sessionData } = useSession(authClient)

    return useAuthMutation({
        queryKey,
        mutationFn: authClient.revokeOtherSessions,
        options
    })
}
