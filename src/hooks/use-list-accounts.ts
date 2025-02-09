import { type Query, skipToken } from "@tanstack/query-core"
import { AnyUseQueryOptions, useQuery } from "@tanstack/react-query"
import { useMutation } from "@tanstack/react-query"
import { useQueryClient } from "@tanstack/react-query"
import { createAuthClient } from "better-auth/react"
import { useCallback, useContext } from "react"

import { AuthQueryContext } from "../lib/auth-query-provider"

import { useSession } from "./use-session"

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
    const { queryOptions, listAccountsKey: queryKey, optimisticMutate } = useContext(AuthQueryContext)

    const mergedOptions = {
        ...queryOptions,
        ...options,
    }

    const queryResult = useQuery<Account[]>({
        ...mergedOptions,
        queryKey,
        queryFn: session ? (async () => {
            const data = await authClient.listAccounts({
                fetchOptions: { throw: true }
            })

            return data
        }) : skipToken
    })

    const { refetch } = queryResult

    const { mutate, error: unlinkAccountError, mutateAsync: unlinkAccountAsync } = useMutation({
        mutationFn: async (providerId: string) => await authClient.unlinkAccount({
            providerId
        }),
        // When mutate is called:
        onMutate: async (providerId) => {
            if (!optimisticMutate) return

            // Cancel any outgoing refetches
            // (so they don't overwrite our optimistic update)
            await queryClient.cancelQueries({ queryKey })

            // Snapshot the previous value
            const previousAccounts = queryClient.getQueryData(queryKey) as Account[] | undefined

            if (previousAccounts) {
                // Optimistically update to the new value
                queryClient.setQueryData(queryKey, () => {
                    return previousAccounts.filter(account => account.provider !== providerId)
                })
            }

            // Return a context object with the snapshotted value
            return { previousAccounts }
        },
        // If the mutation fails,
        // use the context returned from onMutate to roll back
        onError: (error, providerId, context) => {
            if (error) {
                console.error(error)
                queryClient.getQueryCache().config.onError?.(
                    error,
                    { queryKey } as unknown as Query<unknown, unknown, unknown, readonly unknown[]>
                )
            }

            if (!optimisticMutate || !context?.previousAccounts) return

            queryClient.setQueryData(queryKey, context.previousAccounts)
        },
        onSettled: () => {
            if (!optimisticMutate) refetch()
        }
    })

    const unlinkAccount = useCallback(async (providerId: string): Promise<{ status?: boolean, code?: string, error?: Error }> => {
        try {
            const { data, error } = await unlinkAccountAsync(providerId)
            return { status: data?.status, error: error ? new Error(error.message) : undefined }
        } catch (error) {
            return { error: error as Error }
        }
    }, [unlinkAccountAsync])

    return { ...queryResult, accounts: queryResult.data, unlinkAccount, unlinkAccountError }
}