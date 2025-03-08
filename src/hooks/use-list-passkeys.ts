import { type Query, skipToken } from "@tanstack/query-core"
import { type AnyUseQueryOptions, useQuery } from "@tanstack/react-query"
import { useMutation } from "@tanstack/react-query"
import { useQueryClient } from "@tanstack/react-query"
import type { createAuthClient } from "better-auth/react"
import { useCallback, useContext } from "react"

import { AuthQueryContext } from "../lib/auth-query-provider"
import type { FetchError } from "../types/fetch-error"
import { useSession } from "./use-session"

type Passkey = {
    id: string
    name?: string
    publicKey: string
    userId: string
    credentialID: string
    counter: number
    deviceType: string
    backedUp: boolean
    transports?: string
    createdAt: Date
}

export function useListPasskeys<
    TAuthClient extends Omit<ReturnType<typeof createAuthClient>, "signUp">
>(
    authClient: TAuthClient,
    options?: Omit<AnyUseQueryOptions, "queryKey" | "queryFn">
) {
    const queryClient = useQueryClient()
    const { session } = useSession(authClient)
    const {
        queryOptions,
        listPasskeysKey: queryKey,
        optimistic
    } = useContext(AuthQueryContext)

    const mergedOptions = { ...queryOptions, ...options }

    const queryResult = useQuery<Passkey[]>({
        ...mergedOptions,
        queryKey,
        queryFn: session
            ? async () =>
                  // @ts-expect-error - This is a private API
                  await authClient.passkey.listUserPasskeys({
                      fetchOptions: { throw: true }
                  })
            : skipToken
    })

    const { refetch } = queryResult

    const { error: deletePasskeyError, mutateAsync: deletePasskeyAsync } =
        useMutation({
            mutationFn: async (id: string) =>
                // @ts-expect-error - Optional plugin
                await authClient.passkey.deletePasskey({
                    id,
                    fetchOptions: { throw: true }
                }),
            onMutate: async (id) => {
                if (!optimistic) return
                await queryClient.cancelQueries({ queryKey })

                const previousPasskeys = queryClient.getQueryData(
                    queryKey
                ) as Passkey[]

                if (!previousPasskeys) return

                queryClient.setQueryData(queryKey, () => {
                    return previousPasskeys.filter(
                        (passkey) => passkey.id !== id
                    )
                })

                return { previousPasskeys }
            },
            onError: (error, id, context) => {
                if (error) {
                    console.error(error)
                    queryClient.getQueryCache().config.onError?.(error, {
                        queryKey
                    } as unknown as Query<unknown, unknown>)
                }

                if (!optimistic || !context?.previousPasskeys) return

                queryClient.setQueryData(queryKey, context.previousPasskeys)
            },
            onSettled: () => refetch()
        })

    const deletePasskey = useCallback(
        async (
            id: string
        ): Promise<{
            data?: { status: boolean }
            error?: FetchError
        }> => {
            try {
                return await deletePasskeyAsync(id)
            } catch (error) {
                return { error: error as Error }
            }
        },
        [deletePasskeyAsync]
    )

    return {
        ...queryResult,
        passkeys: queryResult.data,
        deletePasskey,
        deletePasskeyError
    }
}
