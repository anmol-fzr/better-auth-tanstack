import { useContext } from "react"
import { AuthQueryContext, type AuthQueryOptions } from "../../lib/auth-query-provider"
import type { AuthClient } from "../../types/auth-client"
import type { ListAccount } from "../../types/list-account"
import { useAuthMutation } from "../shared/use-auth-mutation"

export function useUnlinkAccount<TAuthClient extends AuthClient>(
    authClient: TAuthClient,
    options?: AuthQueryOptions
) {
    type UnlinkAccountParams = Parameters<TAuthClient["unlinkAccount"]>[0]

    const { listAccountsKey: queryKey } = useContext(AuthQueryContext)

    const mutation = useAuthMutation<UnlinkAccountParams, ListAccount[]>({
        queryKey,
        mutationFn: ({ fetchOptions = { throw: true }, ...params }) =>
            authClient.unlinkAccount({ fetchOptions, ...params }),
        optimisticData: ({ providerId }, previousAccounts) =>
            previousAccounts.filter((account) => account.provider !== providerId),
        options
    })

    const {
        mutate: unlinkAccount,
        mutateAsync: unlinkAccountAsync,
        isPending: unlinkAccountPending,
        error: unlinkAccountError
    } = mutation

    return {
        ...mutation,
        unlinkAccount,
        unlinkAccountAsync,
        unlinkAccountPending,
        unlinkAccountError
    }
}
