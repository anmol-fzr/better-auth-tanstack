import type { Query } from "@tanstack/query-core"
import { AnyUseQueryOptions, useQuery, useQueryClient } from "@tanstack/react-query"
import { useMutation } from "@tanstack/react-query"
import { createAuthClient } from "better-auth/react"
import { useCallback, useContext, useEffect, useState } from "react"

import { AuthQueryContext } from "../lib/auth-query-provider"

export function useSession<
    TAuthClient extends Omit<ReturnType<typeof createAuthClient>, "signUp">
>(
    authClient: TAuthClient,
    options?: Omit<AnyUseQueryOptions, "queryKey" | "queryFn">
) {
    const queryClient = useQueryClient()

    type SessionData = TAuthClient["$Infer"]["Session"]
    type User = TAuthClient["$Infer"]["Session"]["user"]
    type Session = TAuthClient["$Infer"]["Session"]["session"]
    type UpdateUser = Partial<Omit<User, "id" | "createdAt" | "updatedAt" | "email" | "emailVerified" | "isAnonymous">>

    const { queryOptions, sessionQueryOptions, sessionKey, optimisticMutate } = useContext(AuthQueryContext)
    const queryKey = sessionKey!
    const [refetchEnabled, setRefetchEnabled] = useState(false)

    const mergedOptions = {
        ...queryOptions,
        ...sessionQueryOptions,
        ...options,
    }

    const queryResult = useQuery<SessionData>({
        refetchOnWindowFocus: refetchEnabled,
        refetchOnReconnect: refetchEnabled,
        staleTime: 30 * 1000,
        ...mergedOptions,
        queryKey,
        queryFn: async () => {
            const session = await authClient.getSession({
                fetchOptions: { throw: true }
            })

            return session as SessionData
        }
    })

    const { mutate, error: mutateError, mutateAsync } = useMutation({
        mutationFn: async (variables: UpdateUser) => await authClient.updateUser({
            ...variables, fetchOptions: { throw: true }
        }),
        // When mutate is called:
        onMutate: async (variables) => {
            if (!optimisticMutate) return

            // Cancel any outgoing refetches
            // (so they don't overwrite our optimistic update)
            await queryClient.cancelQueries({ queryKey })

            // Snapshot the previous value
            const previousSessionData = queryClient.getQueryData(queryKey) as SessionData | undefined

            if (previousSessionData) {
                // Optimistically update to the new value
                queryClient.setQueryData(queryKey, () => {
                    return {
                        ...previousSessionData,
                        user: {
                            ...previousSessionData?.user,
                            ...variables
                        }
                    }
                })
            }

            // Return a context object with the snapshotted value
            return { previousSessionData }
        },
        // If the mutation fails,
        // use the context returned from onMutate to roll back
        onError: (error, variables, context) => {
            if (error) {
                console.error(error)
                queryClient.getQueryCache().config.onError?.(
                    error,
                    { queryKey } as unknown as Query<unknown, unknown, unknown, readonly unknown[]>
                )
            }

            if (!optimisticMutate || !context?.previousSessionData) return

            queryClient.setQueryData(queryKey, context.previousSessionData)
        },
        onSettled: () => {
            if (!optimisticMutate) refetch()
        }
    })

    const updateUser = useCallback(async (variables: UpdateUser): Promise<{ status: boolean, error?: Error }> => {
        try {
            return await mutateAsync(variables)
        } catch (error) {
            return { status: false, error: error as Error }
        }
    }, [mutateAsync])

    const { data, refetch } = queryResult

    useEffect(() => {
        setRefetchEnabled(!!data)

        if (!data) return

        const expiresAt = new Date(data.session.expiresAt).getTime()
        const now = new Date().getTime()
        const timeUntilExpiry = expiresAt - now

        const timeout = setTimeout(() => {
            refetch()
        }, timeUntilExpiry)

        return () => clearTimeout(timeout)
    }, [data, refetch])

    const isSessionExpired = () => {
        if (!data) return true

        const expiresAt = new Date(data.session.expiresAt).getTime()
        const now = Date.now()

        return expiresAt < now
    }

    const sessionData: SessionData | undefined = isSessionExpired() ? undefined : data
    const session = sessionData?.session as Session | undefined
    const user = sessionData?.user as User | undefined

    return { ...queryResult, data: sessionData, session, user, mutate, mutateAsync, mutateError, updateUser, updateError: mutateError }
}