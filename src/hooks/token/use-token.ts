import type { AnyUseQueryOptions } from "@tanstack/react-query"
import { useCallback, useEffect, useMemo } from "react"

import { useAuthQueryContext } from "../../lib/auth-query-provider"

import type { AnyAuthClient } from "../../types/any-auth-client"
import { useSession } from "../session/use-session"
import { useAuthQuery } from "../shared/use-auth-query"

export const decodeJwt = (token: string) => {
    const decode = (data: string) => {
        if (typeof Buffer === "undefined") {
            return atob(data)
        }

        return Buffer.from(data, "base64").toString()
    }
    const parts = token.split(".").map((part) => decode(part.replace(/-/g, "+").replace(/_/g, "/")))

    return JSON.parse(parts[1])
}

export function useToken<TAuthClient extends AnyAuthClient>(
    authClient: TAuthClient,
    options?: Partial<AnyUseQueryOptions>
) {
    const { data: sessionData } = useSession(authClient, options)
    const { tokenKey, tokenQueryOptions, queryOptions } = useAuthQueryContext()
    const mergedOptions = { ...queryOptions, ...tokenQueryOptions, ...options }

    const queryResult = useAuthQuery<{ token: string }>({
        authClient,
        queryKey: tokenKey,
        queryFn: ({ fetchOptions }) => authClient.$fetch("/token", fetchOptions),
        options: {
            enabled: !!sessionData && (mergedOptions.enabled ?? true)
        }
    })

    const { data, refetch, ...rest } = queryResult
    const payload = useMemo(() => (data ? decodeJwt(data.token) : null), [data])

    useEffect(() => {
        if (!data?.token) return

        const payload = decodeJwt(data.token)
        if (!payload?.exp) return

        const expiresAt = payload.exp * 1000
        const expiresIn = expiresAt - Date.now()

        const timeout = setTimeout(() => refetch(), expiresIn)

        return () => clearTimeout(timeout)
    }, [data, refetch])

    const isTokenExpired = useCallback(() => {
        if (!data?.token) return true

        const payload = decodeJwt(data.token)
        if (!payload?.exp) return true

        return payload.exp < Date.now() / 1000
    }, [data])

    useEffect(() => {
        if (!sessionData) return

        if (payload?.sub !== sessionData.user.id) {
            refetch()
        }
    }, [payload, sessionData, refetch])

    const tokenData = useMemo(
        () =>
            !sessionData || isTokenExpired() || sessionData?.user.id !== payload?.sub
                ? undefined
                : data,
        [sessionData, isTokenExpired, payload, data]
    )

    return { ...rest, data: tokenData, token: tokenData?.token, payload }
}
