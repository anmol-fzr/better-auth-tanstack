import { useMutation } from "@tanstack/react-query"
import { useQueryClient } from "@tanstack/react-query"
import { useContext } from "react"

import { AuthQueryContext } from "../../lib/auth-query-provider"

import type { BetterFetchOption } from "better-auth/react"
import type { NonThrowableResult, ThrowableResult } from "../.."
import type { AuthClient } from "../../types/auth-client"
import { useOnMutateError } from "../shared/use-mutate-error"

export function useRevokeSession<TAuthClient extends AuthClient>(authClient: TAuthClient) {
    type Session = TAuthClient["$Infer"]["Session"]["session"]
    type RevokeSessionParams = Parameters<TAuthClient["revokeSession"]>[0]

    const queryClient = useQueryClient()
    const { onMutateError } = useOnMutateError()
    const { listSessionsKey: queryKey, optimistic } = useContext(AuthQueryContext)

    const mutation = useMutation({
        mutationFn: ({ fetchOptions = { throw: true }, ...params }: RevokeSessionParams) =>
            authClient.revokeSession({ fetchOptions, ...params }),
        onMutate: async ({ token }) => {
            if (!optimistic) return
            await queryClient.cancelQueries({ queryKey })

            const previousData = queryClient.getQueryData(queryKey) as Session[]
            if (!previousData) return

            queryClient.setQueryData(queryKey, () =>
                previousData.filter((session) => session.token !== token)
            )

            return { previousData }
        },
        onError: (error, _, context) => onMutateError(error, queryKey, context),
        onSettled: () => queryClient.refetchQueries({ queryKey })
    })

    const {
        mutate: revokeSession,
        mutateAsync,
        isPending: revokeSessionPending,
        error: revokeSessionError
    } = mutation

    async function revokeSessionAsync(
        params: RevokeSessionParams & { fetchOptions?: { throw?: true } | undefined }
    ): Promise<ThrowableResult>

    async function revokeSessionAsync(
        params: RevokeSessionParams & { fetchOptions?: BetterFetchOption }
    ): Promise<NonThrowableResult>

    async function revokeSessionAsync(
        params: RevokeSessionParams
    ): Promise<ThrowableResult | NonThrowableResult> {
        return await mutateAsync(params)
    }

    return {
        ...mutation,
        revokeSession,
        revokeSessionAsync,
        revokeSessionPending,
        revokeSessionError
    }
}
