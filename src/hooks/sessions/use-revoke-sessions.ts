import { useMutation } from "@tanstack/react-query"
import { useQueryClient } from "@tanstack/react-query"
import { useContext } from "react"

import { AuthQueryContext } from "../../lib/auth-query-provider"

import type { BetterFetchOption } from "better-auth/react"
import type { NonThrowableResult, ThrowableResult } from "../.."
import type { AuthClient } from "../../types/auth-client"
import { useOnMutateError } from "../shared/use-mutate-error"

export function useListSessions<TAuthClient extends AuthClient>(authClient: TAuthClient) {
    type Session = TAuthClient["$Infer"]["Session"]["session"]
    type RevokeSessionsParams = Parameters<TAuthClient["revokeSessions"]>[0] & {
        fetchOptions?: BetterFetchOption
    }

    const queryClient = useQueryClient()
    const { onMutateError } = useOnMutateError()
    const { listSessionsKey: queryKey, optimistic } = useContext(AuthQueryContext)

    const mutation = useMutation({
        mutationFn: ({ fetchOptions = { throw: true }, ...params }: RevokeSessionsParams) =>
            authClient.revokeSessions({
                fetchOptions,
                ...params
            }),
        onMutate: async () => {
            if (!optimistic) return
            await queryClient.cancelQueries({ queryKey })

            const previousData = queryClient.getQueryData(queryKey) as Session[]

            if (!previousData) return

            queryClient.setQueryData(queryKey, () => [])
            return { previousData }
        },
        onError: (error, _, context) => onMutateError(error, queryKey, context),
        onSettled: () => queryClient.refetchQueries({ queryKey })
    })

    const {
        mutate: revokeSessions,
        mutateAsync,
        isPending: revokeSessionsPending,
        error: revokeSessionsError
    } = mutation

    async function revokeSessionsAsync(
        params: RevokeSessionsParams & { fetchOptions?: { throw?: true } | undefined }
    ): Promise<ThrowableResult>

    async function revokeSessionsAsync(
        params: RevokeSessionsParams & { fetchOptions?: BetterFetchOption }
    ): Promise<NonThrowableResult>

    async function revokeSessionsAsync(
        params: RevokeSessionsParams
    ): Promise<ThrowableResult | NonThrowableResult> {
        return await mutateAsync(params)
    }

    return {
        ...mutation,
        revokeSessions,
        revokeSessionsAsync,
        revokeSessionsPending,
        revokeSessionsError
    }
}
