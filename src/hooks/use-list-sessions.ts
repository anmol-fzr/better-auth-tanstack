import { type Query, skipToken } from "@tanstack/query-core"
import { type AnyUseQueryOptions, useQuery } from "@tanstack/react-query"
import { useMutation } from "@tanstack/react-query"
import { useQueryClient } from "@tanstack/react-query"
import type { createAuthClient } from "better-auth/react"
import { useCallback, useContext } from "react"

import { AuthQueryContext } from "../lib/auth-query-provider"

import type { FetchError } from "../types/fetch-error"
import { useSession } from "./use-session"

export function useListSessions<
    TAuthClient extends Omit<ReturnType<typeof createAuthClient>, "signUp">
>(
    authClient: TAuthClient,
    options?: Omit<AnyUseQueryOptions, "queryKey" | "queryFn">
) {
    type Session = TAuthClient["$Infer"]["Session"]["session"]

    const queryClient = useQueryClient()
    const { session } = useSession(authClient)
    const {
        queryOptions,
        listSessionsKey: queryKey,
        optimistic
    } = useContext(AuthQueryContext)

    const mergedOptions = {
        ...queryOptions,
        ...options
    }

    const queryResult = useQuery<Session[]>({
        ...mergedOptions,
        queryKey,
        queryFn: session
            ? async () => {
                  const data = await authClient.listSessions({
                      fetchOptions: { throw: true }
                  })

                  return data
              }
            : skipToken
    })

    const { refetch } = queryResult

    const onMutateError = (
        error: Error,
        context?: { previousSessions?: Session[] }
    ) => {
        if (error) {
            console.error(error)
            queryClient
                .getQueryCache()
                .config.onError?.(error, { queryKey } as unknown as Query<
                    unknown,
                    unknown
                >)
        }

        if (!optimistic || !context?.previousSessions) return

        queryClient.setQueryData(queryKey, context.previousSessions)
    }

    const { error: revokeSessionError, mutateAsync: revokeSessionAsync } =
        useMutation({
            mutationFn: async (token: string) =>
                await authClient.revokeSession({
                    token,
                    fetchOptions: { throw: true }
                }),
            onMutate: async (token) => {
                if (!optimistic) return
                await queryClient.cancelQueries({ queryKey })

                const previousSessions = queryClient.getQueryData(
                    queryKey
                ) as Session[]

                if (!previousSessions) return

                queryClient.setQueryData(queryKey, () => {
                    return previousSessions.filter(
                        (session) => session.token !== token
                    )
                })

                return { previousSessions }
            },
            onError: (error, _, context) => onMutateError(error, context),
            onSettled: () => refetch()
        })

    const { error: revokeSessionsError, mutateAsync: revokeSessionsAsync } =
        useMutation({
            mutationFn: async () =>
                await authClient.revokeSessions({
                    fetchOptions: { throw: true }
                }),
            onMutate: async () => {
                if (!optimistic) return
                await queryClient.cancelQueries({ queryKey })

                const previousSessions = queryClient.getQueryData(
                    queryKey
                ) as Session[]

                if (!previousSessions) return

                queryClient.setQueryData(queryKey, () => [])
                return { previousSessions }
            },
            onError: (error, _, context) => onMutateError(error, context),
            onSettled: () => refetch()
        })

    const {
        error: revokeOtherSessionsError,
        mutateAsync: revokeOtherSessionsAsync
    } = useMutation({
        mutationFn: async () =>
            await authClient.revokeOtherSessions({
                fetchOptions: { throw: true }
            }),
        onMutate: async (token) => {
            if (!optimistic) return

            await queryClient.cancelQueries({ queryKey })

            const previousSessions = queryClient.getQueryData(
                queryKey
            ) as Session[]

            if (!previousSessions) return

            queryClient.setQueryData(queryKey, () => {
                return previousSessions.filter(
                    (previousSession) =>
                        session?.token !== previousSession.token
                )
            })

            return { previousSessions }
        },
        onError: (error, _, context) => onMutateError(error, context),
        onSettled: () => refetch()
    })

    const revokeSession = useCallback(
        async (token: string) => {
            try {
                return await revokeSessionAsync(token)
            } catch (error) {
                return { error: error as FetchError }
            }
        },
        [revokeSessionAsync]
    )

    const revokeSessions = useCallback(async () => {
        try {
            return await revokeSessionsAsync()
        } catch (error) {
            return { error: error as FetchError }
        }
    }, [revokeSessionsAsync])

    const revokeOtherSessions = useCallback(async () => {
        try {
            return await revokeOtherSessionsAsync()
        } catch (error) {
            return { error: error as FetchError }
        }
    }, [revokeOtherSessionsAsync])

    return {
        ...queryResult,
        sessions: queryResult.data,
        revokeSession,
        revokeSessionError,
        revokeSessions,
        revokeSessionsError,
        revokeOtherSessions,
        revokeOtherSessionsError
    }
}
