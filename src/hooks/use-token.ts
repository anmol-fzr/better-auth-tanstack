import { AnyUseQueryOptions, useQuery, useQueryClient } from "@tanstack/react-query"
import type { createAuthClient } from "better-auth/react"
import { decodeJwt } from "jose"
import { useContext, useEffect, useMemo } from "react"

import { AuthQueryContext } from "../lib/auth-query-provider"

import { useSession } from "./use-session"

export function useToken<
    TAuthClient extends Omit<ReturnType<typeof createAuthClient>, "signUp">
>(
    authClient: TAuthClient,
    options?: Omit<AnyUseQueryOptions, "queryKey" | "queryFn">
) {
    const queryClient = useQueryClient()
    const { tokenKey, tokenQueryOptions, queryOptions } = useContext(AuthQueryContext)
    const { user } = useSession(authClient, options)

    const mergedOptions = {
        ...queryOptions,
        ...tokenQueryOptions,
        ...options,
    }

    const queryResult = useQuery<{ token: string } | null>({
        staleTime: 600 * 1000,
        ...mergedOptions,
        enabled: !!user && (mergedOptions.enabled ?? true),
        queryKey: tokenKey!,
        queryFn: async () => {
            return await authClient.$fetch("/token", { throw: true })
        },
    })

    const { data, refetch } = queryResult
    const payload = useMemo(() => data ? decodeJwt(data.token) : null, [data])

    // useEffect(() => {
    //     if (!data) return

    //     const payload = decodeJwt(data.token)
    //     if (!payload) return

    //     if (!user) {
    //         console.log("User not found, removing token")
    //         queryClient.removeQueries({ queryKey: tokenKey! })

    //         return
    //     }

    //     if (user.id != payload?.sub) {
    //         console.log("User ID mismatch, refetching token", user, payload)
    //         queryClient.invalidateQueries({ queryKey: tokenKey! })
    //     }
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [JSON.stringify(user), JSON.stringify(data)])

    useEffect(() => {
        if (!data?.token) return

        const payload = decodeJwt(data.token)
        if (!payload?.exp) return

        const expirationTime = payload.exp * 1000
        const currentTime = Date.now()
        const timeoutDuration = expirationTime - currentTime

        const timeoutId = setTimeout(() => {
            refetch()
        }, timeoutDuration)

        return () => clearTimeout(timeoutId)
    }, [data, refetch, queryClient])

    const isTokenExpired = () => {
        if (!data?.token) return true

        const payload = decodeJwt(data.token)
        if (!payload?.exp) return true

        const currentTime = Date.now() / 1000

        return payload.exp < currentTime
    }

    const tokenData = (!user || isTokenExpired() || user?.id !== payload?.sub) ? undefined : data

    return { ...queryResult, data: tokenData, token: tokenData?.token, payload }
}