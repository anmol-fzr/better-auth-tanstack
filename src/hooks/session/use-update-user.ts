import { useQueryClient } from "@tanstack/react-query"
import { useMutation } from "@tanstack/react-query"
import { useContext } from "react"

import type { BetterFetchOption } from "better-auth/react"
import type { AuthQueryOptions, NonThrowableResult, ThrowableResult } from "../.."
import { AuthQueryContext } from "../../lib/auth-query-provider"
import type { AuthClient } from "../../types/auth-client"
import { useOnMutateError } from "../shared/use-mutate-error"

export function useUpdateUser<TAuthClient extends AuthClient>(
    authClient: TAuthClient,
    options?: AuthQueryOptions
) {
    type SessionData = TAuthClient["$Infer"]["Session"]
    type UpdateUserParams = Parameters<TAuthClient["updateUser"]>[0] & {
        fetchOptions?: BetterFetchOption
    }

    const queryClient = useQueryClient()
    const { onMutateError } = useOnMutateError()
    const context = useContext(AuthQueryContext)
    const { sessionKey: queryKey, optimistic } = { ...context, ...options }

    const mutation = useMutation({
        mutationFn: ({ fetchOptions = { throw: true }, ...params }: UpdateUserParams) =>
            authClient.updateUser({ fetchOptions, ...params }),
        onMutate: async (params) => {
            if (!optimistic) return
            await queryClient.cancelQueries({ queryKey })

            const previousData = queryClient.getQueryData(queryKey) as SessionData
            if (!previousData) return

            queryClient.setQueryData(queryKey, {
                ...previousData,
                user: { ...previousData?.user, ...params }
            })

            return { previousData }
        },
        onError: (error, _, context) => onMutateError(error, queryKey, context),
        onSettled: () => queryClient.refetchQueries({ queryKey })
    })

    const {
        mutate: updateUser,
        mutateAsync,
        isPending: updateUserPending,
        error: updateUserError
    } = mutation

    async function updateUserAsync(
        params: UpdateUserParams & { fetchOptions?: { throw?: true } | undefined }
    ): Promise<ThrowableResult>

    async function updateUserAsync(
        params: UpdateUserParams & { fetchOptions?: BetterFetchOption }
    ): Promise<NonThrowableResult>

    async function updateUserAsync(
        params: UpdateUserParams
    ): Promise<ThrowableResult | NonThrowableResult> {
        return (await mutateAsync(params)) as ThrowableResult | NonThrowableResult
    }

    return {
        ...mutation,
        updateUser,
        updateUserAsync,
        updateUserPending,
        updateUserError
    }
}
