import { type Query, skipToken } from "@tanstack/query-core"
import { type AnyUseQueryOptions, useQuery } from "@tanstack/react-query"
import { useMutation } from "@tanstack/react-query"
import { useQueryClient } from "@tanstack/react-query"
import { useCallback, useContext } from "react"

import { AuthQueryContext } from "../../lib/auth-query-provider"
import type { AuthClient } from "../../types/auth-client"
import type { FetchError } from "../../types/fetch-error"
import type { ListAccount } from "../../types/list-account"
import { useSession } from "../session/use-session"

export function useListAccounts<TAuthClient extends AuthClient>(
    authClient: TAuthClient,
    options?: AnyUseQueryOptions
) {
    const queryClient = useQueryClient()
    const { session } = useSession(authClient)
    const { queryOptions, listAccountsKey: queryKey, optimistic } = useContext(AuthQueryContext)

    const mergedOptions = { ...queryOptions, ...options }

    const queryResult = useQuery<ListAccount[]>({
        queryKey,
        queryFn: session
            ? () => authClient.listAccounts({ fetchOptions: { throw: true } })
            : skipToken,
        ...mergedOptions
    })

    const { refetch } = queryResult

    const { error: unlinkAccountError, mutateAsync: unlinkAccountAsync } = useMutation({
        mutationFn: async (providerId: string) =>
            await authClient.unlinkAccount({
                providerId,
                fetchOptions: { throw: true }
            }),
        onMutate: async (providerId) => {
            if (!optimistic) return
            await queryClient.cancelQueries({ queryKey })

            const previousAccounts = queryClient.getQueryData(queryKey) as ListAccount[]

            if (!previousAccounts) return

            queryClient.setQueryData(
                queryKey,
                previousAccounts.filter((account) => account.provider !== providerId)
            )

            // Return a context object with the snapshotted value
            return { previousAccounts }
        },
        // If the mutation fails,
        // use the context returned from onMutate to roll back
        onError: (error, providerId, context) => {
            if (error) {
                console.error(error)
                queryClient.getQueryCache().config.onError?.(error, {
                    queryKey
                } as unknown as Query<unknown, unknown>)
            }

            if (!optimistic || !context?.previousAccounts) return

            queryClient.setQueryData(queryKey, context.previousAccounts)
        },
        onSettled: () => refetch()
    })

    const unlinkAccount = useCallback(
        async (providerId: string) => {
            try {
                return await unlinkAccountAsync(providerId)
            } catch (error) {
                return { error: error as FetchError }
            }
        },
        [unlinkAccountAsync]
    )

    return {
        ...queryResult,
        accounts: queryResult.data,
        unlinkAccount,
        unlinkAccountError
    }
}
