import { useMutation } from "@tanstack/react-query"
import { useQueryClient } from "@tanstack/react-query"
import { useContext } from "react"

import type { BetterFetchOption } from "better-auth/react"
import type { NonThrowableResult, ThrowableResult } from "../.."
import { AuthQueryContext, type AuthQueryOptions } from "../../lib/auth-query-provider"
import type { AuthClient } from "../../types/auth-client"
import type { ListAccount } from "../../types/list-account"
import { useOnMutateError } from "../shared/use-mutate-error"

export function useUnlinkAccount<TAuthClient extends AuthClient>(
    authClient: TAuthClient,
    options?: AuthQueryOptions
) {
    type UnlinkAccountParams = Parameters<TAuthClient["unlinkAccount"]>[0]

    const queryClient = useQueryClient()
    const { onMutateError } = useOnMutateError()

    const context = useContext(AuthQueryContext)
    const { listAccountsKey: queryKey, optimistic } = { ...context, ...options }

    const mutation = useMutation({
        mutationFn: ({ fetchOptions = { throw: true }, ...params }: UnlinkAccountParams) =>
            authClient.unlinkAccount({ fetchOptions, ...params }),
        onMutate: async ({ providerId }) => {
            if (!optimistic) return
            await queryClient.cancelQueries({ queryKey })

            const previousData = queryClient.getQueryData(queryKey) as ListAccount[]
            if (!previousData) return

            queryClient.setQueryData(
                queryKey,
                previousData.filter((account) => account.provider !== providerId)
            )

            return { previousData }
        },
        onError: (error, _, context) => onMutateError(error, queryKey, context),
        onSettled: () => queryClient.refetchQueries({ queryKey })
    })

    const {
        mutate: unlinkAccount,
        mutateAsync,
        isPending: unlinkAccountPending,
        error: unlinkAccountError
    } = mutation

    async function unlinkAccountAsync(
        params: UnlinkAccountParams & { fetchOptions?: { throw?: true } | undefined }
    ): Promise<ThrowableResult>

    async function unlinkAccountAsync(
        params: UnlinkAccountParams & { fetchOptions?: BetterFetchOption }
    ): Promise<NonThrowableResult>

    async function unlinkAccountAsync(
        params: UnlinkAccountParams
    ): Promise<ThrowableResult | NonThrowableResult> {
        return await mutateAsync(params)
    }

    return {
        ...mutation,
        unlinkAccount,
        unlinkAccountAsync,
        unlinkAccountPending,
        unlinkAccountError
    }
}
