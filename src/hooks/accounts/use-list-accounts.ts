import { type Query, skipToken } from "@tanstack/query-core"
import { type AnyUseQueryOptions, useQuery } from "@tanstack/react-query"
import { useMutation } from "@tanstack/react-query"
import { useQueryClient } from "@tanstack/react-query"
import type { createAuthClient } from "better-auth/react"
import { useCallback, useContext } from "react"

import { AuthQueryContext } from "../../lib/auth-query-provider"

import type { FetchError } from "../../types/fetch-error"
import { useSession } from "../session/use-session"

type Account = {
    id: string
    provider: string
    createdAt: Date
    updatedAt: Date
    accountId: string
    scopes: string[]
}

export function useListAccounts<
    TAuthClient extends Omit<ReturnType<typeof createAuthClient>, "signUp">
>(
    authClient: TAuthClient,
    options?: Omit<AnyUseQueryOptions, "queryKey" | "queryFn">
) {
    const queryClient = useQueryClient()
    const { session } = useSession(authClient)
    const {
        queryOptions,
        listAccountsKey: queryKey,
        optimistic
    } = useContext(AuthQueryContext)

    const mergedOptions = { ...queryOptions, ...options }

    const queryResult = useQuery<Account[]>({
        ...mergedOptions,
        queryKey,
        queryFn: session
            ? async () =>
                  await authClient.listAccounts({
                      fetchOptions: { throw: true }
                  })
            : skipToken
    })

    const { refetch } = queryResult

    const { error: unlinkAccountError, mutateAsync: unlinkAccountAsync } =
        useMutation({
            mutationFn: async (providerId: string) =>
                await authClient.unlinkAccount({
                    providerId,
                    fetchOptions: { throw: true }
                }),
            onMutate: async (providerId) => {
                if (!optimistic) return
                await queryClient.cancelQueries({ queryKey })

                const previousAccounts = queryClient.getQueryData(
                    queryKey
                ) as Account[]

                if (!previousAccounts) return

                queryClient.setQueryData(
                    queryKey,
                    previousAccounts.filter(
                        (account) => account.provider !== providerId
                    )
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
