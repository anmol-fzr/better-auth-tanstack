import { AnyUseQueryOptions, useQuery, useQueryClient } from "@tanstack/react-query"
import type { createAuthClient } from "better-auth/react"
import { decodeJwt } from "jose"
import { useContext, useEffect } from "react"

import { AuthQueryContext } from "../lib/auth-query-provider"

import { useSession } from "./use-session"

export function useToken<
    TAuthClient extends ReturnType<typeof createAuthClient>
>(
    authClient: TAuthClient,
    options?: Omit<AnyUseQueryOptions, "queryKey" | "queryFn">
) {
    const { tokenKey, tokenQueryOptions, queryOptions } = useContext(AuthQueryContext)
    const queryClient = useQueryClient()
    const { session } = useSession(authClient, options)
    const queryResult = useQuery<{ token: string } | null>({
        enabled: !!session,
        staleTime: 60 * 1000,
        ...queryOptions,
        ...tokenQueryOptions,
        ...options,
        queryKey: tokenKey || ["token"],
        queryFn: async () => authClient.$fetch("/token", { throw: true }),
    })

    const { data, refetch } = queryResult

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

    const tokenData = (!session || isTokenExpired()) ? undefined : data

    return { ...queryResult, data: tokenData, token: tokenData?.token }
}