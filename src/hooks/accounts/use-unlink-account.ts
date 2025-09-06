import { useAuthQueryContext, type AuthQueryOptions } from "../../lib/auth-query-provider"
import type { AnyAuthClient } from "../../types/any-auth-client"
import { useAuthMutation } from "../shared/use-auth-mutation"

export function useUnlinkAccount<TAuthClient extends AnyAuthClient>(
    authClient: TAuthClient,
    options?: AuthQueryOptions
) {
    const { listAccountsKey: queryKey } = useAuthQueryContext()

    return useAuthMutation({
        queryKey,
        mutationFn: authClient.unlinkAccount,
        options
    })
}
