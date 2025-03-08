import { type Query, skipToken } from "@tanstack/query-core"
import { type AnyUseQueryOptions, useQuery } from "@tanstack/react-query"
import { useMutation } from "@tanstack/react-query"
import { useQueryClient } from "@tanstack/react-query"
import type { createAuthClient } from "better-auth/react"
import { useCallback, useContext } from "react"

import { AuthQueryContext } from "../lib/auth-query-provider"

import type { FetchError } from "../types/fetch-error"
import { useSession } from "./use-session"

export function useListDeviceSessions<
    TAuthClient extends Omit<ReturnType<typeof createAuthClient>, "signUp">
>(
    authClient: TAuthClient,
    options?: Omit<AnyUseQueryOptions, "queryKey" | "queryFn">
) {
    type SessionData = TAuthClient["$Infer"]["Session"]
    type User = TAuthClient["$Infer"]["Session"]["user"]
    type Session = TAuthClient["$Infer"]["Session"]["session"]

    const queryClient = useQueryClient()
    const { session } = useSession(authClient)
    const {
        queryOptions,
        listDeviceSessionsKey: queryKey,
        optimistic
    } = useContext(AuthQueryContext)

    const mergedOptions = { ...queryOptions, ...options }

    const queryResult = useQuery<SessionData[]>({
        ...mergedOptions,
        queryKey,
        queryFn: session
            ? async () =>
                  // @ts-expect-error - MultiSession is an optional plugin
                  await authClient.multiSession.listDeviceSessions({
                      fetchOptions: { throw: true }
                  })
            : skipToken
    })

    const { data: deviceSessions, refetch } = queryResult

    const onMutateError = (
        error: Error,
        context?: { previousData?: SessionData[] }
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

        if (!optimistic || !context?.previousData) return

        queryClient.setQueryData(queryKey, context.previousData)
    }

    const { error: revokeSessionError, mutateAsync: revokeSessionAsync } =
        useMutation({
            mutationFn: async (sessionToken: string) =>
                // @ts-expect-error - MultiSession is an optional plugin
                await authClient.multiSession.revoke({
                    sessionToken,
                    fetchOptions: { throw: true }
                }),
            onMutate: async (sessionToken) => {
                if (!optimistic) return

                await queryClient.cancelQueries({ queryKey })

                const previousData = queryClient.getQueryData(
                    queryKey
                ) as SessionData[]

                if (!previousData) return

                queryClient.setQueryData(queryKey, () => {
                    return previousData.filter(
                        (sessionData) =>
                            sessionData.session.token !== sessionToken
                    )
                })

                return { previousData }
            },
            onError: (error, sessionToken, context) =>
                onMutateError(error, context),
            onSettled: () => refetch()
        })

    const { error: revokeSessionsError, mutateAsync: revokeSessionsAsync } =
        useMutation({
            mutationFn: async () =>
                // @ts-expect-error - MultiSession is an optional plugin
                await authClient.multiSession.revokeAll({
                    fetchOptions: { throw: true }
                }),
            onMutate: async () => {
                if (!optimistic) return

                await queryClient.cancelQueries({ queryKey })

                const previousData = queryClient.getQueryData(
                    queryKey
                ) as SessionData[]

                if (!previousData) return

                queryClient.setQueryData(queryKey, () => [])
                return { previousData }
            },
            onError: (error, _, context) => onMutateError(error, context),
            onSettled: () => refetch()
        })

    const {
        error: setActiveSessionError,
        mutateAsync: setActiveSessionAsync,
        isPending: setActiveSessionPending
    } = useMutation({
        mutationFn: async (sessionToken: string) =>
            // @ts-expect-error - MultiSession is an optional plugin
            await authClient.multiSession.setActive({
                sessionToken,
                fetchOptions: { throw: true }
            }),
        onError: (error) => onMutateError(error),
        onSettled: () => queryClient.clear()
    })

    const revokeSession = useCallback(
        async (
            sessionToken: string
        ): Promise<{
            data?: { status: boolean }
            error?: FetchError
        }> => {
            try {
                return await revokeSessionAsync(sessionToken)
            } catch (error) {
                return { error: error as FetchError }
            }
        },
        [revokeSessionAsync]
    )

    const revokeSessions = useCallback(async (): Promise<{
        data?: { status: boolean }
        error?: FetchError
    }> => {
        try {
            return await revokeSessionsAsync()
        } catch (error) {
            return { error: error as FetchError }
        }
    }, [revokeSessionsAsync])

    const setActiveSession = useCallback(
        async (
            sessionToken: string
        ): Promise<{
            data?: { session: Session; user: User }
            error?: FetchError
        }> => {
            try {
                return await setActiveSessionAsync(sessionToken)
            } catch (error) {
                return { error: error as FetchError }
            }
        },
        [setActiveSessionAsync]
    )

    return {
        ...queryResult,
        deviceSessions,
        revokeSession,
        revokeSessionError,
        revokeSessions,
        revokeSessionsError,
        setActiveSession,
        setActiveSessionPending,
        activeSessionPending: setActiveSessionPending,
        setActiveSessionError
    }
}
