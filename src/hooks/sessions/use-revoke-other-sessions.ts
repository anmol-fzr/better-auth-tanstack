import { useContext } from "react"
import { AuthQueryContext, type AuthQueryOptions } from "../../lib/auth-query-provider"
import type { AuthClient } from "../../types/auth-client"
import { useSession } from "../session/use-session"
import { useAuthMutation } from "../shared/use-auth-mutation"

export function useRevokeOtherSessions<TAuthClient extends AuthClient>(
    authClient: TAuthClient,
    options?: Partial<AuthQueryOptions>
) {
    type Session = TAuthClient["$Infer"]["Session"]["session"]

    const { listSessionsKey: queryKey } = useContext(AuthQueryContext)
    const { data: sessionData } = useSession(authClient)

    return useAuthMutation({
        queryKey,
        mutationFn: authClient.revokeOtherSessions,
        options
    })
}
