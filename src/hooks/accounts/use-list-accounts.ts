import { skipToken } from "@tanstack/query-core"
import { type AnyUseQueryOptions, useQuery } from "@tanstack/react-query"
import { useContext } from "react"

import { AuthQueryContext } from "../../lib/auth-query-provider"
import type { AuthClient } from "../../types/auth-client"
import type { ListAccount } from "../../types/list-account"
import { useSession } from "../session/use-session"
import { useUnlinkAccount } from "./use-unlink-account"

export function useListAccounts<TAuthClient extends AuthClient>(
    authClient: TAuthClient,
    options?: Partial<AnyUseQueryOptions>
) {
    const { session } = useSession(authClient)
    const { queryOptions, listAccountsKey: queryKey } = useContext(AuthQueryContext)
    const mergedOptions = { ...queryOptions, ...options }

    const queryResult = useQuery<ListAccount[]>({
        queryKey,
        queryFn: session
            ? () => authClient.listAccounts({ fetchOptions: { throw: true } })
            : skipToken,
        ...mergedOptions
    })

    const { unlinkAccount, unlinkAccountAsync, unlinkAccountPending, unlinkAccountError } =
        useUnlinkAccount(authClient)

    return {
        ...queryResult,
        accounts: queryResult.data,
        unlinkAccount,
        unlinkAccountAsync,
        unlinkAccountPending,
        unlinkAccountError
    }
}
