import { type QueryKey, useMutation, useQueryClient } from "@tanstack/react-query"
import type { BetterFetchOption } from "better-auth/react"
import { useContext } from "react"
import type { AuthQueryOptions, NonThrowableResult, ThrowableResult } from "../.."
import { AuthQueryContext } from "../../lib/auth-query-provider"
import { useOnMutateError } from "../shared/use-mutate-error"

type MutationParams<TParams> = TParams & { fetchOptions?: BetterFetchOption }

interface UseAuthMutationOptions<TParams, TData> {
    queryKey: QueryKey
    mutationFn(params: MutationParams<TParams>): Promise<ThrowableResult | NonThrowableResult>
    optimisticData?(params: TParams, previousData: TData): TData
    options?: AuthQueryOptions
}

export function useAuthMutation<TParams, TData>({
    queryKey,
    mutationFn,
    optimisticData,
    options
}: UseAuthMutationOptions<TParams, TData>) {
    const queryClient = useQueryClient()
    const context = useContext(AuthQueryContext)
    const { optimistic } = { ...context, ...options }
    const { onMutateError } = useOnMutateError()

    const mutation = useMutation({
        mutationFn,
        onMutate: async (params: TParams) => {
            if (!optimistic || !optimisticData) return
            await queryClient.cancelQueries({ queryKey })

            const previousData = queryClient.getQueryData(queryKey)
            if (!previousData) return

            queryClient.setQueryData(queryKey, () => optimisticData(params, previousData as TData))
            return { previousData }
        },
        onError: (error, _, context) => onMutateError(error, queryKey, context),
        onSettled: () => queryClient.refetchQueries({ queryKey })
    })

    const { mutate, isPending, error } = mutation

    async function mutateAsync(
        params: TParams & { fetchOptions?: { throw?: true } | undefined }
    ): Promise<ThrowableResult>

    async function mutateAsync(
        params: TParams & { fetchOptions?: BetterFetchOption }
    ): Promise<NonThrowableResult>

    async function mutateAsync(
        params: MutationParams<TParams>
    ): Promise<ThrowableResult | NonThrowableResult> {
        return await mutation.mutateAsync(params)
    }

    return {
        ...mutation,
        mutate,
        mutateAsync,
        isPending,
        error
    }
}
